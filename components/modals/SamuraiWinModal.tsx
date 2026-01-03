
import React from 'react';
import { Player, Card, Suit } from '../../game/core/types';
import GameCard from '../GameCard';

interface SamuraiWinModalProps {
    players: Player[];
    playedCards: Card[]; // Cards from the trick that just ended (passed down or stored)
    // Actually, `playedCards` in game loop is cleared? No, we intercept before clear.
    trickCards: Card[];
    onTakeCard: (cardId: string) => void;
    onSkip: () => void;
}

export const SamuraiWinModal: React.FC<SamuraiWinModalProps> = ({
    players,
    trickCards,
    onTakeCard,
    onSkip
}) => {
    // Filter: Red cards, NOT owned by Samurai (p1)
    const availableCards = trickCards.filter(c => c.suit === Suit.RED && c.ownerId !== 'p1');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border-2 border-red-600 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-red-500">
                    <i className="fa-solid fa-khanda text-9xl"></i>
                </div>

                <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter mb-2 relative z-10">
                    Espíritu del Rojo
                </h2>
                <p className="text-slate-300 font-bold mb-6 relative z-10">
                    Has ganado la baza. Puedes tomar una carta ROJA jugada por un oponente.
                    <br />
                    <span className="text-xs text-red-400 opacity-80">(Si lo haces, deberás descartar una carta de tu mano después)</span>
                </p>

                {availableCards.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-slate-500 font-bold italic mb-4">No hay cartas rojas disponibles para robar.</p>
                        <button
                            onClick={onSkip}
                            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
                        >
                            Continuar
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 relative z-10">
                        <div className="flex flex-wrap justify-center gap-4">
                            {availableCards.map(card => (
                                <div key={card.id} className="flex flex-col items-center gap-2 group">
                                    <div className="transform transition-transform group-hover:scale-105 group-hover:-translate-y-2">
                                        <GameCard
                                            card={card}
                                            onClick={() => onTakeCard(card.id)}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                        De: {players.find(p => p.id === card.ownerId)?.name || 'Desconocido'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                onClick={onSkip}
                                className="text-slate-400 hover:text-white font-bold uppercase tracking-widest text-xs border border-transparent hover:border-slate-500 px-4 py-2 rounded-lg transition-all"
                            >
                                No robar nada
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
