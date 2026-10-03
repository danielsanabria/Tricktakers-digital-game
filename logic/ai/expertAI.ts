import { Card, Suit, CardType, CharacterType, Player } from '../../game/core/types';
import { getValidMoves } from '../../game/core/gameLogic';
import { getCharacterLogic } from '../logic_Registry';
import { AIContext } from './aiTypes';
import { getCharacterTrickIntention, TrickIntention } from './aiCharacterGoals';

/**
 * Calculates raw estimated power of a card in the trick context.
 */
function estimateCardPower(card: Card, context: AIContext, targetPlayer?: Player): number {
    const player = targetPlayer || context.player;
    const { leadSuit, playedCards, isRevolt, isKakumei, allPlayers } = context;
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
 * Collects all cards known to have been played so far in this round.
 */
function getKnownPlayedCards(context: AIContext): Card[] {
    const cards: Card[] = [...context.playedCards];
    for (const p of context.allPlayers) {
        if (p.wonCards && p.wonCards.length > 0) {
            cards.push(...p.wonCards);
        }
    }
    return cards;
}

/**
 * Checks if an opponent poses an immediate tournament threat.
 */
function getTournamentThreat(allPlayers: Player[], selfId: string): Player | null {
    // 1 Gold Crown -> 1 more ends the match
    // 2 Black Crowns -> 1 more ends the match
    for (const p of allPlayers) {
        if (p.id !== selfId) {
            if (p.goldCrowns >= 1 || p.blackCrowns >= 2) {
                return p;
            }
        }
    }
    return null;
}

/**
 * Expert AI:
 * - Card counting & tracking of remaining high cards and trumps.
 * - Positional awareness (leading vs middle vs last to play).
 * - Exact win-condition optimization tailored to each character.
 * - Tournament meta-defense (denying trick wins to players threatening tournament victory).
 * - High-efficiency dumping (shedding high dead cards when ducking).
 */
export function getExpertAiMove(context: AIContext): string {
    const { player, leadSuit, playedCards, trick, round, allPlayers } = context;
    const validMoves = getValidMoves(player.hand, leadSuit);
    if (validMoves.length === 0) return '';
    if (validMoves.length === 1) return validMoves[0].id;

    const knownPlayed = getKnownPlayedCards(context);
    const threat = getTournamentThreat(allPlayers, player.id);
    const intention = getCharacterTrickIntention(player, round, trick);
    const isLead = playedCards.length === 0;
    const isTail = playedCards.length === allPlayers.length - 1;

    // Power evaluation of all valid moves
    const cardsWithPower = validMoves.map(card => ({
        card,
        power: estimateCardPower(card, context)
    }));

    // Find current winning card and power on the table
    let currentBestPower = -Infinity;
    let currentWinningPlayerId = '';
    for (const pc of playedCards) {
        const owner = allPlayers.find(p => p.id === pc.ownerId) || player;
        const pPower = estimateCardPower(pc, context, owner);
        if (pPower > currentBestPower) {
            currentBestPower = pPower;
            currentWinningPlayerId = owner.id;
        }
    }

    // 1. Character-Specific Expert Tactics
    // Hermit: Crush opponent RARE with White Flag immediately
    if (player.character === CharacterType.HERMIT) {
        const rareInPlay = playedCards.some(c => c.type === CardType.RARE);
        const whiteFlag = validMoves.find(c => c.type === CardType.WHITE_FLAG);
        if (rareInPlay && whiteFlag) {
            return whiteFlag.id;
        }
    }

    // Berserker Opponent Sabotage:
    // If Berserker has 0 wins in tricks 4 or 5, and Berserker led or played a card,
    // don't take the trick if Berserker is currently winning, to force them to take a win!
    const berserkerOpponent = allPlayers.find(p => p.id !== player.id && p.character === CharacterType.BERSERKER);
    if (berserkerOpponent && berserkerOpponent.wins === 0 && trick >= 4) {
        if (currentWinningPlayerId === berserkerOpponent.id) {
            // Berserker is currently winning! Let them win to break their 0-win condition!
            const losingMoves = cardsWithPower.filter(cp => cp.power < currentBestPower);
            if (losingMoves.length > 0) {
                // Dump highest safe card
                losingMoves.sort((a, b) => b.power - a.power);
                return losingMoves[0].card.id;
            }
        }
    }

    // Tournament Defense: If current winner is a major tournament threat, try to stop them
    const mustDefendAgainstThreat = threat && currentWinningPlayerId === threat.id;

    // 2. WANT TO WIN (or must defend against threat)
    if (intention === TrickIntention.WANT_WIN || mustDefendAgainstThreat) {
        const winningCandidates = cardsWithPower.filter(cp => cp.power > currentBestPower);

        if (winningCandidates.length > 0) {
            if (isTail) {
                // Perfect efficiency: take trick with the lowest winning card
                winningCandidates.sort((a, b) => a.power - b.power);
                return winningCandidates[0].card.id;
            }

            // Middle position:
            // If opponents behind us can overruff, play a stronger card if available
            // but don't waste absolute boss if a moderately high winning card suffices
            winningCandidates.sort((a, b) => a.power - b.power);
            if (winningCandidates.length > 1 && playedCards.length === 1) {
                // Second to play: pick upper-middle card to avoid being easily overtaken
                return winningCandidates[Math.min(1, winningCandidates.length - 1)].card.id;
            }
            return winningCandidates[0].card.id;
        }

        // Cannot win trick: Conserve best cards for future tricks, discard lowest value card
        cardsWithPower.sort((a, b) => a.power - b.power);
        return cardsWithPower[0].card.id;
    }

    // 3. WANT TO LOSE (Berserker, Gambler done, Samurai at cap, etc.)
    if (intention === TrickIntention.WANT_LOSE) {
        if (isLead) {
            // Leading when wanting to lose:
            // Lead lowest number card, avoiding trumps and rare cards
            const nonSpecials = validMoves.filter(c => c.type === CardType.NUMBER);
            if (nonSpecials.length > 0) {
                nonSpecials.sort((a, b) => a.value - b.value);
                return nonSpecials[0].id;
            }
            cardsWithPower.sort((a, b) => a.power - b.power);
            return cardsWithPower[0].card.id;
        }

        // Not leading: find cards that do NOT beat the current best power
        const safeLosingCandidates = cardsWithPower.filter(cp => cp.power < currentBestPower);
        if (safeLosingCandidates.length > 0) {
            // Safely dump highest card to get rid of dangerous high cards!
            safeLosingCandidates.sort((a, b) => b.power - a.power);
            return safeLosingCandidates[0].card.id;
        }

        // Forced to win or all cards beat current power: play lowest power available
        cardsWithPower.sort((a, b) => a.power - b.power);
        return cardsWithPower[0].card.id;
    }

    // 4. NEUTRAL PLAY:
    if (isLead) {
        // Lead strongest suit card if we hold high cards, or middle card
        cardsWithPower.sort((a, b) => b.power - a.power);
        return cardsWithPower[0].card.id;
    }

    if (isTail) {
        const winningMoves = cardsWithPower.filter(cp => cp.power > currentBestPower);
        if (winningMoves.length > 0) {
            winningMoves.sort((a, b) => a.power - b.power);
            return winningMoves[0].card.id;
        }
        // Dump highest losing card
        cardsWithPower.sort((a, b) => b.power - a.power);
        return cardsWithPower[0].card.id;
    }

    // Middle position fallback
    const winningCandidates = cardsWithPower.filter(cp => cp.power > currentBestPower);
    if (winningCandidates.length > 0) {
        winningCandidates.sort((a, b) => a.power - b.power);
        return winningCandidates[0].card.id;
    }

    cardsWithPower.sort((a, b) => a.power - b.power);
    return cardsWithPower[0].card.id;
}
