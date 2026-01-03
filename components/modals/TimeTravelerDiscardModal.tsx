import React, { useState, useEffect } from 'react';
import { Player, Card } from '../../game/core/types';
import GameCard from '../GameCard';

interface TimeTravelerDiscardModalProps {
    player: Player; // The Time Traveler
    onConfirm: (discardedCardIds: string[]) => void;
}

export const TimeTravelerDiscardModal: React.FC<TimeTravelerDiscardModalProps> = ({ player, onConfirm }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleCardClick = (cardId: string) => {
        setSelectedIds(prev => {
            if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
            if (prev.length < 2) return [...prev, cardId];
            return prev;
        });
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-purple-500 rounded-xl max-w-4xl w-full p-6 shadow-2xl">
                <h2 className="text-2xl font-bold text-purple-300 mb-2 text-center">Viajero del Tiempo: Ajusta tu Línea Temporal</h2>
                <p className="text-gray-300 text-center mb-6">Debes descartar 2 cartas para estabilizar el flujo temporal.</p>

                <div className="flex justify-center gap-2 flex-wrap mb-8">
                    {player.hand.map(card => (
                        <div key={card.id} className="relative cursor-pointer" onClick={() => handleCardClick(card.id)}>
                            <div className={`transition-transform ${selectedIds.includes(card.id) ? '-translate-y-4 ring-2 ring-red-500 rounded-lg' : 'hover:-translate-y-2'}`}>
                                <GameCard card={card} selected={selectedIds.includes(card.id)} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => onConfirm(selectedIds)}
                        disabled={selectedIds.length !== 2}
                        className="btn btn-purple py-3 px-10 text-lg font-bold disabled:opacity-50"
                    >
                        DESCARTAR SELECCIONADAS ({selectedIds.length}/2)
                    </button>
                </div>
            </div>
        </div>
    );
};
