import React from 'react';
import { Player, Card } from '../../game/core/types';
import GameCard from '../GameCard';
import { useTranslation } from '../../i18n/LanguageContext';

interface KingSetupModalProps {
    player: Player;
    onDiscard: (card: Card) => void;
}

export const KingSetupModal: React.FC<KingSetupModalProps> = ({ player, onDiscard }) => {
    const { t } = useTranslation();
    const isSpanish = t('common.language') === 'es';

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl space-y-8 animate-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                        {isSpanish ? 'Privilegio del Rey' : "King's Privilege"}
                    </h3>
                    <p className="text-slate-500 font-medium">
                        {isSpanish
                            ? 'Debes descartar 1 carta para quedarte con un máximo de 5.'
                            : 'You must discard 1 card to reduce your hand to the limit of 5.'}
                    </p>
                </div>

                <div className="flex gap-4 flex-wrap justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {player.hand.map(card => (
                        <div
                            key={card.id}
                            className="transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                            onClick={() => onDiscard(card)}
                        >
                            <GameCard
                                card={card}
                                selected={false}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
