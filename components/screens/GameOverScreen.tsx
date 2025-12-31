
import React from 'react';
import { Player, CharacterType } from '../../game/core/types';
import { CHARACTERS } from '../../game/core/constants';
import { TournamentResult } from '../../game/core/gameLogic';

interface GameOverScreenProps {
    result: TournamentResult;
    players: Player[];
    onReset: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ result, players, onReset }) => {
    const { winner, reason } = result;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
            <div className="text-center max-w-lg w-full py-8">
                <h2 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tighter">FIN DEL TORNEO</h2>
                <div className="bg-white/10 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-white/20 mb-8">
                    <p className="text-teal-400 font-black text-xl sm:text-2xl mb-2 uppercase">Ganador Absoluto</p>
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        {winner.name}
                    </h3>
                    <p className="text-white/60 mb-6 text-sm md:text-base">{reason}</p>

                    <div className="space-y-2">
                        {players.sort((a, b) => b.score - a.score).map((p, i) => (
                            <div key={p.id} className="flex justify-between items-center text-white/60 font-bold">
                                <span>{i + 1}. {p.name} ({p.character ? CHARACTERS[p.character].name : 'S/C'})</span>
                                <div className="text-right">
                                    <div className="text-white">{p.score} pts</div>
                                    <div className="text-[9px] flex gap-1 justify-end">
                                        {Array(p.goldCrowns).fill(0).map((_, i) => <i key={i} className="fa-solid fa-crown text-amber-400"></i>)}
                                        {Array(p.blackCrowns).fill(0).map((_, i) => <i key={i} className="fa-solid fa-crown text-slate-900"></i>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={onReset} className="px-12 py-4 bg-teal-500 text-white rounded-full font-black text-xl hover:bg-teal-400 transition-all shadow-2xl shadow-teal-500/20">VOLVER A JUGAR</button>
            </div>
        </div>
    );
};
