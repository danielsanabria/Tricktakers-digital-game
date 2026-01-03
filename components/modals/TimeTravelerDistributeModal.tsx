
import React, { useState } from 'react';
import { Player, Card } from '../../game/core/types';
import GameCard from '../GameCard';

interface TimeTravelerDistributeModalProps {
    player: Player;
    opponents: Player[];
    onConfirm: (distribution: Record<string, string>) => void; // opponentId -> cardId
}

export const TimeTravelerDistributeModal: React.FC<TimeTravelerDistributeModalProps> = ({ player, opponents, onConfirm }) => {
    // State to track assignments: which card goes to which opponent
    // We iterate through opponents one by one or show them all?
    // Let's show opponents and allow dropping/selecting cards for them.

    // Simpler UI: Steps. "Select card for Player X".

    const [currentStep, setCurrentStep] = useState(0);
    const [assignments, setAssignments] = useState<Record<string, string>>({}); // oppId -> cardId

    const targetOpponent = opponents[currentStep];

    const handleSelectCard = (cardId: string) => {
        setAssignments(prev => ({ ...prev, [targetOpponent.id]: cardId }));
        if (currentStep < opponents.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Finished
            onConfirm({ ...assignments, [targetOpponent.id]: cardId });
        }
    };

    // Filter out already assigned cards
    const assignedCardIds = Object.values(assignments);
    const availableCards = player.hand.filter(c => !assignedCardIds.includes(c.id));

    if (!targetOpponent) return null;

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
            <div className="flex flex-col items-center w-full max-w-6xl">
                <h2 className="text-3xl font-bold text-amber-500 mb-2">Reescribiendo la Historia...</h2>
                <p className="text-xl text-white mb-8">
                    Elige una carta para dar a: <span className="font-bold text-blue-400 text-2xl">{targetOpponent.name}</span>
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
                    Paso {currentStep + 1} de {opponents.length}
                </div>
            </div>
        </div>
    );
};
