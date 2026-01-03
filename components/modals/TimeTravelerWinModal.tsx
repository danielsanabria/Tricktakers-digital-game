
import React from 'react';

interface TimeTravelerWinModalProps {
    onConfirm: () => void;
    onSkip: () => void;
}

export const TimeTravelerWinModal: React.FC<TimeTravelerWinModalProps> = ({ onConfirm, onSkip }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-amber-500 rounded-xl max-w-lg w-full p-8 shadow-2xl text-center">
                <h2 className="text-3xl font-bold text-amber-400 mb-4">¡Has ganado la baza!</h2>
                <p className="text-gray-300 mb-6 text-lg">
                    Tienes la oportunidad de <strong>Cambiar el Pasado</strong>.
                    <br />
                    <span className="text-sm opacity-70">(Coste: 1 Ficha de Tiempo)</span>
                </p>

                <div className="space-y-4">
                    <p className="text-sm text-gray-400 italic">
                        "Tomarás todas las cartas de la baza y repartirás una a cada oponente."
                    </p>

                    <div className="flex gap-4 justify-center mt-6">
                        <button
                            onClick={onSkip}
                            className="btn bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold"
                        >
                            Continuar Normal
                        </button>
                        <button
                            onClick={onConfirm}
                            className="btn bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-lg font-bold shadow-lg ring-2 ring-amber-300"
                        >
                            ⏳ Cambiar el Pasado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
