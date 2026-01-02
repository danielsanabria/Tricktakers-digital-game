import React from 'react';
import { Player, Card, Suit, CharacterType } from '../game/core/types';
import PlayerBoard from './PlayerBoard';
import GameCard from './GameCard';
import { CHARACTERS } from '../game/core/constants';

interface GameTableProps {
    players: Player[];
    currentPlayerIdx: number;
    playedCards: Card[];
    selectedCards: string[];
    isKakumei: boolean;
    leadSuit: Suit | null;
    abilityMode: string;
    setSelectedCards: React.Dispatch<React.SetStateAction<string[]>>;
    setViewingCharacter: (char: CharacterType | null) => void;
    setItemCardToShow: (item: any) => void;
}

export const GameTable: React.FC<GameTableProps> = ({
    players,
    currentPlayerIdx,
    playedCards,
    selectedCards,
    isKakumei,
    leadSuit,
    abilityMode,
    setSelectedCards,
    setViewingCharacter,
    setItemCardToShow
}) => {
    return (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 flex flex-col pb-4">
            {/* Oponentes (Rivales) */}
            <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
                {players.slice(1).map(p => (
                    <PlayerBoard
                        key={p.id}
                        player={p}
                        isCurrentPlayer={players[currentPlayerIdx].id === p.id}
                        onCardPlay={() => { }}
                        canPlay={false}
                        onCharacterClick={() => setViewingCharacter(p.character)}
                        onItemClick={setItemCardToShow}
                    />
                ))}
            </div>

            {/* Mesa de Juego (Flexible) */}
            <div className="flex-1 min-h-[250px] flex flex-col items-center justify-center relative my-4">
                <div className={`absolute inset-0 bg-teal-50/30 rounded-[3rem] border-4 border-dashed border-teal-100 flex items-center justify-center transition-all ${isKakumei ? 'bg-rose-50/30 border-rose-100 rotate-180' : ''}`}>
                    {playedCards.length === 0 && (
                        <div className="text-center opacity-20 select-none">
                            <i className={`fa-solid ${isKakumei ? 'fa-flag' : 'fa-shield'} text-8xl mb-4`}></i>
                            <p className="font-black text-2xl uppercase tracking-widest">{isKakumei ? 'REVOLUCIÓN ACTIVA' : 'CAMPO DE BATALLA'}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 sm:gap-6 z-10 flex-wrap justify-center">
                    {playedCards.map((c, idx) => (
                        <div
                            key={idx}
                            className={`animate-in zoom-in slide-in-from-bottom-8 duration-500 cursor-pointer transition-transform ${selectedCards.includes(c.id) ? 'scale-110 -translate-y-4' : ''}`}
                            onClick={() => {
                                const p = players[0];
                                const isGamblerSwap = p.character === CharacterType.GAMBLER && (p.gambleSwaps || 0) > 0 && p.bid === undefined;

                                if (abilityMode === 'COLLECTOR_RESERVE' || isGamblerSwap) {
                                    setSelectedCards(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]);
                                }
                            }}
                        >
                            <div className={`${selectedCards.includes(c.id) ? 'ring-4 ring-amber-500 rounded-2xl shadow-2xl shadow-amber-500/50' : ''}`}>
                                <GameCard card={c} disabled={abilityMode !== 'COLLECTOR_RESERVE'} />
                            </div>
                            <div className="text-center mt-2 font-black text-[10px] uppercase text-slate-400">{players.find(p => p.id === c.ownerId)?.name}</div>
                        </div>
                    ))}
                </div>

                {leadSuit && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-xl flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Palo Líder</span>
                        <div className={`w-3 h-3 rounded-full ${leadSuit === Suit.RED ? 'bg-rose-500' : leadSuit === Suit.BLUE ? 'bg-sky-500' : leadSuit === Suit.GREEN ? 'bg-teal-500' : 'bg-slate-900'}`}></div>
                    </div>
                )}
            </div>
        </div>
    );
};
