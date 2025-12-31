
import { KingLogic } from './logic_King';
import { StrategistLogic } from './logic_Strategist';
import { CharacterType, Suit, CardType, Player } from './types';

// Mock Data
const mockDeck = Array(50).fill(null).map((_, i) => ({
    id: `card-${i}`,
    suit: i % 2 === 0 ? Suit.RED : Suit.BLUE,
    value: (i % 9) + 1,
    type: CardType.NUMBER
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
    mp: 0
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

console.log("\n--- VERIFICATION COMPLETE ---");
