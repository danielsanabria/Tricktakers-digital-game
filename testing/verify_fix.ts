import { determineWinner } from '../game/core/gameLogic';
import { Card, Suit, CardType, GamePhase, Player } from '../game/core/types';

// Mock Players
const players: Player[] = [
    { id: 'p1', name: 'Berserker', character: 'BERSERKER' } as any,
    { id: 'p2', name: 'King', character: 'KING' } as any,
    { id: 'p3', name: 'Gambler', character: 'GAMBLER' } as any
];

// Scenario: Rare Leads.
const rareCard: Card = { id: 'c1', suit: Suit.COLORLESS, value: 11, type: CardType.RARE, ownerId: 'p1' };
const black7: Card = { id: 'c2', suit: Suit.BLACK, value: 7, type: CardType.NUMBER, ownerId: 'p2' };
const black1: Card = { id: 'c3', suit: Suit.BLACK, value: 1, type: CardType.NUMBER, ownerId: 'p3' };

const cards = [rareCard, black7, black1];
const leadSuit = null; // RARE led, so no suit.

// Run
const winner = determineWinner(cards, leadSuit, false, false, players, false);
console.log(`Winner with leadSuit=null: ${winner} (Expected: p1)`);

// Scenario 2: Black Leads (King plays Black 7).
const leadSuitBlack = Suit.BLACK;
// If Lead is Black, Rare should still win?
// DetermineWinner logic:
// Rare (Colorless) is Valid. Black (Lead) is Valid.
// Compare Power: Rare (11) vs Black (7). Rare wins.
const winner2 = determineWinner(cards, leadSuitBlack, false, false, players, false);
console.log(`Winner with leadSuit=BLACK: ${winner2} (Expected: p1)`);

