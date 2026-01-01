import { determineWinner } from '../game/core/gameLogic';
import { Player, Suit, CardType, Card, CharacterType } from '../game/core/types';

const basePlayer: Player = {
    id: 'p1', name: 'P1', character: CharacterType.KING, hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0, mp: 0, beasts: [], rearBeasts: [], magicElements: [], items: [], tasks: [], collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: []
};
const p2 = { ...basePlayer, id: 'p2', name: 'P2', character: CharacterType.GAMBLER };
const p3 = { ...basePlayer, id: 'p3', name: 'P3', character: CharacterType.BERSERKER };
const players = [basePlayer, p2, p3];

function runTest(name: string, cards: Card[], leadSuit: Suit | null, expectedWinnerId: string, isKakumei = false) {
    const isBerserkerInPlay = players.some(p => p.character === CharacterType.BERSERKER);
    const winnerId = determineWinner(cards, leadSuit, false, isKakumei, players);
    if (winnerId === expectedWinnerId) {
        console.log(`✅ ${name}`);
    } else {
        console.error(`❌ ${name} | Expected: ${expectedWinnerId}, Got: ${winnerId}`);
    }
}

console.log("=== TRICK RESOLUTION VERIFICATION ===");

// Scenario 1: Standard Lead Suit
runTest('Standard: Lead Suit (Red 7) beats Off-suit (Blue 9)', [
    { id: 'c1', suit: Suit.RED, value: 7, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c2', suit: Suit.BLUE, value: 9, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.RED, 'p1');

// Scenario 2: Trump beats Lead Suit
runTest('Standard: Trump (Black 3) beats Lead (Red 7)', [
    { id: 'c1', suit: Suit.RED, value: 7, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c2', suit: Suit.BLACK, value: 3, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.RED, 'p2');

// Scenario 3: Hermit reported bug (King Black 3 vs Hermit Red 7, Lead Red)
runTest('Reported Bug: King (Black 3) beats Hermit (Red 7) when Red leads', [
    { id: 'c1', suit: Suit.RED, value: 7, type: CardType.NUMBER, ownerId: 'p3' }, // Hermit
    { id: 'c2', suit: Suit.BLACK, value: 3, type: CardType.NUMBER, ownerId: 'p1' }  // King
], Suit.RED, 'p1');

// Scenario 4: "1 beats 10" rule
runTest('Standard: 1 beats 10 of same color (First 10, then 1)', [
    { id: 'c1', suit: Suit.RED, value: 10, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c2', suit: Suit.RED, value: 1, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.RED, 'p2');

runTest('Standard: 1 beats 10 of same color (First 1, then 10)', [
    { id: 'c1', suit: Suit.RED, value: 1, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c2', suit: Suit.RED, value: 10, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.RED, 'p1');

// Scenario 5: White Flag (Berserker) vs Off-suit number
runTest('White Flag (0) vs Off-suit (9)', [
    { id: 'c1', suit: Suit.BLUE, value: 9, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c2', suit: Suit.COLORLESS, value: 0, type: CardType.WHITE_FLAG, ownerId: 'p2' }
], Suit.RED, 'p1');

// Scenario 6: Kakumei (Revolution)
runTest('Kakumei: Lowest Wins (1 beats 10)', [
    { id: 'c1', suit: Suit.RED, value: 10, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c2', suit: Suit.RED, value: 1, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.RED, 'p2', true);

runTest('Kakumei: Colors beat Trump (Red 1 beats Black 7)', [
    { id: 'c1', suit: Suit.RED, value: 1, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c2', suit: Suit.BLACK, value: 7, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.RED, 'p1', true);

// Berserker Specifics
runTest('Berserker: 1 beats Berserker Main Card (any suit)', [
    { id: 'berserker-main-p3', suit: Suit.COLORLESS, value: 12, type: CardType.RARE, ownerId: 'p3' },
    { id: 'c1', suit: Suit.RED, value: 1, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.BLUE, 'p2');

runTest('Berserker: 1 does NOT beat Berserker 10 of different suit', [
    { id: 'berserker-10-RED-p3', suit: Suit.RED, value: 10, type: CardType.NUMBER, ownerId: 'p3' },
    { id: 'c1', suit: Suit.BLUE, value: 1, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.GREEN, 'p3');

runTest('Rare: 1 does NOT beat Rare (value 11)', [
    { id: 'rare-1', suit: Suit.COLORLESS, value: 11, type: CardType.RARE, ownerId: 'p1' },
    { id: 'c1', suit: Suit.RED, value: 1, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.RED, 'p1');

runTest('Berserker: Hierarchy (Berserker > Rare)', [
    { id: 'berserker-main-p3', suit: Suit.COLORLESS, value: 12, type: CardType.RARE, ownerId: 'p3' },
    { id: 'rare-1', suit: Suit.COLORLESS, value: 11, type: CardType.RARE, ownerId: 'p2' }
], Suit.RED, 'p3');

runTest('Berserker: Kakumei (1 beats Berserker is annulled, but 1 still wins because Low Wins)', [
    { id: 'berserker-main-p3', suit: Suit.COLORLESS, value: 12, type: CardType.RARE, ownerId: 'p3' },
    { id: 'c1', suit: Suit.RED, value: 1, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.RED, 'p2', true);

// Circular Rule of 1 (The bug report case)
runTest('Rule of 1 Circular: 1 vs 2 vs 10 (2 should win as 2 beats 1 and 10 is nerfed)', [
    { id: 'c1', suit: Suit.RED, value: 1, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c2', suit: Suit.RED, value: 2, type: CardType.NUMBER, ownerId: 'p2' },
    { id: 'berserker-10-RED-p3', suit: Suit.RED, value: 10, type: CardType.NUMBER, ownerId: 'p3' }
], Suit.RED, 'p2');

// Berserker vs Trump (User log case)
runTest('Berserker vs Trump: BLUE 10 (Berserker) vs BLACK 8 (Trump)', [
    { id: 'berserker-10-BLUE-p3', suit: Suit.BLUE, value: 10, type: CardType.NUMBER, ownerId: 'p3' },
    { id: 'c8', suit: Suit.BLACK, value: 8, type: CardType.NUMBER, ownerId: 'p2' }
], Suit.BLUE, 'p3');

console.log("=== VERIFICATION END ===");
