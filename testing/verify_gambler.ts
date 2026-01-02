
import { GamblerScoring } from '../logic/scoring/score_Gambler';
import { Player, CharacterType, Suit, CardType } from '../game/core/types';
import { CHARACTERS } from '../game/core/constants';

// Mock Data
const basePlayer: Player = {
    id: 'p1', name: 'Gambler', character: CharacterType.GAMBLER,
    hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0,
    items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [],
    collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [],
    revoltsLeft: 0, itemSlots: 0, gambleSwaps: 0, betAmount: 0,
    thiefChipValue: 0, thiefTargetIds: [], thiefBetrayalMode: false
};

function runTest(name: string, testFn: () => boolean) {
    try {
        if (testFn()) console.log(`✅ ${name}`);
        else console.error(`❌ ${name}`);
    } catch (e) {
        console.error(`❌ ${name} (EXCEPTION: ${e})`);
    }
}

console.log("=== GAMBLER SCORING VERIFICATION ===");

// 1. Base Points Check
runTest('Gambler Base Points (3 Wins = 150 pts)', () => {
    const scoring = new GamblerScoring();
    const p = { ...basePlayer, wins: 3, bid: 3 }; // Exact bid to avoid penalty
    // Base for 3 wins is 150.
    // Bid Exact: +20.
    // Bet: 0
    // Total: 170
    const res = scoring.getScore(p, 1, [p]);
    return res.score === 170 && res.logs.some(l => l.includes("150 pts"));
});

// 2. Bid Penalty Check
runTest('Gambler Bid Penalty (Bid 3, Won 1)', () => {
    const scoring = new GamblerScoring();
    const p = { ...basePlayer, wins: 1, bid: 3 };
    // Base for 1 win: 60 pts.
    // Diff 2 -> 20 pts penalty.
    // Bid Result: -20.
    // Total: 40.
    const res = scoring.getScore(p, 1, [p]);
    // Log should show -20 pts penalty
    return res.score === 40;
});

// 3. Bet Success Check
runTest('Gambler Bet Success (Bet 50, Won Bid)', () => {
    const scoring = new GamblerScoring();
    const p = { ...basePlayer, wins: 3, bid: 3, betAmount: 50 };
    // Base (3 wins): 150.
    // Bid Exact: +20.
    // Bet Success: +50.
    // Total: 220.
    const res = scoring.getScore(p, 1, [p]);
    console.log("Score:", res.score, "Logs:", res.logs);
    return res.score === 220;
});

// 4. Bet Failure Check
runTest('Gambler Bet Failure (Bet 50, Failed Bid)', () => {
    const scoring = new GamblerScoring();
    const p = { ...basePlayer, wins: 2, bid: 3, betAmount: 50 };
    // Base (2 wins): 90.
    // Bid Diff 1 -> -10 pts.
    // Bet Fail: -50.
    // Total: 30.
    const res = scoring.getScore(p, 1, [p]);
    return res.score === 30;
});

console.log("=== VERIFICATION END ===");
