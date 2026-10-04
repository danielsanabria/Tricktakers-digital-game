import React, { useState } from 'react';
import { Player } from '../../game/core/types';
import { useTranslation } from '../../i18n/LanguageContext';

interface TimeTravelerSetupModalProps {
    players: Player[];
    onConfirm: (goldWinnerId: string, blackWinner1Id: string, blackWinner2Id: string) => void;
}

export const TimeTravelerSetupModal: React.FC<TimeTravelerSetupModalProps> = ({ players, onConfirm }) => {
    const { t } = useTranslation();
    const isSpanish = t('common.language') === 'es';
    const [goldPrediction, setGoldPrediction] = useState<string>('');
    const [blackPrediction1, setBlackPrediction1] = useState<string>('');
    const [blackPrediction2, setBlackPrediction2] = useState<string>('');

    const handleSubmit = () => {
        if (goldPrediction && blackPrediction1 && blackPrediction2) {
            onConfirm(goldPrediction, blackPrediction1, blackPrediction2);
        }
    };

    const isComplete = goldPrediction && blackPrediction1 && blackPrediction2;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border-2 border-purple-500 rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-bold text-purple-300 mb-2 text-center">
                    {t('modals.timeTravelerSetupTitle')}
                </h2>
                <p className="text-gray-300 text-sm mb-6 text-center">
                    {isSpanish
                        ? 'Debes predecir quién ganará la Corona Dorada y quiénes ganarán las dos Coronas Negras.'
                        : 'Predict who will win the Gold Crown and who will win the two Black Crowns.'}
                    <br />
                    <span className="text-xs text-gray-500 italic">
                        {isSpanish ? '(Puedes elegirte a ti mismo)' : '(You may choose yourself)'}
                    </span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Gold Crown Section */}
                    <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-600/50">
                        <div className="flex items-center gap-2 mb-3">
                            <img src="/assets/4c-cards/time-travel-gold-crown.jpg" alt="Gold Crown" className="w-8 h-8 rounded-full object-cover" />
                            <h3 className="text-amber-400 font-bold">{t('common.goldCrown')}</h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                            {isSpanish ? '¿Quién ganará más bazas?' : 'Who will win the most tricks?'}
                        </p>
                        <div className="flex flex-col gap-2">
                            {players.map(p => (
                                <label key={`gold-${p.id}`} className={`flex items-center p-2 rounded cursor-pointer transition-colors ${goldPrediction === p.id ? 'bg-amber-600/40 border border-amber-500' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'}`}>
                                    <input
                                        type="radio"
                                        name="gold-prediction"
                                        value={p.id}
                                        checked={goldPrediction === p.id}
                                        onChange={() => setGoldPrediction(p.id)}
                                        className="hidden"
                                    />
                                    <span className="text-white text-sm font-medium">{p.name} {p.id === 'p1' ? (isSpanish ? '(Tú)' : '(You)') : ''}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Black Crown Section */}
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50">
                        <div className="flex items-center gap-2 mb-3">
                            <img src="/assets/4c-cards/time-travel-black-crown.jpg" alt="Black Crown" className="w-8 h-8 rounded-full object-cover" />
                            <h3 className="text-slate-300 font-bold">{t('common.blackCrown')} (x2)</h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                            {isSpanish ? '¿Quiénes ganarán 0 bazas?' : 'Who will win 0 tricks?'}
                        </p>

                        <div className="space-y-4">
                            {/* Prediction 1 */}
                            <div>
                                <h4 className="text-xs text-slate-400 mb-1">
                                    {isSpanish ? 'Predicción 1' : 'Prediction 1'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {players.map(p => (
                                        <button
                                            key={`black1-${p.id}`}
                                            onClick={() => setBlackPrediction1(p.id)}
                                            className={`px-3 py-1 rounded text-sm transition-colors ${blackPrediction1 === p.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prediction 2 */}
                            <div>
                                <h4 className="text-xs text-slate-400 mb-1">
                                    {isSpanish ? 'Predicción 2' : 'Prediction 2'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {players.map(p => (
                                        <button
                                            key={`black2-${p.id}`}
                                            onClick={() => setBlackPrediction2(p.id)}
                                            className={`px-3 py-1 rounded text-sm transition-colors ${blackPrediction2 === p.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!isComplete}
                        className="btn btn-purple py-3 px-10 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-900/50 uppercase tracking-wider"
                    >
                        {t('modals.confirmPredictions')}
                    </button>
                </div>
            </div>
        </div>
    );
};
