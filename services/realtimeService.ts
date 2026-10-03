import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';
import Peer, { DataConnection } from 'peerjs';

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
    msgId?: string;
}

export interface RealtimeCallbacks {
    onParticipantsChange: (participants: RoomParticipant[]) => void;
    onMessage: (message: RealtimeMessage) => void;
    onDisconnectGracePeriod: (playerId: string, secondsRemaining: number) => void;
    onPlayerReconnected: (playerId: string) => void;
    onBotTakeover: (playerId: string) => void;
}

function getPeerConstructor(): any {
    if (typeof window !== 'undefined' && (window as any).Peer) {
        return (window as any).Peer;
    }
    return Peer;
}

class RealtimeService {
    private channel: RealtimeChannel | null = null;
    private broadcastChannel: BroadcastChannel | null = null;
    private storageListener: ((e: StorageEvent) => void) | null = null;
    private processedMsgIds: Set<string> = new Set();
    private currentRoomCode: string | null = null;
    private localPlayerId: string | null = null;
    private isHost: boolean = false;
    private participants: Map<string, RoomParticipant> = new Map();
    private callbacks: RealtimeCallbacks | null = null;
    private disconnectTimers: Map<string, any> = new Map();

    // WebRTC PeerJS State for Cross-Browser & Cross-Device P2P
    private peer: any = null;
    private hostConnection: any = null;
    private peerConnections: Map<string, any> = new Map();
    private guestRetryTimeout: any = null;
    private guestRetryAttempts: number = 0;

    private GRACE_PERIOD_SECONDS = 20;

    updateCallbacks(callbacks: RealtimeCallbacks) {
        this.callbacks = callbacks;
    }

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
        this.leaveRoom(); // Clean up any existing connection first

        this.currentRoomCode = roomCode.toUpperCase();
        this.localPlayerId = playerId;
        this.isHost = isHost;
        this.callbacks = callbacks;
        this.guestRetryAttempts = 0;

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

        // 1. Initialize WebRTC P2P (PeerJS) for Cross-Device / Cross-Browser Connectivity
        this.setupWebRTCPeer(participant);

