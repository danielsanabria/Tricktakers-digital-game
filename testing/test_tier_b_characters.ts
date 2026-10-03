import { Player, Suit, CardType, CharacterType, Task } from '../game/core/types';
import { AdventurerScoring } from '../logic/scoring/score_Adventurer';
import { CollectorScoring } from '../logic/scoring/score_Collector';
import { RulerScoring } from '../logic/scoring/score_Ruler';
import { AdventurerLogic } from '../logic/characters/logic_Adventurer';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ ASSERTION FAILED: ${message}`);
        throw new Error(`Assertion failed: ${message}`);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

function mockPlayer(id: string, character: CharacterType, wins: number = 0): Player {
    return {
        id,
        name: `Player_${id}`,
        character,
        hand: [],
        wonCards: [],
        wins,
        score: 0,
        crowns: { gold: 0, black: 0 },
        items: [],
        tasks: [],
        mp: 0
    };
}

console.log("=== RUNNING TIER B CHARACTER TESTS ===");

// 1. ADVENTURER (3B) TESTS
console.log("\n--- Testing Adventurer (3B) ---");
const advLogic = new AdventurerLogic();
const advScoring = new AdventurerScoring();

// Setup test for AI player (starts with 2 items and 2 itemSlots)
const deck = [
    { id: '1', suit: Suit.RED, value: 5, type: CardType.NUMBER },
    { id: '2', suit: Suit.BLUE, value: 3, type: CardType.NUMBER },
    { id: '3', suit: Suit.GREEN, value: 7, type: CardType.NUMBER },
    { id: '4', suit: Suit.BLACK, value: 2, type: CardType.NUMBER },
    { id: '5', suit: Suit.COLORLESS, value: 1, type: CardType.NUMBER },
];
const setupResAI = advLogic.setup({ deck, playerId: 'p2', hand: [] });
assert(setupResAI.items !== undefined && setupResAI.items.length === 2 && setupResAI.itemSlots === 2, "Adventurer AI setup gives 2 starting items and 2 item slots");

// Level up test (winning a trick increases slots)
const pAdvTest = mockPlayer('p2', CharacterType.ADVENTURER, 1);
pAdvTest.itemSlots = 2;
pAdvTest.items = setupResAI.items || [];
const wonTrickRes = advLogic.onTrickWon(pAdvTest, [], 1);
assert(wonTrickRes.itemSlots === 3, "Adventurer winning trick increases item slots to 3");

// Scoring by wins
let pAdv = mockPlayer('p1', CharacterType.ADVENTURER, 0);
let res = advScoring.getScore(pAdv, 1, []);
assert(res.score === 20, "Adventurer 0 wins gives 20 pts");

pAdv.wins = 1;
res = advScoring.getScore(pAdv, 1, []);
assert(res.score === 10, "Adventurer 1 win gives 10 pts");

pAdv.wins = 3;
res = advScoring.getScore(pAdv, 1, []);
assert(res.score === 40, "Adventurer 3 wins gives 40 pts");

pAdv.wins = 5;
res = advScoring.getScore(pAdv, 1, []);
assert(res.isInstantWin === true && res.score === 999, "Adventurer 5 wins gives Instant Win (999 pts)");

// Unused item bonuses
pAdv.wins = 2; // base 20 pts
pAdv.items = [
    { id: 'i1', name: 'Item 1', type: 'RED', description: '', effect: '', unusedPoints: 10, imagePath: '' },
    { id: 'i2', name: 'Item 2', type: 'GOLD', description: '', effect: '', unusedPoints: 20, imagePath: '' }
];
res = advScoring.getScore(pAdv, 1, []);
assert(res.score === 20 + 10 + 20, "Adventurer includes unused item points (+30 -> total 50)");


// 2. COLLECTOR (4B) TESTS
console.log("\n--- Testing Collector (4B) ---");
const colScoring = new CollectorScoring();
let pCol = mockPlayer('p1', CharacterType.COLLECTOR, 3);

// Test Straight Flush 3 (e.g., RED 1, RED 2, RED 3) -> 50 pts
pCol.wonCards = [
    { id: 'c1', suit: Suit.RED, value: 1, type: CardType.NUMBER },
    { id: 'c2', suit: Suit.RED, value: 2, type: CardType.NUMBER },
    { id: 'c3', suit: Suit.RED, value: 3, type: CardType.NUMBER },
];
res = colScoring.getScore(pCol, 1, []);
assert(res.score === 50, `Collector Straight Flush 3 scores 50 pts (got ${res.score})`);

// Test Four of a Kind with Rare Wildcard -> 80 pts
pCol.wins = 4;
pCol.wonCards = [
    { id: 'c1', suit: Suit.RED, value: 5, type: CardType.NUMBER },
    { id: 'c2', suit: Suit.BLUE, value: 5, type: CardType.NUMBER },
    { id: 'c3', suit: Suit.GREEN, value: 5, type: CardType.NUMBER },
    { id: 'r1', suit: Suit.COLORLESS, value: 10, type: CardType.RARE }, // Wildcard -> 4th 5
];
res = colScoring.getScore(pCol, 1, []);
assert(res.score === 80, `Collector Four of a Kind with Rare Wildcard scores 80 pts (got ${res.score})`);

// Test penalty for unused cards
pCol.wins = 2;
pCol.wonCards = [
    { id: 'c1', suit: Suit.RED, value: 1, type: CardType.NUMBER },
    { id: 'c2', suit: Suit.RED, value: 2, type: CardType.NUMBER },
    { id: 'c3', suit: Suit.RED, value: 3, type: CardType.NUMBER }, // SF3 = +50
    { id: 'c4', suit: Suit.BLUE, value: 8, type: CardType.NUMBER }, // unused 1
    { id: 'c5', suit: Suit.GREEN, value: 9, type: CardType.NUMBER }, // unused 2 -> penalty -10
];
res = colScoring.getScore(pCol, 1, []);
// SF3 50 - penalty 10 = 40 pts
assert(res.score === 40, `Collector unused cards penalty calculated correctly (got ${res.score})`);


// 3. RULER (5B) TESTS
console.log("\n--- Testing Ruler (5B) ---");
const rulerScoring = new RulerScoring();
let pRuler = mockPlayer('p1', CharacterType.RULER, 1);

// Single win bonus (+20 pts) & Black card (+10 pts)
pRuler.wonCards = [
    { id: 'k1', suit: Suit.BLACK, value: 8, type: CardType.NUMBER }
];
res = rulerScoring.getScore(pRuler, 1, []);
// Base 20 (1 win) + Black card (10) + Single win (20) = 50 pts
assert(res.score === 50, `Ruler 1 win with Black card scores 50 pts (got ${res.score})`);

// Tyranny Instant Win (2+ wins, NO R/B/G cards)
pRuler.wins = 2;
pRuler.wonCards = [
    { id: 'k1', suit: Suit.BLACK, value: 8, type: CardType.NUMBER },
    { id: 'k2', suit: Suit.BLACK, value: 9, type: CardType.NUMBER }
];
res = rulerScoring.getScore(pRuler, 1, []);
assert(res.isInstantWin === true && res.score === 999, "Ruler Tyranny instant win triggers with 2 wins & non-color cards");

// Tyranny fails if colored card present
pRuler.wonCards.push({ id: 'c1', suit: Suit.RED, value: 3, type: CardType.NUMBER });
res = rulerScoring.getScore(pRuler, 1, []);
assert(res.isInstantWin === false && res.score !== 999, "Ruler Tyranny does NOT trigger if Red card is present");

// Task Completion Bonuses
const p2 = mockPlayer('p2', CharacterType.KING, 0);
const task1: Task = {
    id: 't1',
    name: 'No Red',
    difficulty: 'NORMAL',
    description: '',
    points: 10,
    condition: (p: Player) => !p.wonCards.some(c => c.suit === Suit.RED)
};
const task2: Task = {
    id: 't2',
    name: 'Take Red',
    difficulty: 'HARD',
    description: '',
    points: 20,
    condition: (p: Player) => p.wonCards.some(c => c.suit === Suit.RED)
};

// Give p2 normal task (condition passes because p2 has no Red cards)
p2.tasks = [task1];
pRuler.wins = 0; // base 0
pRuler.wonCards = [];
res = rulerScoring.getScore(pRuler, 1, [pRuler, p2]);
// Base 0 + Normal task (+10) + All complete bonus (+10) = 20 pts
assert(res.score === 20, `Ruler opponent task completion gives 20 pts (got ${res.score})`);

// Give p2 both normal and hard task (hard task fails)
p2.tasks = [task1, task2];
res = rulerScoring.getScore(pRuler, 1, [pRuler, p2]);
// Base 0 + Normal task (+10) + hard task (failed, 0) + All complete (failed, 0) = 10 pts
assert(res.score === 10, `Ruler partial opponent task completion gives 10 pts (got ${res.score})`);

console.log("\nALL TIER B TESTS PASSED PERFECTLY! 🎉");
