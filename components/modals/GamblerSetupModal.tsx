
import React, { useState } from 'react';
import { Player, Card } from '../../game/core/types';
import GameCard from '../GameCard';

interface GamblerSetupModalProps {
    player: Player;
    mode: 'SWAP' | 'BID' | 'BET';
    round: number;
    onSwap: (cardIds: string[]) => void;
    onSkipSwap: () => void;
    onBid: (bid: number) => void;
    onBet: (bet: number) => void;
}

export const GamblerSetupModal: React.FC<GamblerSetupModalProps> = ({
    player,
    mode,
    round,
    onSwap,
    onSkipSwap,
    onBid,
    onBet
}) => {
    const [selectedForSwap, setSelectedForSwap] = useState<string[]>([]);

    const toggleCard = (cardId: string) => {
        setSelectedForSwap(prev =>
            prev.includes(cardId)
                ? prev.filter(id => id !== cardId)
                : [...prev, cardId]
        );
    };

    if (mode === 'SWAP') {
        return (
            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-slate-900 rounded-3xl border border-amber-500/30 w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col items-center p-8 gap-8 animate-in zoom-in duration-300">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-amber-500 tracking-tighter uppercase italic mb-2">
                            El Arte del Engaño
                        </h2>
                        <p className="text-slate-400">
                            Puedes cambiar cartas de tu mano para mejorar tu suerte.
                            <br />
                            <span className="text-amber-500 font-bold">Intercambios restantes: {player.gambleSwaps}</span>
                        </p>
                    </div>

                    <div className="flex gap-4 flex-wrap justify-center bg-slate-950/50 p-6 rounded-2xl border border-white/5 w-full">
                        {player.hand.map(card => (
                            <div
                                key={card.id}
                                onClick={() => toggleCard(card.id)}
                                className={`transform transition-all cursor-pointer ${selectedForSwap.includes(card.id)
                                    ? '-translate-y-4 shadow-[0_0_30px_rgba(245,158,11,0.4)] ring-2 ring-amber-500 rounded-lg'
                                    : 'hover:-translate-y-2 opacity-90 hover:opacity-100'
                                    }`}
                            >
                                <GameCard card={card} selected={selectedForSwap.includes(card.id)} />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onSkipSwap}
                            className="px-8 py-3 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            SALTAR / ESTOY LISTO
                        </button>
                        <button
                            onClick={() => {
                                if (selectedForSwap.length > 0) {
                                    onSwap(selectedForSwap);
                                    setSelectedForSwap([]);
                                }
                            }}
                            disabled={selectedForSwap.length === 0}
                            className="btn btn-amber px-10 py-3 text-lg shadow-xl"
                        >
                            CAMBIAR {selectedForSwap.length} CARTAS
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'BID') {
        return (
            <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm gap-8">
                <div className="bg-slate-900 rounded-2xl border border-amber-500/30 p-8 max-w-2xl w-full text-center space-y-8 animate-in zoom-in duration-300 shadow-2xl">
                    <div>
                        <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tight mb-2">Declara tu Destino</h2>
                        <p className="text-slate-400">¿Cuántas bazas ganarás en esta ronda?</p>
                    </div>

                    <div className="grid grid-cols-6 gap-4">
                        {[0, 1, 2, 3, 4, 5].map(num => (
                            <button
                                key={num}
                                onClick={() => onBid(num)}
                                className="aspect-square rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-500 text-2xl font-black transition-all shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] text-slate-300"
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-lg text-xs text-slate-400 text-left">
                        <p className="font-bold text-amber-500/80 mb-1">RECORDATORIO:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Si aciertas exactamente: +20 puntos.</li>
                            <li>Si fallas: -10 por cada baza de diferencia.</li>
                            <li>Si apuestas 4 y ganas 4: Victoria Instantánea.</li>
                            <li>Si ganas 5 bazas: Victoria Instantánea (independiente de la apuesta).</li>
                        </ul>
                    </div>
                </div>

                {/* VISIBLE HAND REFERENCE */}
                <div className="w-full max-w-4xl">
                    <p className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Tu Mano</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {player.hand.map(card => (
                            <div key={card.id} className="transform scale-75 origin-top">
                                <GameCard card={card} disabled />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'BET') {
        const maxBet = round === 3 ? 100 : 50;
        const betValues = [10, 20, 30, 40, 50, 100].filter(v => v <= maxBet);

        return (
            <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm gap-8">
                <div className="bg-slate-900 rounded-2xl border border-amber-500/30 p-8 max-w-xl w-full text-center space-y-8 animate-in zoom-in duration-300 shadow-2xl">
                    <div>
                        <h2 className="text-3xl font-black text-amber-500 uppercase tracking-tight mb-2">Dobla la Apuesta</h2>
                        <p className="text-slate-400">Apuesta puntos adicionales. Si aciertas tu predicción, ganas estos puntos extra. Si fallas, los pierdes.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onBet(0)}
                            className="col-span-2 p-3 rounded-lg bg-slate-800 text-slate-400 font-bold hover:bg-slate-700 transition-all border border-transparent hover:border-slate-600"
                        >
                            NO APOSTAR NADA
                        </button>
                        {betValues.map(val => (
                            <button
                                key={val}
                                onClick={() => onBet(val)}
                                className="p-4 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-500 font-black hover:bg-amber-500 hover:text-black transition-all shadow-lg"
                            >
                                {val} PTS
                            </button>
                        ))}
                    </div>
                </div>

                {/* VISIBLE HAND REFERENCE */}
                <div className="w-full max-w-4xl">
                    <p className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Tu Mano</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {player.hand.map(card => (
                            <div key={card.id} className="transform scale-75 origin-top">
                                <GameCard card={card} disabled />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
