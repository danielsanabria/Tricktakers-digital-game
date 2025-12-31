import { KingLogic } from '../logic/characters/logic_King';
import { StrategistLogic } from '../logic/characters/logic_Strategist';
import { PhantomThiefLogic } from '../logic/characters/logic_PhantomThief';
import { CharacterType, Suit, CardType, Player } from '../game/core/types';
import { determineWinner } from '../game/core/gameLogic';

// Mock Data
const mockDeck = Array(50).fill(null).map((_, i) => ({
    id: `card-${i}`,
    suit: i % 2 === 0 ? Suit.RED : Suit.BLUE,
    value: (i % 9) + 1,
    type: CardType.NUMBER,
    ownerId: `p${i % 3}`
}));

const mockPlayer: Player = {
    id: 'test-p1',
    name: 'Test Player',
    character: null,
    hand: [],
    wonCards: [],
    score: 0,
    goldCrowns: 0,
    blackCrowns: 0,
    wins: 0,
    items: [],
    tasks: [],
    beasts: [],
    rearBeasts: [],
    magicElements: [],
    itemSlots: 0,
    mp: 0,
    collectedCards: [],
    gambleSwaps: 0,
    bid: undefined,
    betAmount: 0,
    timeTravelTokens: 0,
    timeTravelPredictions: []
};

console.log("--- STARTING VERIFICATION ---");

// Test 1: King Setup
console.log("\n[TEST 1] King Setup");
const kingLogic = new KingLogic();
const kingSetup = kingLogic.setup({
    deck: [...mockDeck],
    playerId: 'test-p1',
    round: 1,
    players: [mockPlayer]
});

const hasKingRare = kingSetup.hand?.some(c => c.type === CardType.RARE && c.suit === Suit.COLORLESS);
const kingHandSize = kingSetup.hand?.length;

if (hasKingRare && kingHandSize === 6) {
    console.log("✅ PASS: King starts with Rare Card and 6 cards (needs discard).");
} else {
    console.error("❌ FAIL: King setup incorrect.", { hasKingRare, kingHandSize });
}

// Test 2: Strategist Setup
console.log("\n[TEST 2] Strategist Setup");
const stratLogic = new StrategistLogic();
const stratSetup = stratLogic.setup({
    deck: [...mockDeck],
    playerId: 'test-p1',
    round: 1,
    players: [mockPlayer]
});

const hasBlack7 = stratSetup.hand?.some(c => c.value === 7 && c.suit === Suit.BLACK);
const stratHandSize = stratSetup.hand?.length;

if (hasBlack7 && stratHandSize === 6) {
    console.log("✅ PASS: Strategist starts with Black 7 and 6 cards.");
} else {
    console.error("❌ FAIL: Strategist setup incorrect.", { hasBlack7, stratHandSize });
}

// Test 3: King Instant Win Logic
console.log("\n[TEST 3] King Instant Win");
const kingWinResult = kingLogic.onTrickWon({ ...mockPlayer, wins: 4 }, [], 1);
if (kingWinResult.score === 999) {
    console.log("✅ PASS: King triggers Instant Win (999 pts) on 5th win.");
} else {
    console.error("❌ FAIL: King did not trigger instant win.", kingWinResult);
}

// TEST 4: 3 Rares Logic
console.log("\n[TEST 4] 3 Rares Logic (First Wins)");
const rare1 = { id: 'r1', suit: Suit.COLORLESS, value: 11, type: CardType.RARE, ownerId: 'p1' };
const rare2 = { id: 'r2', suit: Suit.COLORLESS, value: 11, type: CardType.RARE, ownerId: 'p2' };
const rare3 = { id: 'r3', suit: Suit.COLORLESS, value: 11, type: CardType.RARE, ownerId: 'p3' };

// Played in order: r1, r2, r3
const playedCards = [rare1, rare2, rare3];
const winnerId = determineWinner(playedCards, Suit.RED, false, false, [
    { ...mockPlayer, id: 'p1' },
    { ...mockPlayer, id: 'p2' },
    { ...mockPlayer, id: 'p3' }
]);

if (winnerId === 'p1') {
    console.log("✅ PASS: First Rare played wins when 3 Rares are present.");
} else {
    console.error("❌ FAIL: Wrong winner for 3 Rares.", winnerId);
}

// TEST 5: Phantom Thief Steal
console.log("\n[TEST 5] Phantom Thief Steal Logic");
const thiefWins = 3;
const victimWins = 2; // Diff 1

const thiefPlayer: Player = {
    ...mockPlayer,
    id: 'thief',
    name: 'Lupin',
    character: CharacterType.PHANTOM_THIEF,
    wins: thiefWins,
    thiefTargetIds: ['victim'],
    thiefChipValue: 1, // Chip 1 => Matches Diff +/- 1
    goldCrowns: 0
};
const victimPlayer: Player = {
    ...mockPlayer,
    id: 'victim',
    name: 'Victim',
    wins: victimWins,
    goldCrowns: 1,
    score: 50
};

const playersList = [thiefPlayer, victimPlayer];
const theftResult = PhantomThiefLogic.resolveSteal(playersList, (msg) => console.log("LOG:", msg));

const thiefAfter = theftResult.find(p => p.id === 'thief');
const victimAfter = theftResult.find(p => p.id === 'victim');

if (thiefAfter?.goldCrowns === 1 && victimAfter?.goldCrowns === 0) {
    console.log("✅ PASS: Phantom Thief stole Gold Crown (Diff 1, Chip 1).");
} else {
    console.error("❌ FAIL: Theft failed.", { thief: thiefAfter?.goldCrowns, victim: victimAfter?.goldCrowns });
}


console.log("\n--- VERIFICATION COMPLETE ---");
