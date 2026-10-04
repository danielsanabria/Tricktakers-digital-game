import React, { useState } from 'react';
import { Player, Card } from '../../game/core/types';
import GameCard from '../GameCard';
import { useTranslation } from '../../i18n/LanguageContext';

interface TimeTravelerDistributeModalProps {
    player: Player;
    opponents: Player[];
    onConfirm: (distribution: Record<string, string>) => void;
}

export const TimeTravelerDistributeModal: React.FC<TimeTravelerDistributeModalProps> = ({ player, opponents, onConfirm }) => {
    const { t } = useTranslation();
    const isSpanish = t('common.language') === 'es';
    const [currentStep, setCurrentStep] = useState(0);
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    const targetOpponent = opponents[currentStep];

    const handleSelectCard = (cardId: string) => {
        setAssignments(prev => ({ ...prev, [targetOpponent.id]: cardId }));
        if (currentStep < opponents.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onConfirm({ ...assignments, [targetOpponent.id]: cardId });
        }
    };

    const assignedCardIds = Object.values(assignments);
    const availableCards = player.hand.filter(c => !assignedCardIds.includes(c.id));

    if (!targetOpponent) return null;

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
            <div className="flex flex-col items-center w-full max-w-6xl">
                <h2 className="text-3xl font-bold text-amber-500 mb-2">
                    {isSpanish ? 'Reescribiendo la Historia...' : 'Rewriting History...'}
                </h2>
                <p className="text-xl text-white mb-8">
                    {isSpanish
                        ? <>Elige una carta para dar a: <span className="font-bold text-blue-400 text-2xl">{targetOpponent.name}</span></>
                        : <>Choose a card to give to: <span className="font-bold text-blue-400 text-2xl">{targetOpponent.name}</span></>}
                </p>

                <div className="flex flex-wrap justify-center gap-4 p-4 overflow-y-auto max-h-[60vh]">
                    {availableCards.map(card => (
                        <div key={card.id} onClick={() => handleSelectCard(card.id)}
                            className="cursor-pointer hover:-translate-y-4 transition-transform duration-300">
                            <GameCard card={card} />
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-gray-400">
                    {isSpanish
                        ? `Paso ${currentStep + 1} de ${opponents.length}`
                        : `Step ${currentStep + 1} of ${opponents.length}`}
                </div>
            </div>
        </div>
    );
};
