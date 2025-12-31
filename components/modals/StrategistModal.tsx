
import React from 'react';
import { Card, Suit, CardType } from '../../game/core/types';

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
                        className="btn btn-amber !py-10 !rounded-2xl flex flex-col items-center justify-center !gap-1"
                    >
                        <div className="text-3xl font-black mb-1">+{choice.pointsObj} PTS</div>
                        <div className="text-[10px] opacity-70">Aceptar Puntos</div>
                    </button>

                    <button
                        onClick={() => onChooseCard(choice.type)}
                        className="btn btn-purple !py-10 !rounded-2xl flex flex-col items-center justify-center !gap-1"
                    >
                        <div className="text-2xl font-black mb-1">{choice.type === 'BLACK7' ? '7 NEGRO' : 'CARTA RARA'}</div>
                        <div className="text-[10px] opacity-70">Obtener Carta</div>
                    </button>
                </div>
            </div>
        </div>
    );
};
