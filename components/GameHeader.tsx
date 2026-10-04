import React from 'react';
import { GamePhase, AIDifficulty } from '../game/core/types';

interface GameHeaderProps {
    phase: GamePhase;
    round: number;
    trick: number;
    showLogs: boolean;
    resetGame: () => void;
    toggleLogs: () => void;
    aiDifficulty?: AIDifficulty;
    setAiDifficulty?: (difficulty: AIDifficulty) => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
    phase,
    round,
    trick,
    showLogs,
    resetGame,
    toggleLogs,
    aiDifficulty = AIDifficulty.INTERMEDIATE,
    setAiDifficulty
}) => {
    const cycleDifficulty = () => {
        if (!setAiDifficulty) return;
        if (aiDifficulty === AIDifficulty.BEGINNER) setAiDifficulty(AIDifficulty.INTERMEDIATE);
        else if (aiDifficulty === AIDifficulty.INTERMEDIATE) setAiDifficulty(AIDifficulty.EXPERT);
        else setAiDifficulty(AIDifficulty.BEGINNER);
    };

    const getDifficultyBadge = () => {
        switch (aiDifficulty) {
            case AIDifficulty.BEGINNER:
                return {
                    label: 'IA: Fácil',
                    icon: 'fa-seedling',
                    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                };
            case AIDifficulty.EXPERT:
                return {
                    label: 'IA: Experta',
                    icon: 'fa-brain',
                    classes: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                };
            case AIDifficulty.INTERMEDIATE:
            default:
                return {
                    label: 'IA: Media',
                    icon: 'fa-chess',
                    classes: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                };
        }
    };

    const badge = getDifficultyBadge();

    return (
        <header className="px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-[#E7DFD0] bg-[#FCFAF6]/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-3">
                <img src="/assets/logo/logo.svg" alt="Tricktakers Logo" className="h-8 sm:h-10 w-auto" />
            </div>

            <div className="flex items-center gap-3">
                {/* AI Difficulty Toggle Pill */}
                {setAiDifficulty && (
                    <button
                        onClick={cycleDifficulty}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-sm ${badge.classes}`}
                        title="Cambiar nivel de la Inteligencia Artificial"
                    >
                        <i className={`fa-solid ${badge.icon} text-xs`}></i>
                        <span>{badge.label}</span>
                    </button>
                )}

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
