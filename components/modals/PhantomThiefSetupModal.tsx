
import React, { useState } from 'react';
import { Suit } from '../../game/core/types';
import { SUIT_ICONS, SUIT_COLORS } from '../../game/core/constants';

interface PhantomThiefSetupModalProps {
    onConfirm: (suits: Suit[]) => void;
}

export const PhantomThiefSetupModal: React.FC<PhantomThiefSetupModalProps> = ({ onConfirm }) => {
    const [selectedSuits, setSelectedSuits] = useState<Suit[]>([]);

    // Suits excluding Black and Colorless for notices
    const availableSuits = [Suit.RED, Suit.BLUE, Suit.GREEN];

    const toggleSuit = (suit: Suit) => {
        if (selectedSuits.includes(suit)) {
            setSelectedSuits(prev => prev.filter(s => s !== suit));
        } else if (selectedSuits.length < 2) {
            setSelectedSuits(prev => [...prev, suit]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border-2 border-indigo-500 p-8 max-w-lg w-full shadow-[0_0_60px_rgba(99,102,241,0.3)]">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 border-2 border-indigo-500 mb-4">
                        <span className="text-5xl">🎭</span>
                    </div>
                    <h2 className="text-3xl font-black text-indigo-400 uppercase italic tracking-tighter">Aviso del Ladrón</h2>
                    <p className="text-slate-400 mt-2">Elige 2 colores. Ganarás una corona por cada baza que ganes con esos colores.</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {availableSuits.map(suit => {
                        const isSelected = selectedSuits.includes(suit);
                        return (
                            <button
                                key={suit}
                                onClick={() => toggleSuit(suit)}
                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${isSelected
                                    ? 'bg-indigo-500/20 border-indigo-500 scale-105 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                                    : 'bg-slate-800 border-slate-700 hover:border-slate-500 opacity-60'}`}
                            >
                                <span className="text-3xl">{SUIT_ICONS[suit]}</span>
                                <span className={`text-xs font-bold uppercase ${SUIT_COLORS[suit].split(' ')[1]}`}>{suit}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="text-center text-xs font-bold text-indigo-300/50 uppercase tracking-widest">
                        Seleccionados: {selectedSuits.length} / 2
                    </div>

                    <button
                        onClick={() => onConfirm(selectedSuits)}
                        disabled={selectedSuits.length !== 2}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_0_rgb(49,46,129)] active:translate-y-1 active:shadow-none"
                    >
                        Enviar Invitaciones
                    </button>
                </div>
            </div>
        </div>
    );
};
