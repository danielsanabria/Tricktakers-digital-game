import React, { useState } from 'react';
import { Player } from '../../game/core/types';
import GameCard from '../GameCard';

interface AdventurerSwapModalProps {
    player: Player;
    maxSelectable: number;
    onConfirm: (cardIds: string[]) => void;
}

export const AdventurerSwapModal: React.FC<AdventurerSwapModalProps> = ({
    player,
    maxSelectable,
    onConfirm
}) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleCard = (cardId: string) => {
        if (selectedIds.includes(cardId)) {
            setSelectedIds(prev => prev.filter(id => id !== cardId));
        } else {
            if (selectedIds.length < maxSelectable) {
                setSelectedIds(prev => [...prev, cardId]);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-3xl border border-blue-500/30 w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col items-center p-8 gap-8 animate-in zoom-in duration-300">
                <div className="text-center">
                    <h2 className="text-4xl font-black text-blue-500 tracking-tighter uppercase italic mb-2">
                        Mapa del Destino
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Selecciona hasta <span className="text-blue-500 font-bold">{maxSelectable}</span> cartas para intercambiar.
                    </p>
                </div>

                <div className="flex gap-4 flex-wrap justify-center bg-slate-950/50 p-6 rounded-2xl border border-white/5 w-full">
                    {player.hand.map(card => (
                        <div
                            key={card.id}
                            onClick={() => toggleCard(card.id)}
                            className={`transform transition-all cursor-pointer ${selectedIds.includes(card.id)
                                ? '-translate-y-4 shadow-[0_0_30px_rgba(59,130,246,0.4)] ring-2 ring-blue-500 rounded-lg'
                                : 'hover:-translate-y-2 opacity-90 hover:opacity-100'
                                } ${(!selectedIds.includes(card.id) && selectedIds.length >= maxSelectable) ? 'opacity-50' : ''}`}
                        >
                            <GameCard card={card} selected={selectedIds.includes(card.id)} />
                        </div>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => onConfirm(selectedIds)}
                        className="px-10 py-3 text-lg shadow-xl font-black rounded-lg transition-all bg-blue-500 text-white hover:bg-blue-400 hover:scale-105"
                    >
                        {selectedIds.length === 0
                            ? 'NO CAMBIAR NADA'
                            : `INTERCAMBIAR ${selectedIds.length} CARTA${selectedIds.length !== 1 ? 'S' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};
