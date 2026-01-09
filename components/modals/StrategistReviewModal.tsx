
import React from 'react';
import { Trap } from '../../game/core/types';

interface StrategistReviewModalProps {
    traps: Trap[];
    onClose: () => void;
    currentTrick: number;
}

export const StrategistReviewModal: React.FC<StrategistReviewModalProps> = ({ traps, onClose, currentTrick }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-slate-800 border-2 border-slate-600 p-6 rounded-xl max-w-4xl w-full shadow-2xl flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                <div className="text-center flex justify-between items-center">
                    <h2 className="text-2xl font-black text-amber-500 uppercase tracking-widest pl-8">Estrategia Actual</h2>
                    <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors bg-white/5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                <div className="flex justify-center gap-4 mb-4">
                    {[1, 2, 3, 4, 5].map((trickNum, idx) => {
                        const trap = traps[idx];
                        const isPast = trickNum < currentTrick;
                        const isCurrent = trickNum === currentTrick;

                        return (
                            <div key={trickNum} className={`flex flex-col items-center gap-2 ${isPast ? 'opacity-50 grayscale' : ''}`}>
                                <div className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                                    Baza {trickNum} {isCurrent && '(Actual)'}
                                </div>
                                <div className={`w-28 h-40 rounded-lg border-2 flex items-center justify-center relative overflow-hidden transition-all ${isCurrent ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105' : 'border-slate-700 bg-slate-900/50'}`}>
                                    {trap ? (
                                        <div className="relative w-full h-full group">
                                            <img src={trap.imagePath} alt={trap.name} className="w-full h-full object-cover" />
                                            {/* Tooltipish overlay */}
                                            <div className="absolute inset-x-0 bottom-0 bg-black/90 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                                                <p className="text-[9px] text-white font-bold leading-tight">{trap.name}</p>
                                                <p className="text-[8px] text-slate-300 leading-tight mt-1">{trap.description}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-slate-600 font-bold text-2xl opacity-20">?</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-slate-500">Tus trampas se revelan automáticamente al inicio de cada baza.</p>
            </div>
        </div>
    );
};
