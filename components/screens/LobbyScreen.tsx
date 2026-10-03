import React, { useState } from 'react';
import { RoomParticipant } from '../../services/realtimeService';
import { AIDifficulty } from '../../game/core/types';

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
        <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-4 md:p-8 text-center bg-white overflow-y-auto custom-scrollbar relative">
            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center pt-4 pb-12">

                {/* Back / Leave button */}
                <button
                    onClick={onLeaveLobby}
                    className="self-start mb-6 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2"
                >
                    <i className="fa-solid fa-arrow-left"></i> Salir de la Sala
                </button>

                {/* Title and Room Code Card */}
                <div className="mb-6">
                    <span className="text-[10px] uppercase font-black tracking-widest text-teal-600 block mb-1">
                        Sala Multijugador en Tiempo Real
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                        Lobby de Torneo
                    </h2>
                </div>

                {/* Room Code Badge */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 sm:p-5 w-full max-w-md mb-8 flex flex-col items-center shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Código de Invitación
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black tracking-[0.25em] text-teal-500 font-mono">
                            {roomCode}
                        </span>
                        <button
                            onClick={handleCopyCode}
                            className="p-2.5 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all text-sm font-bold"
                            title="Copiar código"
                        >
                            <i className={`fa-solid ${copied ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                        </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2">
                        {copied ? '¡Código copiado al portapapeles!' : 'Comparte este código para que se unan hasta 4 jugadores'}
                    </span>
                </div>

                {/* Slots Grid (4 slots) */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
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
                                            ? 'bg-teal-50/50 border-teal-300 ring-2 ring-teal-100'
                                            : isDisconnected
                                            ? 'bg-amber-50 border-amber-300'
                                            : 'bg-white border-slate-200 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                                            participant.isHost ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
                                        }`}>
                                            {participant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-black text-sm text-slate-900">
                                                    {participant.name}
                                                </span>
                                                {isLocal && (
                                                    <span className="text-[9px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">
                                                        Tú
                                                    </span>
                                                )}
                                                {participant.isHost && (
                                                    <i className="fa-solid fa-crown text-amber-500 text-xs" title="Anfitrión"></i>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-semibold block">
                                                {participant.isHost ? 'Anfitrión de la Sala' : 'Jugador Conectado'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Disconnect indicator */}
                                    {isDisconnected && participant.disconnectCountdown !== null ? (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-bold animate-pulse">
                                            <i className="fa-solid fa-wifi"></i> {participant.disconnectCountdown}s
                                        </div>
                                    ) : (
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" title="En línea"></div>
                                    )}
                                </div>
                            );
                        } else {
                            // Empty slot
                            return (
                                <div
                                    key={`slot-${slotNum}`}
                                    className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between opacity-80"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs">
                                            {slotNum}
                                        </div>
                                        <div className="text-left">
                                            <span className="font-bold text-xs text-slate-500 block">
                                                {fillEmptyWithBots ? `Bot ${slotNum} (${aiDifficulty})` : `Puesto ${slotNum} Vacío`}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {fillEmptyWithBots ? 'Reemplazo automático' : 'Esperando jugador...'}
                                            </span>
                                        </div>
                                    </div>
                                    <i className={`fa-solid ${fillEmptyWithBots ? 'fa-robot text-teal-500' : 'fa-user-plus text-slate-300'}`}></i>
                                </div>
                            );
                        }
                    })}
                </div>

                {/* Host Controls */}
                {isHost && (
                    <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <span className="font-black text-xs text-slate-800 block">
                                    Llenar asientos vacíos con Bots
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    Permite empezar la partida aunque seáis 2 o 3 personas
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                checked={fillEmptyWithBots}
                                onChange={(e) => setFillEmptyWithBots(e.target.checked)}
                                className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                            />
                        </div>

                        {fillEmptyWithBots && (
                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-600">Nivel de los Bots:</span>
                                <div className="inline-flex gap-1">
                                    {(['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as AIDifficulty[]).map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setAiDifficulty(d)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                                                aiDifficulty === d
                                                    ? 'bg-teal-500 text-white shadow-sm'
                                                    : 'bg-white border text-slate-600'
                                            }`}
                                        >
                                            {d === 'BEGINNER' ? 'Fácil' : d === 'INTERMEDIATE' ? 'Medio' : 'Experto'}
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
                                ? 'bg-slate-900 text-white hover:bg-teal-600 hover:shadow-teal-500/20 active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <i className="fa-solid fa-play"></i> Iniciar Torneo ({participants.length}/4)
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs animate-pulse">
                        <i className="fa-solid fa-circle-notch fa-spin"></i> Esperando a que el anfitrión inicie el torneo...
                    </div>
                )}

            </div>
        </div>
    );
};
