
import React, { useState } from 'react';
import { Trap } from '../../game/core/types';
import { TRAPS } from '../../game/core/constants';

interface StrategistTrapModalProps {
    onConfirm: (traps: Trap[]) => void;
}

export const StrategistTrapModal: React.FC<StrategistTrapModalProps> = ({ onConfirm }) => {
    const [selectedOrder, setSelectedOrder] = useState<Trap[]>([]);
    const [availableTraps, setAvailableTraps] = useState<Trap[]>(TRAPS);

    const handleSelectTrap = (trap: Trap) => {
        const newOrder = [...selectedOrder, trap];
        setSelectedOrder(newOrder);
        setAvailableTraps(availableTraps.filter(t => t.id !== trap.id));
    };

    const handleUndo = () => {
        if (selectedOrder.length === 0) return;
        const lastTrap = selectedOrder[selectedOrder.length - 1];
        setSelectedOrder(selectedOrder.slice(0, -1));
        setAvailableTraps([...availableTraps, lastTrap].sort((a, b) => a.id.localeCompare(b.id)));
    };

    const isComplete = selectedOrder.length === 5;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border-2 border-amber-500/50 p-6 rounded-xl max-w-4xl w-full shadow-2xl flex flex-col gap-6">
                <div className="text-center">
                    <h2 className="text-3xl font-black text-amber-500 uppercase tracking-widest mb-2">Plan Maestro</h2>
                    <p className="text-amber-200/70">Ordena las 5 trampas para las 5 bazas de la ronda.</p>
                </div>

                {/* Slots for the 5 Tricks */}
                <div className="flex justify-center gap-4 mb-4">
                    {[1, 2, 3, 4, 5].map((trickNum, idx) => {
                        const trap = selectedOrder[idx];
                        return (
                            <div key={trickNum} className="flex flex-col items-center gap-2">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Baza {trickNum}</div>
                                <div className={`w-32 h-44 rounded-lg border-2 flex items-center justify-center relative overflow-hidden transition-all ${trap ? 'border-amber-500 shadow-amber-500/20 shadow-lg' : 'border-slate-700 bg-slate-900/50 border-dashed'}`}>
                                    {trap ? (
                                        <img src={trap.imagePath} alt={trap.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-slate-600 font-bold text-2xl opacity-20">{trickNum}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Available Traps */}
                {!isComplete && (
                    <div className="grid grid-cols-5 gap-4">
                        {availableTraps.map(trap => (
                            <button
                                key={trap.id}
                                onClick={() => handleSelectTrap(trap)}
                                className="group relative w-full aspect-[2/3] rounded-lg overflow-hidden border border-slate-600 hover:border-amber-400 hover:scale-105 transition-all shadow-lg"
                            >
                                <img src={trap.imagePath} alt={trap.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 text-center transform translate-y-full group-hover:translate-y-0 transition-transform">
                                    <div className="text-xs font-bold text-white">{trap.name}</div>
                                    <div className="text-[10px] text-slate-300 leading-tight mt-1">{trap.description}</div>
                                </div>
                            </button>
                        ))}
                        {/* Fillers to keep grid stable if needed, but not strictly necessary with flex/grid */}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-center gap-4 mt-4 border-t border-slate-700 pt-6">
                    <button
                        onClick={handleUndo}
                        disabled={selectedOrder.length === 0}
                        className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        DESHACER
                    </button>
                    <button
                        onClick={() => onConfirm(selectedOrder)}
                        disabled={!isComplete}
                        className="px-12 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg font-black text-white shadow-lg hover:shadow-amber-500/20 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:grayscale transition-all"
                    >
                        CONFIRMAR ESTRATEGIA
                    </button>
                </div>
            </div>
        </div>
    );
};
