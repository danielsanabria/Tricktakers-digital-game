
import React, { useState } from 'react';
import { Player } from '../../game/core/types';
import { TASKS } from '../../game/core/constants';

interface RulerSetupModalProps {
    otherPlayers: Player[];
    onConfirm: (assignments: Record<string, string>) => void;
}

export const RulerSetupModal: React.FC<RulerSetupModalProps> = ({ otherPlayers, onConfirm }) => {
    const [assignments, setAssignments] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        otherPlayers.forEach(p => initial[p.id] = TASKS[0].id);
        return initial;
    });

    const handleConfirm = () => {
        onConfirm(assignments);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-xl border border-amber-500/50 p-6 max-w-2xl w-full shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
                        <span className="text-4xl">👑</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-amber-500 tracking-tighter uppercase italic">Gubernatura</h2>
                        <p className="text-amber-200/60 text-sm">Asigna una tarea a cada súbdito. Si todos las cumplen, ganarás +10 pts.</p>
                    </div>
                </div>

                <div className="space-y-6 mb-8">
                    {otherPlayers.map(player => (
                        <div key={player.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-white uppercase">{player.name}</span>
                                <span className="text-xs text-slate-500">ID: {player.id}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {TASKS.map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => setAssignments(prev => ({ ...prev, [player.id]: task.id }))}
                                        className={`p-2 rounded border text-left transition-all text-xs h-full ${assignments[player.id] === task.id
                                            ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                            : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        <div className="font-bold">{task.name}</div>
                                        <div className="opacity-60 leading-tight">{task.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleConfirm}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_4px_0_rgb(180,130,10)] active:translate-y-1 active:shadow-none"
                >
                    Promulgar Decretos
                </button>
            </div>
        </div>
    );
};
