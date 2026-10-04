import React from 'react';
import { Player, Card } from '../../game/core/types';
import GameCard from '../GameCard';
import { useTranslation } from '../../i18n/LanguageContext';

interface CollectorLossModalProps {
    players: Player[];
    trickCards: Card[];
    onTakeCard: (cardId: string) => void;
    onSkip: () => void;
}

export const CollectorLossModal: React.FC<CollectorLossModalProps> = ({
    players,
    trickCards,
    onTakeCard,
    onSkip
}) => {
    const { t } = useTranslation();
    const isSpanish = t('common.language') === 'es';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 max-w-4xl w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500">
                    <i className="fa-solid fa-box-open text-9xl"></i>
                </div>

                <div className="relative z-10 text-center mb-6">
                    <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tighter mb-2">
                        {isSpanish ? 'Reserva del Coleccionista' : 'Collector Reservation'}
                    </h2>
                    <p className="text-slate-300 font-bold max-w-lg mx-auto">
                        {isSpanish
                            ? <>Has perdido la baza. Puedes robar <span className="text-amber-400">1 carta</span> de la mesa para tu colección.</>
                            : <>You lost the trick. You may take <span className="text-amber-400">1 card</span> from the trick into your collection.</>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 italic">
                        {isSpanish
                            ? '(La carta se añadirá a tu colección, no a tu mano)'
                            : '(The card will be added to your collection, not to your hand)'}
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 relative z-10 mb-8">
                    {trickCards.map(card => {
                        const ownerName = players.find(p => p.id === card.ownerId)?.name || '???';
                        return (
                            <div key={card.id} className="flex flex-col items-center gap-3 group relative">
                                <div className="transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-amber-500/20 rounded-xl">
                                    <GameCard
                                        card={card}
                                        onClick={() => onTakeCard(card.id)}
                                        className="w-24 h-36 md:w-28 md:h-40"
                                    />
                                    <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors rounded-xl pointer-events-none" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                                    {ownerName}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center relative z-10">
                    <button
                        onClick={onSkip}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 font-bold uppercase tracking-widest text-xs border border-slate-700 px-6 py-3 rounded-xl transition-all"
                    >
                        {isSpanish ? 'No recoger nada' : 'Pass / Take None'}
                    </button>
                </div>
            </div>
        </div>
    );
};
