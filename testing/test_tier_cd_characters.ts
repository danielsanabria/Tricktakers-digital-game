import { Player, Suit, CardType, CharacterType } from '../game/core/types';
import { StrategistLogic } from '../logic/characters/logic_Strategist';
import { StrategistScoring } from '../logic/scoring/score_Strategist';
import { SummonerLogic } from '../logic/characters/logic_Summoner';
import { SummonerScoring } from '../logic/scoring/score_Summoner';
import { NinjaScoring } from '../logic/scoring/score_Ninja';
import { SamuraiLogic } from '../logic/characters/logic_Samurai';
import { SamuraiScoring } from '../logic/scoring/score_Samurai';
import { AlchemistLogic } from '../logic/characters/logic_Alchemist';
import { AlchemistScoring } from '../logic/scoring/score_Alchemist';
import { TimeTravelerScoring } from '../logic/scoring/score_TimeTraveler';
import { PhantomThiefScoring } from '../logic/scoring/score_PhantomThief';

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

console.log("=== RUNNING TIERS C & D CHARACTER TESTS ===");

// 1. STRATEGIST (1C)
console.log("\n--- Testing Strategist (1C) ---");
const stratLogic = new StrategistLogic();
const stratScoring = new StrategistScoring();

const deck = [
    { id: '1', suit: Suit.RED, value: 5, type: CardType.NUMBER },
    { id: '2', suit: Suit.BLUE, value: 3, type: CardType.NUMBER },
    { id: '3', suit: Suit.GREEN, value: 7, type: CardType.NUMBER },
    { id: '4', suit: Suit.BLACK, value: 2, type: CardType.NUMBER },
    { id: '5', suit: Suit.COLORLESS, value: 1, type: CardType.NUMBER },
];
const stratSetup = stratLogic.setup({ deck: [...deck], playerId: 'p1', hand: undefined });
assert(stratSetup.hand !== undefined && stratSetup.hand.length === 5, "Strategist starts with 5 cards hand (Black 7 reserved)");

let pStrat = mockPlayer('p1', CharacterType.STRATEGIST, 0);
let res = stratScoring.getScore(pStrat, 1, []);
assert(res.score === 50, "Strategist 0 wins gives 50 pts");

pStrat.wins = 2;
res = stratScoring.getScore(pStrat, 1, []);
assert(res.score === -50, "Strategist 2 wins gives -50 pts");

pStrat.wins = 5;
res = stratScoring.getScore(pStrat, 1, []);
assert(res.isInstantWin === true && res.score === 999, "Strategist 5 wins gives Instant Win (999 pts)");


// 2. SUMMONER (2C)
console.log("\n--- Testing Summoner (2C) ---");
const summLogic = new SummonerLogic();
const summScoring = new SummonerScoring();

const summSetup = summLogic.setup({ deck: [], playerId: 'p1', players: [] });
assert(summSetup.mp === 5 && summSetup.beasts?.length === 6, "Summoner starts with 5 MP and 6 beasts");

let pSumm = mockPlayer('p1', CharacterType.SUMMONER, 0);
res = summScoring.getScore(pSumm, 1, []);
assert(res.score === -20, "Summoner 0 wins gives -20 pts");

pSumm.wins = 3;
res = summScoring.getScore(pSumm, 1, []);
assert(res.score === 70, "Summoner 3 wins gives 70 pts");

pSumm.wins = 5;
res = summScoring.getScore(pSumm, 1, []);
assert(res.isInstantWin === true && res.score === 999, "Summoner 5 wins gives Instant Win (999 pts)");


// 3. NINJA (2D)
console.log("\n--- Testing Ninja (2D) ---");
const ninjaScoring = new NinjaScoring();
let pNinja = mockPlayer('p1', CharacterType.NINJA, 0);
res = ninjaScoring.getScore(pNinja, 1, []);
assert(res.score === 70, "Ninja 0 wins gives 70 pts");

pNinja.wins = 1;
res = ninjaScoring.getScore(pNinja, 1, []);
assert(res.score === -20, "Ninja 1 win gives -20 pts");

pNinja.wins = 4;
res = ninjaScoring.getScore(pNinja, 1, []);
assert(res.score === 140, "Ninja 4 wins gives 140 pts");

pNinja.wins = 5;
res = ninjaScoring.getScore(pNinja, 1, []);
assert(res.isInstantWin === true && res.score === 999, "Ninja 5 wins gives Instant Win (999 pts)");


// 4. SAMURAI (3D)
console.log("\n--- Testing Samurai (3D) ---");
const samLogic = new SamuraiLogic();
const samScoring = new SamuraiScoring();

