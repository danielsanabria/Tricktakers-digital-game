import React, { useState } from 'react';
import { RoomParticipant } from '../../services/realtimeService';
import { AIDifficulty } from '../../game/core/types';
import { useTranslation } from '../../i18n/LanguageContext';
import { LanguageSelector } from '../LanguageSelector';

interface LobbyScreenProps {
    roomCode: string;
    participants: RoomParticipant[];
    localPlayerId: string;
    isHost: boolean;
    fillEmptyWithBots: boolean;
    setFillEmptyWithBots: (fill: boolean) => void;
    aiDifficulty: AIDifficulty;
    setAiDifficulty: (d: AIDifficulty) => void;
    onStartGame: () => void;
    onLeaveLobby: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
    roomCode,
    participants,
    localPlayerId,
    isHost,
    fillEmptyWithBots,
    setFillEmptyWithBots,
    aiDifficulty,
    setAiDifficulty,
    onStartGame,
    onLeaveLobby
}) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const maxSlots = 4;
    const slots = [];
    for (let i = 0; i < maxSlots; i++) {
        slots.push(participants[i] || null);
    }

    const canStart = isHost && (participants.length >= 2 || (participants.length >= 1 && fillEmptyWithBots));

    return (
        <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-4 md:p-8 text-center bg-transparent overflow-y-auto custom-scrollbar relative">
            <div className="relative z-10 w-full max-w-2xl bg-[#FCFAF6]/98 backdrop-blur-xl rounded-2xl sm:rounded-[2.5rem] border-2 border-[#E7DFD0] shadow-2xl p-5 sm:p-8 md:p-10 flex flex-col items-center my-auto">

                {/* Back / Leave button */}
                <div className="w-full flex items-center justify-start mb-5 sm:mb-6">
                    <button
                        onClick={onLeaveLobby}
                        className="px-4 py-2 rounded-xl bg-[#EFE9DC] hover:bg-[#E5DDCB] text-[#6B5E4F] text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
                    >
                        <i className="fa-solid fa-arrow-left"></i> {t('lobby.leaveLobby')}
                    </button>
                </div>

                {/* Title and Room Code Card */}
                <div className="mb-5 sm:mb-6">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#966E0F] block mb-1">
                        {t('home.multiplayerTitle')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#23272E] uppercase tracking-tight">
                        {t('lobby.waitingForPlayers')}
                    </h2>
                </div>

                {/* Room Code Badge */}
                <div className="bg-[#F7F2E8] border-2 border-[#D8CFBC] rounded-2xl p-4 sm:p-5 w-full max-w-md mb-6 sm:mb-8 flex flex-col items-center shadow-sm">
                    <span className="text-xs font-bold text-[#7D7060] uppercase tracking-wider mb-1">
                        {t('lobby.roomCode')}
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl sm:text-4xl font-black tracking-[0.25em] text-[#966E0F] font-mono">
                            {roomCode}
                        </span>
                        <button
                            onClick={handleCopyCode}
                            className="p-2.5 rounded-xl bg-white border border-[#D8CFBC] text-[#966E0F] hover:bg-[#EFE9DC] transition-all text-sm font-bold shadow-sm active:scale-95"
                            title={t('common.copy')}
                        >
                            <i className={`fa-solid ${copied ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                        </button>
                    </div>
                    <span className="text-[10px] text-[#7D7060] mt-2 font-medium">
                        {copied ? t('common.copied') : t('lobby.shareCodeHint')}
                    </span>
                </div>

                {/* Slots Grid (4 slots) */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6 sm:mb-8">
                    {slots.map((participant, index) => {
                        const slotNum = index + 1;
                        if (participant) {
                            const isLocal = participant.id === localPlayerId;
                            const isDisconnected = !participant.isConnected;
                            return (
                                <div
                                    key={participant.id}
                                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                        isLocal
                                            ? 'bg-[#FAF4E6] border-[#C59B27] ring-2 ring-[#F0DFC0]'
                                            : isDisconnected
                                            ? 'bg-amber-50 border-amber-300'
                                            : 'bg-white border-[#E7DFD0] shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                                            participant.isHost ? 'bg-[#C59B27] text-stone-950' : 'bg-[#23272E] text-white'
                                        }`}>
                                            {participant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-black text-sm text-[#23272E]">
                                                    {participant.name}
                                                </span>
                                                {isLocal && (
                                                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black border border-amber-300">
                                                        {t('common.you')}
                                                    </span>
                                                )}
                                                {participant.isHost && (
                                                    <i className="fa-solid fa-crown text-[#C59B27] text-xs" title={t('common.host')}></i>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-[#7D7060] font-semibold block">
                                                {participant.isHost ? t('common.host') : t('lobby.playerSlot')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Disconnect indicator */}
                                    {isDisconnected && participant.disconnectCountdown !== null ? (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-bold animate-pulse">
                                            <i className="fa-solid fa-wifi"></i> {participant.disconnectCountdown}s
                                        </div>
                                    ) : (
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="Online"></div>
                                    )}
                                </div>
                            );
                        } else {
                            // Empty slot
                            return (
                                <div
                                    key={`slot-${slotNum}`}
                                    className="p-4 rounded-2xl border-2 border-dashed border-[#D8CFBC] bg-[#F7F2E8]/60 flex items-center justify-between opacity-80"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#EFE9DC] text-[#7D7060] flex items-center justify-center font-bold text-xs">
                                            {slotNum}
                                        </div>
                                        <div className="text-left">
                                            <span className="font-bold text-xs text-[#6B5E4F] block">
                                                {fillEmptyWithBots ? `${t('common.bot')} ${slotNum} (${aiDifficulty})` : `${t('lobby.openSlot')} ${slotNum}`}
                                            </span>
                                            <span className="text-[10px] text-[#A09382]">
                                                {fillEmptyWithBots ? 'AI' : t('lobby.waitingForPlayers')}
                                            </span>
                                        </div>
                                    </div>
                                    <i className={`fa-solid ${fillEmptyWithBots ? 'fa-robot text-[#966E0F]' : 'fa-user-plus text-[#C8C0B2]'}`}></i>
                                </div>
                            );
                        }
                    })}
                </div>

                {/* Host Controls */}
                {isHost && (
                    <div className="w-full max-w-md bg-[#F7F2E8] border border-[#D8CFBC] rounded-2xl p-4 mb-6 text-left">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <span className="font-black text-xs text-[#23272E] block">
                                    {t('lobby.fillBotsLabel')}
                                </span>
                                <span className="text-[10px] text-[#7D7060]">
                                    (2-4 Players)
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                checked={fillEmptyWithBots}
                                onChange={(e) => setFillEmptyWithBots(e.target.checked)}
                                className="w-5 h-5 accent-[#C59B27] rounded cursor-pointer"
                            />
                        </div>

                        {fillEmptyWithBots && (
                            <div className="pt-2 border-t border-[#D8CFBC] flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#6B5E4F]">{t('lobby.botDifficultyLabel')}:</span>
                                <div className="inline-flex gap-1">
                                    {(['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as AIDifficulty[]).map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setAiDifficulty(d)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                                                aiDifficulty === d
                                                    ? d === 'BEGINNER'
                                                        ? 'bg-[#3E6B52] text-white shadow-sm'
                                                        : d === 'INTERMEDIATE'
                                                        ? 'bg-[#B88222] text-white shadow-sm'
                                                        : 'bg-[#6B3E7A] text-white shadow-sm'
                                                    : 'bg-white border border-[#D8CFBC] text-[#6B5E4F]'
                                            }`}
                                        >
                                            {d === 'BEGINNER' ? t('home.aiBeginner') : d === 'INTERMEDIATE' ? t('home.aiIntermediate') : t('home.aiExpert')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Start or Waiting Action */}
                {isHost ? (
                    <button
                        onClick={onStartGame}
                        disabled={!canStart}
                        className={`w-full max-w-md py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                            canStart
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-950/20 active:scale-95'
                                : 'bg-[#E5DDCB] text-[#A09382] cursor-not-allowed'
                        }`}
                    >
                        <i className="fa-solid fa-play"></i> {t('lobby.startGame')} ({participants.length}/4)
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-[#7D7060] font-bold text-xs animate-pulse">
                        <i className="fa-solid fa-circle-notch fa-spin text-[#C59B27]"></i> {t('lobby.waitingHost')}
                    </div>
                )}

                {/* Language Selector at bottom */}
                <div className="mt-6 pt-4 border-t border-[#E7DFD0]/80 w-full flex items-center justify-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#8C7D6B]">
                        {t('common.language')}:
                    </span>
                    <LanguageSelector />
                </div>

            </div>
        </div>
    );
};
