import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';
import { Player, Card, CharacterType } from '../game/core/types';

export interface RoomParticipant {
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
    joinedAt: number;
    avatar?: string;
    isConnected: boolean;
    disconnectCountdown?: number | null;
}

export type RealtimeActionType =
    | 'ROOM_UPDATE'
    | 'START_GAME'
    | 'PLAY_CARD'
    | 'SELECT_CHARACTER'
    | 'PERFORM_ACTION'
    | 'DISCONNECT_WARNING'
    | 'RECONNECT'
    | 'BOT_TAKEOVER'
    | 'SYNC_PARTICIPANTS'
    | 'SYNC_FULL_STATE';

export interface RealtimeMessage {
    type: RealtimeActionType;
    senderId: string;
    roomCode: string;
    payload: any;
    timestamp: number;
}

export interface RealtimeCallbacks {
    onParticipantsChange: (participants: RoomParticipant[]) => void;
    onMessage: (message: RealtimeMessage) => void;
    onDisconnectGracePeriod: (playerId: string, secondsRemaining: number) => void;
    onPlayerReconnected: (playerId: string) => void;
    onBotTakeover: (playerId: string) => void;
}

class RealtimeService {
    private channel: RealtimeChannel | null = null;
    private broadcastChannel: BroadcastChannel | null = null;
    private currentRoomCode: string | null = null;
    private localPlayerId: string | null = null;
    private participants: Map<string, RoomParticipant> = new Map();
    private callbacks: RealtimeCallbacks | null = null;
    private disconnectTimers: Map<string, any> = new Map();

    private GRACE_PERIOD_SECONDS = 20;

    /**
     * Generates a clean 4-character room code (e.g. "KING", "TRCK")
     */
    generateRoomCode(): string {
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        return code;
    }

    /**
     * Connect to a room with player credentials
     */
    async joinRoom(
        roomCode: string,
        playerId: string,
        playerName: string,
        isHost: boolean,
        callbacks: RealtimeCallbacks
    ): Promise<boolean> {
        this.currentRoomCode = roomCode.toUpperCase();
        this.localPlayerId = playerId;
        this.callbacks = callbacks;

        const participant: RoomParticipant = {
            id: playerId,
            name: playerName,
            isHost,
            isReady: isHost,
            joinedAt: Date.now(),
            isConnected: true,
            disconnectCountdown: null
        };
        this.participants.set(playerId, participant);

        const supabase = getSupabaseClient();

        if (supabase) {
            // Live Supabase Realtime Channel
            const channelName = `tricktakers-room-${this.currentRoomCode}`;
            this.channel = supabase.channel(channelName, {
                config: {
                    presence: { key: playerId },
                    broadcast: { self: false }
                }
            });

            // Presence tracking
            this.channel
                .on('presence', { event: 'sync' }, () => {
                    const state = this.channel?.presenceState() || {};
                    this.handlePresenceSync(state);
                })
                .on('presence', { event: 'leave' }, ({ key }) => {
                    this.handlePresenceLeave(key);
                })
                .on('broadcast', { event: 'game-event' }, ({ payload }) => {
                    this.handleIncomingMessage(payload as RealtimeMessage);
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await this.channel?.track(participant);
                    }
                });
        }

        // Local Tab Broadcast fallback (for local multi-tab play & immediate testing)
        if (typeof BroadcastChannel !== 'undefined') {
            this.broadcastChannel = new BroadcastChannel(`tricktakers-${this.currentRoomCode}`);
            this.broadcastChannel.onmessage = (event) => {
                const msg = event.data as RealtimeMessage;
                if (msg && msg.roomCode === this.currentRoomCode && msg.senderId !== this.localPlayerId) {
                    this.handleIncomingMessage(msg);
                }
            };

            // Broadcast join to local tabs
            this.broadcast('ROOM_UPDATE', { participant });
        }

