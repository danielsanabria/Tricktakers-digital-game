import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

interface TimeTravelerWinModalProps {
    onConfirm: () => void;
    onSkip: () => void;
}

export const TimeTravelerWinModal: React.FC<TimeTravelerWinModalProps> = ({ onConfirm, onSkip }) => {
    const { t } = useTranslation();
    const isSpanish = t('common.language') === 'es';

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-amber-500 rounded-xl max-w-lg w-full p-8 shadow-2xl text-center">
                <h2 className="text-3xl font-bold text-amber-400 mb-4">
                    {isSpanish ? '¡Has ganado la baza!' : 'You Won the Trick!'}
                </h2>
                <p className="text-gray-300 mb-6 text-lg">
                    {isSpanish ? (
                        <>
                            Tienes la oportunidad de <strong>Cambiar el Pasado</strong>.
                            <br />
                            <span className="text-sm opacity-70">(Coste: 1 Ficha de Tiempo)</span>
                        </>
                    ) : (
                        <>
                            You have the opportunity to <strong>Change the Past</strong>.
                            <br />
                            <span className="text-sm opacity-70">(Cost: 1 Time Token)</span>
                        </>
                    )}
                </p>

                <div className="space-y-4">
                    <p className="text-sm text-gray-400 italic">
                        {isSpanish
                            ? '"Tomarás todas las cartas de la baza y repartirás una a cada oponente."'
                            : '"Take all cards from the trick and distribute one back to each opponent."'}
                    </p>

                    <div className="flex gap-4 justify-center mt-6">
                        <button
                            onClick={onSkip}
                            className="btn bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold"
                        >
                            {isSpanish ? 'Continuar Normal' : 'Pass / Keep Cards'}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="btn bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-lg font-bold shadow-lg ring-2 ring-amber-300"
                        >
                            {isSpanish ? '⏳ Cambiar el Pasado' : '⏳ Change the Past'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
