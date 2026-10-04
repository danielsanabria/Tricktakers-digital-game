import React, { useState } from 'react';
import { Player, Card } from '../../game/core/types';
import GameCard from '../GameCard';
import { useTranslation } from '../../i18n/LanguageContext';

interface TimeTravelerDiscardModalProps {
    player: Player;
    onConfirm: (discardedCardIds: string[]) => void;
}

export const TimeTravelerDiscardModal: React.FC<TimeTravelerDiscardModalProps> = ({ player, onConfirm }) => {
    const { t } = useTranslation();
    const isSpanish = t('common.language') === 'es';
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
                <h2 className="text-2xl font-bold text-purple-300 mb-2 text-center">
                    {isSpanish ? 'Viajero del Tiempo: Ajusta tu Línea Temporal' : 'Time Traveler: Timeline Adjustment'}
                </h2>
                <p className="text-gray-300 text-center mb-6">
                    {isSpanish
                        ? 'Debes descartar 2 cartas para estabilizar el flujo temporal.'
                        : 'You must discard 2 cards to stabilize the timeline.'}
                </p>

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
                        {isSpanish
                            ? `DESCARTAR SELECCIONADAS (${selectedIds.length}/2)`
                            : `DISCARD SELECTED (${selectedIds.length}/2)`}
                    </button>
                </div>
            </div>
        </div>
    );
};
