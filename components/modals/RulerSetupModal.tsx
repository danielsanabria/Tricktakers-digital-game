import React, { useState } from 'react';
import { Player } from '../../game/core/types';
import { TASKS } from '../../game/core/constants';

interface RulerSetupModalProps {
    otherPlayers: Player[];
    onConfirm: (assignments: Record<string, string>) => void;
}

export const RulerSetupModal: React.FC<RulerSetupModalProps> = ({ otherPlayers, onConfirm }) => {
    const [assignments, setAssignments] = useState<Record<string, string>>({});
    const [activePlayerId, setActivePlayerId] = useState<string>(otherPlayers[0]?.id || '');

    const handleAssign = (taskId: string) => {
        // Check if this task is already assigned to ANOTHER player (enforcing unique cards)
        const isAssignedToOther = Object.entries(assignments).some(([pid, tid]) => pid !== activePlayerId && tid === taskId);
        if (isAssignedToOther) return; // Prevent duplicate assignment

        setAssignments(prev => ({
            ...prev,
            [activePlayerId]: taskId
        }));
    };

    const isComplete = otherPlayers.every(p => assignments[p.id]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl border border-amber-500/30 w-full max-w-6xl h-[90vh] flex flex-col shadow-[0_0_80px_rgba(245,158,11,0.15)] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-900/20 to-slate-900 flex items-center gap-6 shrink-0">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <span className="text-4xl">👑</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-amber-500 tracking-tighter uppercase italic">La Voluntad del Rey</h2>
                        <p className="text-amber-200/60 text-sm mt-1">Asigna una tarea única a cada súbdito. Si cumplen sus tareas, serás recompensado.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Players List */}
                    <div className="w-80 bg-slate-950/50 border-r border-white/5 flex flex-col p-4 gap-3 overflow-y-auto shrink-0">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Súbditos</h3>
                        {otherPlayers.map(player => {
                            const assignedTask = TASKS.find(t => t.id === assignments[player.id]);
                            const isActive = player.id === activePlayerId;

                            return (
                                <button
                                    key={player.id}
                                    onClick={() => setActivePlayerId(player.id)}
                                    className={`relative p-4 rounded-xl border transition-all text-left group ${isActive
                                            ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                                            : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-bold uppercase tracking-wider ${isActive ? 'text-amber-200' : 'text-slate-300'}`}>
                                            {player.name}
                                        </span>
                                        {assignedTask ? (
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs border border-emerald-500/50">
                                                <i className="fa-solid fa-check"></i>
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xs">!</div>
                                        )}
                                    </div>

                                    {assignedTask ? (
                                        <div className="text-xs text-amber-100/70 truncate flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            {assignedTask.name}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-500 italic">Esperando órdenes...</div>
                                    )}

                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-x-1/2 w-1 h-12 bg-amber-500 rounded-r-lg shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: Task Grid */}
                    <div className="flex-1 bg-slate-900/50 p-8 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                Decretos Disponibles <span className="text-slate-600">({TASKS.length})</span>
                            </h3>
                            <div className="flex gap-4 text-xs">
                                <span className="flex items-center gap-2 text-slate-400"><span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50"></span> Seleccionado</span>
                                <span className="flex items-center gap-2 text-slate-400"><span className="w-3 h-3 rounded bg-slate-800 opacity-50 grayscale"></span> Asignado a otro</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
                            {TASKS.map(task => {
                                const isAssignedToThis = assignments[activePlayerId] === task.id;
                                const assignedToPlayerId = Object.keys(assignments).find(pid => assignments[pid] === task.id && pid !== activePlayerId);
                                const isAssignedToOther = !!assignedToPlayerId;
                                const ownerName = assignedToPlayerId ? otherPlayers.find(p => p.id === assignedToPlayerId)?.name : '';

                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => handleAssign(task.id)}
                                        disabled={isAssignedToOther}
                                        className={`group relative aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 ${isAssignedToThis
                                                ? 'ring-4 ring-amber-500 scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.3)] z-10'
                                                : isAssignedToOther
                                                    ? 'opacity-40 grayscale cursor-not-allowed contrast-50'
                                                    : 'hover:scale-[1.02] hover:shadow-xl ring-1 ring-white/10 hover:ring-white/30'
                                            }`}
                                    >
                                        <img
                                            src={task.imagePath}
                                            alt={task.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />

                                        {/* Overlay Gradient for Text Readability if needed, but cards have text. 
                                            However, we might want to highlight selection clearly. */}
                                        <div className={`absolute inset-0 transition-opacity ${isAssignedToThis ? 'bg-amber-500/10' : 'bg-black/0 group-hover:bg-white/5'}`}></div>

                                        {/* Selection Indicator */}
                                        {isAssignedToThis && (
                                            <div className="absolute top-2 right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg text-black font-bold">
                                                <i className="fa-solid fa-check"></i>
                                            </div>
                                        )}

                                        {/* Assigned to Other Indicator */}
                                        {isAssignedToOther && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                                                <div className="bg-slate-800 text-slate-200 px-3 py-1 rounded-full text-xs font-bold border border-slate-600 shadow-xl transform -rotate-12">
                                                    {ownerName}
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover Details (if image fails or for clarity) */}
                                        {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                                            <div className="text-white font-bold text-sm">{task.name}</div>
                                            <div className="text-amber-400 text-xs">{task.points} pts</div>
                                        </div> */}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-slate-900 shrink-0 flex justify-between items-center">
                    <div className="text-slate-500 text-sm">
                        {Object.keys(assignments).length} de {otherPlayers.length} tares asignadas
                    </div>
                    <button
                        onClick={() => onConfirm(assignments)}
                        disabled={!isComplete}
                        className={`px-12 py-4 font-black uppercase tracking-widest rounded-lg transition-all ${isComplete
                                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:-translate-y-1'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Promulgar Decretos
                    </button>
                </div>
            </div>
        </div>
    );
};
