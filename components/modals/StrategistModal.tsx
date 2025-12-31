
import React from 'react';
import { Card, Suit, CardType } from '../../types';

interface StrategistModalProps {
    choice: { type: 'BLACK7' | 'RARE', pointsObj: number } | null;
    onChoosePoints: (points: number) => void;
    onChooseCard: (cardType: 'BLACK7' | 'RARE') => void;
}

export const StrategistModal: React.FC<StrategistModalProps> = ({ choice, onChoosePoints, onChooseCard }) => {
    if (!choice) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-lg w-full shadow-2xl space-y-6">
                <h2 className="text-2xl font-black text-amber-500 uppercase tracking-widest text-center">Decisión del Estratega</h2>
                <p className="text-slate-300 text-center">
                    Has obtenido {choice.type === 'RARE' ? '0 victorias' : '1 victoria'}.
                    <br />
                    ¿Qué prefieres para la siguiente ronda?
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onChoosePoints(choice.pointsObj)}
                        className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 transition-all group"
                    >
                        <div className="text-3xl font-black text-amber-400 mb-2">+{choice.pointsObj} PTS</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Aceptar Puntos</div>
                    </button>

                    <button
                        onClick={() => onChooseCard(choice.type)}
                        className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 transition-all group"
                    >
                        <div className="text-3xl font-black text-purple-400 mb-2">{choice.type === 'BLACK7' ? '7 NEGRO' : 'CARTA RARA'}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Obtener Carta (Próxima Ronda)</div>
                    </button>
                </div>
            </div>
        </div>
    );
};
