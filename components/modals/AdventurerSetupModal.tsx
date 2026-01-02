
import React, { useState } from 'react';
import { ITEMS } from '../../game/core/constants';

interface AdventurerSetupModalProps {
    onConfirm: (redId: string, blueId: string) => void;
}

export const AdventurerSetupModal: React.FC<AdventurerSetupModalProps> = ({ onConfirm }) => {
    const [red, setRed] = useState<string | null>(null);
    const [blue, setBlue] = useState<string | null>(null);

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 max-w-2xl w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <span className="text-3xl">🎒</span> Preparación de Aventurero
                </h2>
                <p className="text-slate-300 mb-6">Elige tus 2 objetos iniciales para la partida:</p>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-red-400 mb-2 uppercase tracking-wider">Objeto Rojo</label>
                        <div className="grid grid-cols-1 gap-2">
                            {ITEMS.filter(i => i.type === 'RED' && ['it-4', 'it-5', 'it-6'].includes(i.id)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setRed(item.id)}
                                    className={`p-3 rounded-lg border text-left transition-all ${red === item.id
                                        ? 'bg-red-900/50 border-red-500 ring-2 ring-red-500/50'
                                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                                >
                                    <div className="font-bold text-white">{item.name}</div>
                                    <div className="text-xs text-slate-400 mt-1">{item.description}</div>
                                    <div className="text-xs text-amber-500/80 mt-1">No usado: {item.unusedPoints} pts</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Objeto Azul</label>
                        <div className="grid grid-cols-1 gap-2">
                            {ITEMS.filter(i => i.type === 'BLUE' && ['it-1', 'it-2', 'it-3'].includes(i.id)).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setBlue(item.id)}
                                    className={`p-3 rounded-lg border text-left transition-all ${blue === item.id
                                        ? 'bg-blue-900/50 border-blue-500 ring-2 ring-blue-500/50'
                                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                                >
                                    <div className="font-bold text-white">{item.name}</div>
                                    <div className="text-xs text-slate-400 mt-1">{item.description}</div>
                                    <div className="text-xs text-amber-500/80 mt-1">No usado: {item.unusedPoints} pts</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                    <button
                        onClick={() => {
                            if (red && blue) {
                                onConfirm(red, blue);
                            }
                        }}
                        disabled={!red || !blue}
                        className="btn btn-amber disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                        Confirmar Equipo
                    </button>
                </div>
            </div>
        </div>
    );
};