const deckWithBlack = [
    { id: '1', suit: Suit.BLACK, value: 5, type: CardType.NUMBER },
    { id: '2', suit: Suit.BLUE, value: 3, type: CardType.NUMBER },
    { id: '3', suit: Suit.GREEN, value: 7, type: CardType.NUMBER },
    { id: '4', suit: Suit.BLACK, value: 2, type: CardType.NUMBER },
    { id: '5', suit: Suit.RED, value: 1, type: CardType.NUMBER },
    { id: '6', suit: Suit.RED, value: 8, type: CardType.NUMBER },
    { id: '7', suit: Suit.BLUE, value: 9, type: CardType.NUMBER },
];
const samSetup = samLogic.setup({ deck: deckWithBlack, playerId: 'p1', hand: undefined });
const hasBlack = samSetup.hand?.some(c => c.suit === Suit.BLACK);
assert(!hasBlack, "Samurai setup purges all Black cards from starting hand");

let pSam = mockPlayer('p1', CharacterType.SAMURAI, 4);
res = samScoring.getScore(pSam, 1, []);
assert(res.isInstantWin === true && res.score === 999, "Samurai 4 wins gives Instant Win (999 pts)");

pSam.wins = 5;
res = samScoring.getScore(pSam, 1, []);
assert(res.score === -100 && !res.isInstantWin, "Samurai 5 wins triggers Greed penalty (-100 pts)");


// 5. ALCHEMIST (3C)
console.log("\n--- Testing Alchemist (3C) ---");
const alchLogic = new AlchemistLogic();
const alchScoring = new AlchemistScoring();

const alchSetup = alchLogic.setup({ deck: [], playerId: 'p1', players: [] });
assert(alchSetup.hand !== undefined && alchSetup.hand.length === 6, "Alchemist starts with 6 cards from Alchemist Deck");

let pAlch = mockPlayer('p1', CharacterType.ALCHEMIST, 3);
res = alchScoring.getScore(pAlch, 1, []);
assert(res.score === 60, "Alchemist 3 wins gives 60 pts");

pAlch.crowns = { gold: 2, black: 0 };
res = alchScoring.getScore(pAlch, 1, []);
assert(res.isInstantWin === true && res.score === 999, "Alchemist 2 Gold Crowns triggers Philosopher's Stone Instant Win");


// 6. TIME TRAVELER (4C)
console.log("\n--- Testing Time Traveler (4C) ---");
const ttScoring = new TimeTravelerScoring();
let pTT = mockPlayer('p1', CharacterType.TIME_TRAVELER, 2); // 2 wins = 90 pts base
pTT.timeTravelPredictions = ['p2', 'p1', 'p3'];

const p2Obj = mockPlayer('p2', CharacterType.KING, 3); // Gold winner
const p3Obj = mockPlayer('p3', CharacterType.HERMIT, 0); // Black winner

res = ttScoring.getScore(pTT, 1, [pTT, p2Obj, p3Obj]);
// Base 90 + Gold pred (50) + Black2 pred (50) = 190 pts
assert(res.score === 190, `Time Traveler prediction bonuses applied correctly (got ${res.score})`);

// Round 3 Prophecy Fulfilled (3 correct predictions)
pTT.timeTravelPredictions = ['p2', 'p1', 'p3'];
const p1Black = mockPlayer('p1', CharacterType.TIME_TRAVELER, 0); // p1 is also 0 wins
p1Black.timeTravelPredictions = ['p2', 'p1', 'p3'];
res = ttScoring.getScore(p1Black, 3, [p1Black, p2Obj, p3Obj]);
assert(res.isInstantWin === true && res.score === 999, "Time Traveler Round 3 Perfect Prophecy gives Instant Win");


// 7. PHANTOM THIEF (5C)
console.log("\n--- Testing Phantom Thief (5C) ---");
const ptScoring = new PhantomThiefScoring();
let pPT = mockPlayer('p1', CharacterType.PHANTOM_THIEF, 1);
res = ptScoring.getScore(pPT, 1, []);
assert(res.score === -20, "Phantom Thief 1 win gives -20 pts (eligible for Black Crown)");

pPT.wins = 3;
res = ptScoring.getScore(pPT, 1, []);
assert(res.score === -50, "Phantom Thief 3 wins gives -50 pts");

pPT.wins = 5;
res = ptScoring.getScore(pPT, 1, []);
assert(res.isInstantWin === true && res.score === 999, "Phantom Thief 5 wins gives Instant Win (999 pts)");

console.log("\nALL TIERS C & D TESTS PASSED PERFECTLY! 🎉");
