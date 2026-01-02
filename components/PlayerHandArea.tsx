import React from 'react';
import { Player, CharacterType } from '../game/core/types';
import PlayerBoard from './PlayerBoard';
import { getCharacterLogic } from '../logic/logic_Registry';

interface PlayerHandAreaProps {
    player: Player;
    isCurrentPlayer: boolean;
    playCard: (cardId: string) => void;
    abilityMode: string;
    setAbilityMode: (mode: string) => void;
    selectedCards: string[];
    setSelectedCards: React.Dispatch<React.SetStateAction<string[]>>;
    performAction: (actionName: string, payload?: any) => void;
    round: number;
    setViewingCharacter: (char: CharacterType | null) => void;
    setItemCardToShow: (item: any) => void;
}

export const PlayerHandArea: React.FC<PlayerHandAreaProps> = ({
    player,
    isCurrentPlayer,
    playCard,
    abilityMode,
    setAbilityMode,
    selectedCards,
    setSelectedCards,
    performAction,
    round,
    setViewingCharacter,
    setItemCardToShow
}) => {
    return (
        <div className="shrink-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative">
            {/* Botones de Acción Flotantes (Action Bar) */}
            {isCurrentPlayer && (
                <div className="absolute bottom-full left-0 w-full flex justify-center pb-4 z-50 pointer-events-none">
                    <div className="pointer-events-auto transform transition-transform hover:scale-105 origin-bottom">
                        {player.character && getCharacterLogic(player.character).renderActions?.({
                            player,
                            abilityMode,
                            setAbilityMode,
                            selectedCards,
                            setSelectedCards,
                            performAction,
                            isCurrentPlayer: true,
                            round
                        })}
                    </div>
                </div>
            )}

            {/* Tablero del Jugador Humano */}
            <div className="max-w-7xl mx-auto p-2 sm:p-4">
                <PlayerBoard
                    player={player}
                    isCurrentPlayer={isCurrentPlayer}
                    onCardPlay={playCard}
                    canPlay={isCurrentPlayer}
                    onCharacterClick={() => setViewingCharacter(player.character)}
                    onItemClick={setItemCardToShow}
                    selectedCards={selectedCards}
                />
            </div>
        </div>
    );
};
