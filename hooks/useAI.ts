import { useEffect } from 'react';
import { Player, Card, GamePhase, Suit } from '../game/core/types';
import { getValidMoves, getAiMove } from '../game/core/gameLogic';

interface UseAIProps {
    phase: GamePhase;
    currentPlayerIdx: number;
    players: Player[];
    isResolving: boolean;
    abilityMode: string;
    leadSuit: Suit | null;
    playedCards: Card[];
    selectionIndex: number;
    selectionOrder: string[];
    characterPool: any[];
    selectCharacter: (char: any) => void;
    playCard: (cardId: string) => void;
}

export const useAI = ({
    phase,
    currentPlayerIdx,
    players,
    isResolving,
    abilityMode,
    leadSuit,
    playedCards,
    selectionIndex,
    selectionOrder,
    characterPool,
    selectCharacter,
    playCard
}: UseAIProps) => {

    // AI Character Selection
    useEffect(() => {
        if (phase === GamePhase.CHARACTER_SELECTION) {
            const currentPickerId = selectionOrder[selectionIndex];
            if (currentPickerId && currentPickerId !== 'p1') {
                const timer = setTimeout(() => {
                    const available = characterPool.filter(ct => !players.some(p => p.character === ct));
                    if (available.length > 0) {
                        const randomChar = available[Math.floor(Math.random() * available.length)];
                        selectCharacter(randomChar);
                    }
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [phase, selectionIndex, selectionOrder, players, characterPool, selectCharacter]);

    // AI Turn Play
    useEffect(() => {
        if (phase === GamePhase.TRICK_PLAYING && currentPlayerIdx !== 0 && !isResolving && abilityMode === 'NONE') {
            const timer = setTimeout(() => {
                try {
                    const p = players[currentPlayerIdx];
                    const moveId = getAiMove(p, leadSuit, playedCards);
                    if (moveId) playCard(moveId);
                    else {
                        console.warn("AI returned no move. Using fallback.");
                        const valid = getValidMoves(p.hand, leadSuit);
                        if (valid.length > 0) playCard(valid[0].id);
                    }
                } catch (e) {
                    console.error("AI Turn Error:", e);
                    const p = players[currentPlayerIdx];
                    const valid = getValidMoves(p.hand, leadSuit);
                    if (valid.length > 0) playCard(valid[0].id);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentPlayerIdx, phase, abilityMode, players, leadSuit, playedCards, isResolving, playCard]);
};
