import React from 'react';
import { Player, Card, Suit, CharacterType } from '../game/core/types';
import PlayerBoard from './PlayerBoard';
import GameCard from './GameCard';
import { CHARACTERS } from '../game/core/constants';
import { useTranslation } from '../i18n/LanguageContext';

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
    localPlayerId?: string;
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
    setItemCardToShow,
    localPlayerId = 'p1'
}) => {
    const { t } = useTranslation();
    const opponents = players.filter(p => p.id !== localPlayerId);

    return (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 flex flex-col pb-4">
            {/* Disconnection Grace Period Alert Banner */}
            {players.some(p => p.disconnectCountdown !== null && p.disconnectCountdown !== undefined) && (
                <div className="mb-3 p-2.5 bg-white/95 backdrop-blur-md border border-amber-300/80 shadow-lg rounded-full flex items-center justify-between text-amber-950 text-xs px-5 mx-auto max-w-lg animate-pulse">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-amber-600 text-sm"></i>
                        <span>
                            <strong>
                                {players.find(p => p.disconnectCountdown !== null)?.name}
                            </strong> {t('table.disconnectedWaiting')}
                        </span>
                    </div>
                    <span className="font-mono font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        {players.find(p => p.disconnectCountdown !== null)?.disconnectCountdown}s
                    </span>
                </div>
            )}

            {/* Oponentes (Rivales: 1, 2 o 3 según número de jugadores) */}
            <div className={`grid gap-3 sm:gap-4 mb-4 shrink-0 ${
                opponents.length === 1
                    ? 'grid-cols-1 max-w-sm mx-auto w-full'
                    : opponents.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-3'
            }`}>
                {opponents.map(p => (
                    <PlayerBoard
                        key={p.id}
                        player={p}
                        isLocalPlayer={false}
                        isCurrentPlayer={players[currentPlayerIdx]?.id === p.id}
                        onCardPlay={() => { }}
                        canPlay={false}
                        onCharacterClick={() => setViewingCharacter(p.character)}
                        onItemClick={setItemCardToShow}
                    />
                ))}
            </div>

            {/* Mesa de Juego (Flexible) */}
            <div className="flex-1 min-h-[250px] flex flex-col items-center justify-center relative my-4">
                <div className={`absolute inset-0 bg-white/40 backdrop-blur-xs rounded-[3rem] border-2 border-dashed border-teal-600/30 flex items-center justify-center transition-all ${isKakumei ? 'bg-rose-50/40 border-rose-400 rotate-180' : ''}`}>
                    {playedCards.length === 0 && (
                        <div className="text-center opacity-30 select-none">
                            <i className={`fa-solid ${isKakumei ? 'fa-flag text-rose-500' : 'fa-shield text-teal-600'} text-7xl mb-3`}></i>
                            <p className="font-black text-xl uppercase tracking-widest text-slate-700">
                                {isKakumei ? t('table.revolutionActive') : t('table.battlefield')}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 sm:gap-6 z-10 flex-wrap justify-center">
                    {playedCards.map((c, idx) => (
                        <div
                            key={idx}
                            className={`animate-in zoom-in slide-in-from-bottom-8 duration-500 cursor-pointer transition-transform ${selectedCards.includes(c.id) ? 'scale-110 -translate-y-4' : ''}`}
                            onClick={() => {
                                const p = players.find(pl => pl.id === localPlayerId) || players[0];
                                const isGamblerSwap = p.character === CharacterType.GAMBLER && (p.gambleSwaps || 0) > 0 && p.bid === undefined;

                                if (abilityMode === 'COLLECTOR_RESERVE' || isGamblerSwap) {
                                    setSelectedCards(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]);
                                }
                            }}
                        >
                            <div className={`${selectedCards.includes(c.id) ? 'ring-4 ring-amber-500 rounded-2xl shadow-2xl shadow-amber-500/50' : ''}`}>
                                <GameCard card={c} disabled={abilityMode !== 'COLLECTOR_RESERVE'} />
                            </div>
                            <div className="text-center mt-2">
                                <span className="font-black text-[10px] uppercase text-slate-700 bg-white/90 px-2.5 py-0.5 rounded-full shadow-xs border border-slate-200">
                                    {players.find(p => p.id === c.ownerId)?.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {leadSuit && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full border border-slate-200 shadow-xl flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t('table.leadSuitBadge')}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${leadSuit === Suit.RED ? 'bg-rose-500' : leadSuit === Suit.BLUE ? 'bg-sky-500' : leadSuit === Suit.GREEN ? 'bg-teal-500' : 'bg-slate-900'}`}></div>
                    </div>
                )}
            </div>
        </div>
    );
};