        // 2. Initialize Supabase Realtime Channel if configured
        const supabase = getSupabaseClient();
        if (supabase) {
            const channelName = `tricktakers-room-${this.currentRoomCode}`;
            this.channel = supabase.channel(channelName, {
                config: {
                    presence: { key: playerId },
                    broadcast: { self: false }
                }
            });

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

        // 3. Local Tab Broadcast fallback (for same-browser tab play)
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                this.broadcastChannel = new BroadcastChannel(`tricktakers-${this.currentRoomCode}`);
                this.broadcastChannel.onmessage = (event) => {
                    const msg = event.data as RealtimeMessage;
                    if (msg && msg.roomCode === this.currentRoomCode && msg.senderId !== this.localPlayerId) {
                        this.handleIncomingMessage(msg);
                    }
                };
            } catch (err) {}
        }

        // 4. Secondary fallback: window storage event across browser windows
        if (typeof window !== 'undefined') {
            this.storageListener = (e: StorageEvent) => {
                if (e.key === `tricktakers_bus_${this.currentRoomCode}` && e.newValue) {
                    try {
                        const msg = JSON.parse(e.newValue) as RealtimeMessage;
                        if (msg && msg.roomCode === this.currentRoomCode && msg.senderId !== this.localPlayerId) {
                            this.handleIncomingMessage(msg);
                        }
                    } catch (err) {}
                }
            };
            window.addEventListener('storage', this.storageListener);
        }

        // Broadcast join message across buses
        this.broadcast('ROOM_UPDATE', { participant });
        this.notifyParticipants();
        return true;
    }

    /**
     * WebRTC P2P setup via PeerJS
     */
    private setupWebRTCPeer(participant: RoomParticipant) {
        if (!this.currentRoomCode) return;
        const hostPeerId = `tricktakers-room-${this.currentRoomCode}`;
        const PeerClass = getPeerConstructor();

        if (this.isHost) {
            // HOST: Registers the canonical room ID
            try {
                this.peer = new PeerClass(hostPeerId, {
                    debug: 0,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' }
                        ]
                    }
                });

                this.peer.on('connection', (conn: any) => {
                    this.peerConnections.set(conn.peer, conn);

                    conn.on('open', () => {
                        // Immediately sync current participants with the connected guest
                        const msg = this.createMessage('SYNC_PARTICIPANTS', {
                            participants: this.getCurrentParticipants()
                        });
                        try { conn.send(msg); } catch (e) {}
                    });

                    conn.on('data', (data: any) => {
                        this.handleIncomingMessage(data as RealtimeMessage);
                        // Host relays messages from one guest to other guests if needed
                        if (data && data.senderId !== this.localPlayerId) {
                            this.peerConnections.forEach((otherConn, otherPeerId) => {
                                if (otherPeerId !== conn.peer && otherConn && otherConn.open) {
                                    try { otherConn.send(data); } catch (e) {}
                                }
                            });
                        }
                    });

                    conn.on('close', () => {
                        this.peerConnections.delete(conn.peer);
                    });

                    conn.on('error', (err: any) => {
                        console.warn('[PeerJS Host Connection Error]:', err);
                    });
                });

                this.peer.on('error', (err: any) => {
                    console.warn('[PeerJS Host Error]:', err);
                });
            } catch (err) {
                console.warn('[PeerJS Host Init Error]:', err);
            }
        } else {
            // GUEST: Creates an ephemeral peer and connects to the Host's peer ID
            try {
                this.peer = new PeerClass({
                    debug: 0,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' }
                        ]
                    }
                });

                this.peer.on('open', () => {
                    this.connectGuestToHost(hostPeerId, participant);
                });

                this.peer.on('error', (err: any) => {
                    console.warn('[PeerJS Guest Error]:', err);
                    if (err.type === 'peer-unavailable' && this.guestRetryAttempts < 6) {
                        this.scheduleGuestReconnect(hostPeerId, participant);
                    }
                });
            } catch (err) {
                console.warn('[PeerJS Guest Init Error]:', err);
            }
        }
    }

    private connectGuestToHost(hostPeerId: string, participant: RoomParticipant) {
        if (!this.peer || this.peer.destroyed) return;
        try {
            const conn = this.peer.connect(hostPeerId, { reliable: true });
            this.hostConnection = conn;

            conn.on('open', () => {
                this.guestRetryAttempts = 0;
                // Send ROOM_UPDATE to Host
                const msg = this.createMessage('ROOM_UPDATE', { participant });
                try { conn.send(msg); } catch (e) {}
            });

            conn.on('data', (data: any) => {
                this.handleIncomingMessage(data as RealtimeMessage);
            });

            conn.on('close', () => {
                this.hostConnection = null;
            });

            conn.on('error', (err: any) => {
                console.warn('[PeerJS Guest Conn Error]:', err);
            });
        } catch (e) {
            console.warn('[PeerJS Connect to Host Error]:', e);
        }
    }

    private scheduleGuestReconnect(hostPeerId: string, participant: RoomParticipant) {
        if (this.guestRetryTimeout) clearTimeout(this.guestRetryTimeout);
        this.guestRetryAttempts++;
        this.guestRetryTimeout = setTimeout(() => {
            this.connectGuestToHost(hostPeerId, participant);
        }, 1200);
    }

    private createMessage(type: RealtimeActionType, payload: any): RealtimeMessage {
        const msgId = `${this.localPlayerId || 'anon'}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        return {
            type,
            senderId: this.localPlayerId || '',
            roomCode: this.currentRoomCode || '',
            payload,
            timestamp: Date.now(),
            msgId
        };
    }

    /**
     * Broadcast an action to all players in the room across all communication channels
     */
    broadcast(type: RealtimeActionType, payload: any) {
        if (!this.currentRoomCode || !this.localPlayerId) return;

        const message = this.createMessage(type, payload);
        if (message.msgId) {
            this.processedMsgIds.add(message.msgId);
        }

        // 1. WebRTC P2P direct transmission
        if (this.isHost) {
            this.peerConnections.forEach((conn) => {
                if (conn && conn.open) {
                    try { conn.send(message); } catch (e) {}
                }
            });
        } else {
            if (this.hostConnection && this.hostConnection.open) {
                try { this.hostConnection.send(message); } catch (e) {}
            }
        }

        // 2. Supabase WebSocket channel (if configured)
        if (this.channel) {
            try {
                this.channel.send({
                    type: 'broadcast',
                    event: 'game-event',
                    payload: message
                });
            } catch (err) {}
        }

        // 3. HTML5 BroadcastChannel for same-device tabs
        if (this.broadcastChannel) {
            try {
                this.broadcastChannel.postMessage(message);
            } catch (err) {}
        }

        // 4. LocalStorage bus for cross-window redundancy
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                window.localStorage.setItem(`tricktakers_bus_${this.currentRoomCode}`, JSON.stringify(message));
            } catch (err) {}
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
        Object.keys(presenceState).forEach(key => {
            const presences = presenceState[key];
            if (presences && presences.length > 0) {
                const remoteParticipant = presences[0] as RoomParticipant;

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
        if (message.msgId) {
            if (this.processedMsgIds.has(message.msgId)) return;
            this.processedMsgIds.add(message.msgId);
            if (this.processedMsgIds.size > 300) {
                const arr = Array.from(this.processedMsgIds);
                this.processedMsgIds = new Set(arr.slice(-150));
            }
        }

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
     * Leave current room and cleanup all WebRTC, WebSocket, and broadcast channels
     */
    leaveRoom() {
        if (this.guestRetryTimeout) {
            clearTimeout(this.guestRetryTimeout);
            this.guestRetryTimeout = null;
        }

        if (this.hostConnection) {
            try { this.hostConnection.close(); } catch (e) {}
            this.hostConnection = null;
        }

        this.peerConnections.forEach(conn => {
            try { conn.close(); } catch (e) {}
        });
        this.peerConnections.clear();

        if (this.peer) {
            try { this.peer.destroy(); } catch (e) {}
            this.peer = null;
        }

        if (this.channel) {
            try { this.channel.unsubscribe(); } catch (e) {}
            this.channel = null;
        }

        if (this.broadcastChannel) {
            try { this.broadcastChannel.close(); } catch (e) {}
            this.broadcastChannel = null;
        }

        if (this.storageListener && typeof window !== 'undefined') {
            window.removeEventListener('storage', this.storageListener);
            this.storageListener = null;
        }

        for (const timer of this.disconnectTimers.values()) {
            clearInterval(timer);
        }
        this.disconnectTimers.clear();
        this.participants.clear();
        this.currentRoomCode = null;
        this.localPlayerId = null;
        this.isHost = false;
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