        this.notifyParticipants();
        return true;
    }

    /**
     * Broadcast an action to all players in the room
     */
    broadcast(type: RealtimeActionType, payload: any) {
        if (!this.currentRoomCode || !this.localPlayerId) return;

        const message: RealtimeMessage = {
            type,
            senderId: this.localPlayerId,
            roomCode: this.currentRoomCode,
            payload,
            timestamp: Date.now()
        };

        // Send via Supabase WebSocket
        if (this.channel) {
            this.channel.send({
                type: 'broadcast',
                event: 'game-event',
                payload: message
            });
        }

        // Send via HTML5 BroadcastChannel for same-device tabs
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(message);
        }
    }

    /**
     * Handles when a player disconnects: starts real grace period countdown
     */
    private handlePresenceLeave(leavingPlayerId: string) {
        if (leavingPlayerId === this.localPlayerId) return;

        const p = this.participants.get(leavingPlayerId);
        if (!p) return;

        p.isConnected = false;
        let secondsLeft = this.GRACE_PERIOD_SECONDS;
        p.disconnectCountdown = secondsLeft;
        this.notifyParticipants();

        // Clear any existing timer for this player
        if (this.disconnectTimers.has(leavingPlayerId)) {
            clearInterval(this.disconnectTimers.get(leavingPlayerId));
        }

        // Inform callbacks of countdown start
        this.callbacks?.onDisconnectGracePeriod(leavingPlayerId, secondsLeft);

        // 1-second countdown interval
        const timer = setInterval(() => {
            secondsLeft -= 1;
            p.disconnectCountdown = secondsLeft;
            this.callbacks?.onDisconnectGracePeriod(leavingPlayerId, secondsLeft);
            this.notifyParticipants();

            if (secondsLeft <= 0) {
                clearInterval(timer);
                this.disconnectTimers.delete(leavingPlayerId);
                p.disconnectCountdown = null;
                // Bot takeover!
                this.callbacks?.onBotTakeover(leavingPlayerId);
                this.broadcast('BOT_TAKEOVER', { playerId: leavingPlayerId });
            }
        }, 1000);

        this.disconnectTimers.set(leavingPlayerId, timer);
    }

    /**
     * Handles when a player reconnects within their grace period
     */
    handlePlayerReconnected(reconnectedId: string) {
        if (this.disconnectTimers.has(reconnectedId)) {
            clearInterval(this.disconnectTimers.get(reconnectedId));
            this.disconnectTimers.delete(reconnectedId);
        }

        const p = this.participants.get(reconnectedId);
        if (p) {
            p.isConnected = true;
            p.disconnectCountdown = null;
            this.notifyParticipants();
        }

        this.callbacks?.onPlayerReconnected(reconnectedId);
    }

    private handlePresenceSync(presenceState: Record<string, any[]>) {
        const activeIds = new Set<string>();

        Object.keys(presenceState).forEach(key => {
            const presences = presenceState[key];
            if (presences && presences.length > 0) {
                const remoteParticipant = presences[0] as RoomParticipant;
                activeIds.add(remoteParticipant.id);

                if (!this.participants.has(remoteParticipant.id)) {
                    this.participants.set(remoteParticipant.id, {
                        ...remoteParticipant,
                        isConnected: true,
                        disconnectCountdown: null
                    });
                } else {
                    const existing = this.participants.get(remoteParticipant.id)!;
                    existing.isConnected = true;
                    existing.disconnectCountdown = null;
                    if (this.disconnectTimers.has(remoteParticipant.id)) {
                        this.handlePlayerReconnected(remoteParticipant.id);
                    }
                }
            }
        });

        this.notifyParticipants();
    }

    private handleIncomingMessage(message: RealtimeMessage) {
        if (message.type === 'ROOM_UPDATE' && message.payload?.participant) {
            const p = message.payload.participant as RoomParticipant;
            this.participants.set(p.id, p);
            this.notifyParticipants();

            // If this node is host, reply with full list of participants to sync guest
            const myParticipant = this.localPlayerId ? this.participants.get(this.localPlayerId) : null;
            if (myParticipant?.isHost) {
                this.broadcast('SYNC_PARTICIPANTS', {
                    participants: Array.from(this.participants.values())
                });
            }
        } else if (message.type === 'SYNC_PARTICIPANTS' && Array.isArray(message.payload?.participants)) {
            message.payload.participants.forEach((part: RoomParticipant) => {
                this.participants.set(part.id, part);
            });
            this.notifyParticipants();
        } else if (message.type === 'RECONNECT') {
            const reconnectedId = message.payload?.playerId || message.payload?.participantId;
            if (reconnectedId) {
                this.handlePlayerReconnected(reconnectedId);
            }
        } else if (message.type === 'BOT_TAKEOVER') {
            this.callbacks?.onBotTakeover(message.payload?.playerId);
        }

        this.callbacks?.onMessage(message);
    }

    private notifyParticipants() {
        const list = Array.from(this.participants.values());
        this.callbacks?.onParticipantsChange(list);
    }

    /**
     * Leave current room and cleanup channels
     */
    leaveRoom() {
        if (this.channel) {
            this.channel.unsubscribe();
            this.channel = null;
        }

        if (this.broadcastChannel) {
            this.broadcastChannel.close();
            this.broadcastChannel = null;
        }

        for (const timer of this.disconnectTimers.values()) {
            clearInterval(timer);
        }
        this.disconnectTimers.clear();
        this.participants.clear();
        this.currentRoomCode = null;
        this.localPlayerId = null;
        this.callbacks = null;
    }

    getCurrentParticipants(): RoomParticipant[] {
        return Array.from(this.participants.values());
    }

    getRoomCode(): string | null {
        return this.currentRoomCode;
    }
}

export const realtimeService = new RealtimeService();
