
import React from 'react';
import { RoundResult, CharacterType } from '../../game/core/types';
import { CHARACTERS } from '../../game/core/constants';

interface RoundSummaryModalProps {
    result: RoundResult | null;
    onNext: () => void;
    isLastRound: boolean;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({ result, onNext, isLastRound }) => {
    if (!result) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-3xl w-full shadow-2xl my-auto">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">
                        Resumen de la Ronda {result.round}
                    </h2>
                    <div className="h-1.5 w-24 bg-teal-500 mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="space-y-4 mb-10">
                    {result.playerResults.map((pr) => {
                        const char = pr.character ? CHARACTERS[pr.character] : null;

                        return (
                            <div key={pr.playerId} className="bg-slate-50 rounded-2xl p-4 flex items-center gap-6 border border-slate-100 transition-all hover:bg-slate-100">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border-2 border-white shadow-md">
                                        {char && (
                                            <img
                                                src={char.imagePath}
                                                alt={char.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className={`absolute -bottom-2 -right-2 px-2 py-1 rounded-md text-[10px] font-black text-white shadow-lg ${pr.playerId === 'p1' ? 'bg-teal-500' : 'bg-slate-600'}`}>
                                        {pr.playerName === 'Tú' ? 'TÚ' : pr.playerName}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="font-black text-slate-800 text-lg uppercase">
                                        {char?.name || '---'}
                                    </div>
                                    <div className="flex gap-4 mt-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-400 text-xs font-bold uppercase">Bazas:</span>
                                            <span className="text-slate-700 font-black">{pr.tricksWon}</span>
                                        </div>
                                        {pr.goldCrownsGained > 0 && (
                                            <div className="flex items-center gap-1 text-amber-500 group">
                                                <span className="text-xl">👑</span>
                                                <span className="text-xs font-black">+ {pr.goldCrownsGained}</span>
                                            </div>
                                        )}
                                        {pr.blackCrownsGained > 0 && (
                                            <div className="flex items-center gap-1 text-slate-900">
                                                <span className="text-xl">💀</span>
                                                <span className="text-xs font-black">+ {pr.blackCrownsGained}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm font-black text-teal-600">
                                        {pr.pointsGained >= 0 ? `+${pr.pointsGained}` : pr.pointsGained} pts
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</div>
                                    <div className="text-2xl font-black text-slate-800 leading-none">
                                        {pr.totalScore}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onNext}
                        className="group relative px-10 py-5 bg-slate-900 rounded-2xl text-white font-black text-xl uppercase tracking-widest transition-all hover:bg-teal-600 hover:-translate-y-1 active:translate-y-0 shadow-lg"
                    >
                        <span className="relative z-10">
                            {isLastRound ? 'Ver Ganador Final' : 'Siguiente Ronda'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
