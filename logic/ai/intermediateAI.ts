import { Card, Suit, CardType, CharacterType } from '../../game/core/types';
import { getValidMoves } from '../../game/core/gameLogic';
import { getCharacterLogic } from '../logic_Registry';
import { AIContext } from './aiTypes';
import { getCharacterTrickIntention, TrickIntention } from './aiCharacterGoals';

/**
 * Calculates raw estimated power of a card in the current trick context.
 */
function estimateCardPower(card: Card, context: AIContext): number {
    const { player, leadSuit, playedCards, isRevolt, isKakumei, allPlayers } = context;
    const logic = getCharacterLogic(player.character);

    const trickContainsRare = playedCards.some(c => c.type === CardType.RARE) || card.type === CardType.RARE;
    const onesInSuits = [...playedCards, card].filter(c => c.value === 1).map(c => c.suit);
    const tensInSuits = [...playedCards, card].filter(c => c.value === 10).map(c => c.suit);
    const whiteFlagInPlay = playedCards.some(c => c.type === CardType.WHITE_FLAG) || card.type === CardType.WHITE_FLAG;
    const hermitInPlay = allPlayers.some(p => p.character === CharacterType.HERMIT);
    const berserkerInPlay = allPlayers.some(p => p.character === CharacterType.BERSERKER);

    return logic.getCardPower({
        card,
        leadSuit,
        isRevolt: isRevolt || false,
        isKakumei: isKakumei || false,
        trickContainsRare,
        onesInSuits,
        tensInSuits,
        berserker10Suits: [],
        berserkerMainInPlay: false,
        whiteFlagInPlay,
        hermitInPlay,
        berserkerInPlay,
        player
    });
}

/**
 * Intermediate AI:
 * - Understands whether it wants to win or lose the trick based on its character goal.
 * - Wins efficiently (lowest winning card).
 * - Dumps safely when losing (lowest useless card).
 * - Reacts to character-specific triggers (e.g. Hermit vs Rare, Samurai 4-win cap).
 */
export function getIntermediateAiMove(context: AIContext): string {
    const { player, leadSuit, playedCards, trick, round } = context;
    const validMoves = getValidMoves(player.hand, leadSuit);
    if (validMoves.length === 0) return '';
    if (validMoves.length === 1) return validMoves[0].id;

    // 1. Character-Specific Immediate Triggers
    // Hermit: If an opponent played a Rare card, play White Flag to crush it!
    if (player.character === CharacterType.HERMIT) {
        const rareInPlay = playedCards.some(c => c.type === CardType.RARE);
        const whiteFlag = validMoves.find(c => c.type === CardType.WHITE_FLAG);
        if (rareInPlay && whiteFlag) {
            return whiteFlag.id;
        }
    }

    // Berserker counter: If 10 is in play and AI has 1 of that suit
    const tensPlayed = playedCards.filter(c => c.value === 10);
    if (tensPlayed.length > 0) {
        const matchingOne = validMoves.find(c => c.value === 1 && tensPlayed.some(t => t.suit === c.suit));
        if (matchingOne) {
            return matchingOne.id;
        }
    }

    // 2. Determine Intention (WANT_WIN vs WANT_LOSE)
    const intention = getCharacterTrickIntention(player, round, trick);

    // Evaluate power of each valid card
    const cardsWithPower = validMoves.map(card => ({
        card,
        power: estimateCardPower(card, context)
    }));

    // Find current winning power among played cards
    let currentBestPower = -Infinity;
    for (const pc of playedCards) {
        const oppPlayer = context.allPlayers.find(p => p.id === pc.ownerId) || player;
        const oppPower = estimateCardPower(pc, { ...context, player: oppPlayer });
        if (oppPower > currentBestPower) {
            currentBestPower = oppPower;
        }
    }

    // 3. WANT TO WIN:
    if (intention === TrickIntention.WANT_WIN) {
        // Find cards that can beat the current best power
        const winningCandidates = cardsWithPower.filter(cp => cp.power > currentBestPower);

        if (winningCandidates.length > 0) {
            // Sort ascending by power to pick the cheapest winning card (efficiency!)
            winningCandidates.sort((a, b) => a.power - b.power);
            return winningCandidates[0].card.id;
        }

        // Cannot win this trick -> conserve strong cards, discard lowest card
        cardsWithPower.sort((a, b) => a.power - b.power);
        return cardsWithPower[0].card.id;
    }

    // 4. WANT TO LOSE (e.g. Berserker, Samurai at 4 wins, Gambler at bid limit):
    if (intention === TrickIntention.WANT_LOSE) {
        // Find cards that do NOT beat the current best power
        if (playedCards.length > 0) {
            const losingCandidates = cardsWithPower.filter(cp => cp.power < currentBestPower);
            if (losingCandidates.length > 0) {
                // Play highest safe losing card to dump it, or lowest card
                losingCandidates.sort((a, b) => a.power - b.power);
                return losingCandidates[0].card.id;
            }
        }

        // Leading or forced to play: play lowest power card available
        cardsWithPower.sort((a, b) => a.power - b.power);
        return cardsWithPower[0].card.id;
    }

    // 5. NEUTRAL (Default solid trick play)
    if (playedCards.length > 0) {
        const winMoves = cardsWithPower.filter(cp => cp.power > currentBestPower);
        if (winMoves.length > 0 && Math.random() < 0.6) {
            winMoves.sort((a, b) => a.power - b.power);
            return winMoves[0].card.id;
        }
    }

    cardsWithPower.sort((a, b) => a.power - b.power);
    return cardsWithPower[0].card.id;
}
