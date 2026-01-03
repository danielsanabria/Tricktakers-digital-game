
import React, { useState } from 'react';
import { Card, Suit } from '../../game/core/types';

interface AlchemistSuitSelectorModalProps {
    selectedCards: Card[]; // The 3 cards played
    onConfirm: (suit: Suit) => void;
}

export const AlchemistSuitSelectorModal: React.FC<AlchemistSuitSelectorModalProps> = ({ selectedCards, onConfirm }) => {
    // Determine available suits
    // Rule: "You can declare any color as Lead based on your played cards."
    // "You can only declare Black if you played 3 different colors (Red, Blue, Green)."

    // Logic:
    // 1. Get unique suits present in the 3 cards (excluding Colorless usually, but Colorless cards take color in combinations? No, assume standard suits).
    // Actually, can you declare a suit you DON'T have? "based on your played cards". Implies you must pick one of them.
    // Example: Played Red 7, Red 8, Blue 1. Can you declare Green? No.
    // However, if you have 3 distinct colors (Red, Blue, Green), you can declare BLACK (even if no Black card played).

    // Let's implement strict interpretation:
    // Options = Unique Suits in (Red, Blue, Green, Black) found in selectedCards.
    // + Force include BLACK if (Red is present AND Blue is present AND Green is present).

    const presentSuits = Array.from(new Set(selectedCards.map(c => c.suit))).filter(s => s !== Suit.COLORLESS) as Suit[];

    const hasRed = presentSuits.includes(Suit.RED);
    const hasBlue = presentSuits.includes(Suit.BLUE);
    const hasGreen = presentSuits.includes(Suit.GREEN);
    const has3Colors = hasRed && hasBlue && hasGreen;

    const availableOptions: Suit[] = [...presentSuits];
    if (has3Colors && !availableOptions.includes(Suit.BLACK)) {
        availableOptions.push(Suit.BLACK);
    }

    // Default to first available or none
    const [selectedSuit, setSelectedSuit] = useState<Suit | null>(availableOptions.length > 0 ? availableOptions[0] : null);

    const suitColors: Record<string, string> = {
        [Suit.RED]: 'bg-red-500 hover:bg-red-600',
        [Suit.BLUE]: 'bg-blue-500 hover:bg-blue-600',
        [Suit.GREEN]: 'bg-emerald-500 hover:bg-emerald-600',
        [Suit.BLACK]: 'bg-gray-800 hover:bg-black',
        [Suit.COLORLESS]: 'bg-gray-400'
    };

    const suitNames: Record<string, string> = {
        [Suit.RED]: 'ROJO',
        [Suit.BLUE]: 'AZUL',
        [Suit.GREEN]: 'VERDE',
        [Suit.BLACK]: 'NEGRO'
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-2 border-purple-500 rounded-xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <img src="/assets/chars/3C.png" alt="Alchemist" className="w-32 h-32 object-contain" />
                </div>

                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-300 mb-2">
                    Transmutación: Selección de Palo
                </h2>

                <p className="text-gray-300 text-sm mb-6">
                    Has abierto la baza con Alquimia. Debes declarar el <strong>Palo Líder</strong> basándote en los ingredientes usados.
                </p>

                {/* Cards Preview */}
                <div className="flex justify-center gap-2 mb-8">
                    {selectedCards.map(card => (
                        <div key={card.id} className="transform hover:-translate-y-1 transition-transform">
                            <img
                                src={`/assets/cards/${card.type === 'NUMBER' ? `${card.suit}-${card.value}.png` : card.type === 'RARE' ? 'RARE.png' : 'whiteflag.png'}`}
                                alt={card.name}
                                className="w-16 h-auto shadow-md rounded-sm border border-gray-700"
                            />
                        </div>
                    ))}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {availableOptions.map(suit => (
                        <button
                            key={suit}
                            onClick={() => setSelectedSuit(suit)}
                            className={`
                                flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all
                                ${selectedSuit === suit
                                    ? `border-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)] ${suitColors[suit]}`
                                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }
                            `}
                        >
                            {/* Simple Suit Icon */}
                            <div className={`w-3 h-3 rounded-full ${suit === Suit.RED ? 'bg-red-500' : suit === Suit.BLUE ? 'bg-blue-500' : suit === Suit.GREEN ? 'bg-green-500' : 'bg-black'}`}></div>
                            <span className="font-bold tracking-wider">{suitNames[suit]}</span>
                        </button>
                    ))}
                </div>

                <button
                    disabled={!selectedSuit}
                    onClick={() => selectedSuit && onConfirm(selectedSuit)}
                    className="w-full btn btn-purple py-3 text-lg shadow-lg"
                >
                    CONFIRMAR TRANSMUTACIÓN
                </button>
            </div>
        </div>
    );
};
