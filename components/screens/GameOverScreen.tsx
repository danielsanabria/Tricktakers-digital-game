
import React from 'react';
import { Player, CharacterType } from '../../game/core/types';
import { CHARACTERS } from '../../game/core/constants';
import { TournamentResult } from '../../game/core/gameLogic';
import { useTranslation } from '../../i18n/LanguageContext';
import { LanguageSelector } from '../LanguageSelector';

interface GameOverScreenProps {
    result: TournamentResult | null;
    players: Player[];
    onReset?: () => void;
    onRestart?: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ result, players, onReset, onRestart }) => {
    const { t, translations } = useTranslation();
    const handleReset = onReset || onRestart;
    const winner = result?.winner || { name: 'Player' };
    const rawReason = result?.reason || '';

    const getLocalizedReason = () => {
        if (!rawReason) return '';
        if (rawReason.includes('Instantánea') || rawReason.includes('Instant')) {
            return t('summary.instantWinReason', { name: winner.name });
        }
        if (rawReason.includes('Tiranía') || rawReason.includes('Tyranny')) {
            return t('summary.rulerTyrannyReason');
        }
        if (rawReason.includes('Doradas') || rawReason.includes('Gold')) {
            return t('summary.twoGoldCrownsReason');
        }
        if (rawReason.includes('Miseria') || rawReason.includes('Negras') || rawReason.includes('Black')) {
            return t('summary.threeBlackCrownsReason');
        }
        if (rawReason.includes('Puntuación') || rawReason.includes('Score')) {
            return t('summary.highestScoreReason');
        }
        return rawReason;
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
            <div className="text-center max-w-lg w-full py-8">
                <h2 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                    {t('summary.tournamentOverTitle')}
                </h2>
                <div className="bg-white/10 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-white/20 mb-8">
                    <p className="text-teal-400 font-black text-xl sm:text-2xl mb-2 uppercase">
                        {t('summary.grandWinner')}
                    </p>
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        {winner.name}
                    </h3>
                    <p className="text-white/60 mb-6 text-sm md:text-base font-medium">{getLocalizedReason()}</p>

                    <div className="space-y-2">
                        {players.slice().sort((a, b) => b.score - a.score).map((p, i) => {
                            const char = p.character ? CHARACTERS[p.character] : null;
                            const localizedChar = p.character ? translations.gameData.characters[p.character] : null;
                            const charName = localizedChar?.name || char?.name || '---';

                            return (
                                <div key={p.id} className="flex justify-between items-center text-white/60 font-bold">
                                    <span>{i + 1}. {p.name} ({charName})</span>
                                    <div className="text-right">
                                        <div className="text-white">{p.score} {t('common.pts')}</div>
                                        <div className="text-[9px] flex gap-1 justify-end">
                                            {Array(p.goldCrowns || 0).fill(0).map((_, i) => <i key={i} className="fa-solid fa-crown text-amber-400"></i>)}
                                            {Array(p.blackCrowns || 0).fill(0).map((_, i) => <i key={i} className="fa-solid fa-crown text-slate-900"></i>)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={handleReset}
                        className="px-12 py-4 bg-teal-500 text-white rounded-full font-black text-xl hover:bg-teal-400 transition-all shadow-2xl shadow-teal-500/20 active:scale-95 cursor-pointer uppercase"
                    >
                        {t('summary.playAgainBtn')}
                    </button>

                    <div className="mt-2">
                        <LanguageSelector />
                    </div>
                </div>
            </div>
        </div>
    );
};
