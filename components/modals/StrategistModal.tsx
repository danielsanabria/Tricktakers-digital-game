import React from 'react';
import { Card, Suit, CardType } from '../../game/core/types';
import { useTranslation } from '../../i18n/LanguageContext';

interface StrategistModalProps {
    choice: { type: 'BLACK7' | 'RARE', pointsObj: number } | null;
    onChoosePoints: (points: number) => void;
    onChooseCard: (cardType: 'BLACK7' | 'RARE') => void;
}

export const StrategistModal: React.FC<StrategistModalProps> = ({ choice, onChoosePoints, onChooseCard }) => {
    const { t } = useTranslation();
    const isSpanish = t('common.language') === 'es';

    if (!choice) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-lg w-full shadow-2xl space-y-6">
                <h2 className="text-2xl font-black text-amber-500 uppercase tracking-widest text-center">
                    {isSpanish ? 'Decisión del Estratega' : 'Strategist Decision'}
                </h2>
                <p className="text-slate-300 text-center">
                    {isSpanish
                        ? (choice.type === 'RARE' ? 'Has obtenido 0 victorias.' : 'Has obtenido 1 victoria.')
                        : (choice.type === 'RARE' ? 'You won 0 tricks.' : 'You won 1 trick.')}
                    <br />
                    {isSpanish ? '¿Qué prefieres para la siguiente ronda?' : 'What do you choose for the next round?'}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onChoosePoints(choice.pointsObj)}
                        className="btn btn-amber !py-10 !rounded-2xl flex flex-col items-center justify-center !gap-1"
                    >
                        <div className="text-3xl font-black mb-1">+{choice.pointsObj} PTS</div>
                        <div className="text-[10px] opacity-70">
                            {isSpanish ? 'Aceptar Puntos' : 'Take Points'}
                        </div>
                    </button>

                    <button
                        onClick={() => onChooseCard(choice.type)}
                        className="btn btn-purple !py-10 !rounded-2xl flex flex-col items-center justify-center !gap-1"
                    >
                        <div className="text-2xl font-black mb-1">
                            {choice.type === 'BLACK7'
                                ? (isSpanish ? '7 NEGRO' : 'BLACK 7')
                                : (isSpanish ? 'CARTA RARA' : 'RARE CARD')}
                        </div>
                        <div className="text-[10px] opacity-70">
                            {isSpanish ? 'Obtener Carta' : 'Take Card'}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
