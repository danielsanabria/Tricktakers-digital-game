import { useEffect } from 'react';
import { Player, Card, GamePhase, Suit, AIDifficulty } from '../game/core/types';
import { getValidMoves, getAiMove } from '../game/core/gameLogic';

interface UseAIProps {
    enabled?: boolean;
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
    trick?: number;
    round?: number;
    difficulty?: AIDifficulty;
    isRevolt?: boolean;
    isKakumei?: boolean;
}

export const useAI = ({
    enabled = true,
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
    playCard,
    trick,
    round,
    difficulty,
    isRevolt,
    isKakumei
}: UseAIProps) => {

    // AI Character Selection
    useEffect(() => {
        if (!enabled) return;
        if (phase === GamePhase.CHARACTER_SELECTION) {
            const currentPickerId = selectionOrder[selectionIndex];
            const pickerPlayer = players.find(p => p.id === currentPickerId);
            const isBotPicker = pickerPlayer ? (!pickerPlayer.isHuman || pickerPlayer.isBotControlled) : false;

            if (currentPickerId && isBotPicker) {
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
    }, [enabled, phase, selectionIndex, selectionOrder, players, characterPool, selectCharacter]);

    // AI Turn Play
    useEffect(() => {
        if (!enabled) return;
        const currentP = players[currentPlayerIdx];
        const isBotTurn = currentP ? (!currentP.isHuman || currentP.isBotControlled) : false;

        if (phase === GamePhase.TRICK_PLAYING && isBotTurn && !isResolving && abilityMode === 'NONE') {
            const timer = setTimeout(() => {
                try {
                    const p = players[currentPlayerIdx];
                    const moveId = getAiMove(p, leadSuit, playedCards, {
                        trick,
                        round,
                        allPlayers: players,
                        difficulty: p.aiDifficulty || difficulty,
                        isRevolt,
                        isKakumei
                    });
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
    }, [currentPlayerIdx, phase, abilityMode, players, leadSuit, playedCards, isResolving, playCard, trick, round, difficulty, isRevolt, isKakumei]);
};
