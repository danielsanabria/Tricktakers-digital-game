import React from 'react';
import { GamePhase } from '../game/core/types';

interface GameHeaderProps {
    phase: GamePhase;
    round: number;
    trick: number;
    showLogs: boolean;
    resetGame: () => void;
    toggleLogs: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
    phase,
    round,
    trick,
    showLogs,
    resetGame,
    toggleLogs
}) => {
    return (
        <header className="px-6 pt-10 pb-4 md:py-4 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-4">
                <img src="/assets/logo/logo.svg" alt="Tricktakers Logo" className="h-10 w-auto" />
            </div>

            <div className="flex items-center gap-4">
                {phase === GamePhase.TRICK_PLAYING && (
                    <div className="hidden sm:flex gap-6 items-center bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                        <div className="text-center">
                            <span className="block text-[8px] font-black text-slate-400 uppercase">Ronda</span>
                            <span className="font-black text-xs text-slate-900">{round}/3</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-[8px] font-black text-slate-400 uppercase">Baza</span>
                            <span className="font-black text-xs text-teal-500">{trick}/5</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button
                        onClick={resetGame}
                        className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-rose-600 transition-all"
                        title="Reiniciar"
                    >
                        <i className="fa-solid fa-arrow-rotate-left text-sm"></i>
                    </button>

                    <button
                        onClick={toggleLogs}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${showLogs ? 'bg-teal-500 text-white' : 'bg-white text-slate-600'}`}
                        title="Log"
                    >
                        <i className="fa-solid fa-list-ul text-sm"></i>
                    </button>
                </div>
            </div>
        </header>
    );
};
