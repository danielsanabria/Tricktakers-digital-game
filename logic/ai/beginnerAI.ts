import { Card, Suit } from '../../game/core/types';
import { getValidMoves } from '../../game/core/gameLogic';
import { AIContext } from './aiTypes';

/**
 * Beginner AI:
 * - Plays mostly randomly from valid moves.
 * - Occasionally discards lowest card.
 * - Makes typical human-beginner mistakes (doesn't count cards or plan ahead).
 */
export function getBeginnerAiMove(context: AIContext): string {
    const { player, leadSuit } = context;
    const validMoves = getValidMoves(player.hand, leadSuit);
    if (validMoves.length === 0) return '';

    // 70% random valid move, 30% lowest card
    if (Math.random() < 0.7) {
        const randomCard = validMoves[Math.floor(Math.random() * validMoves.length)];
        return randomCard.id;
    }

    // Play lowest valid card
    const sorted = [...validMoves].sort((a, b) => a.value - b.value);
    return sorted[0].id;
}
