
import { RulerScoring } from '../logic/scoring/score_Ruler';
import { BaseScoring } from '../logic/scoring/BaseScoring';
import { Player, Card, Suit, CardType, Task, CharacterType } from '../game/core/types';
import { TASKS } from '../game/core/constants';

// --- MOCK DATA ---
const mockCard = (suit: Suit, value: number): Card => ({
    id: `card-${suit}-${value}`,
    suit,
    value,
    type: CardType.NUMBER,
    ownerId: 'p1'
});

const basePlayer: Player = {
    id: 'p1', name: 'Ruler', character: CharacterType.RULER,
    hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0,
    items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [],
    collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [],
    revoltsLeft: 0, itemSlots: 0, gambleSwaps: 0, betAmount: 0,
    thiefChipValue: 0, thiefTargetIds: [], thiefBetrayalMode: false
};

const opponent1: Player = { ...basePlayer, id: 'p2', name: 'Subject 1', character: CharacterType.KING };
const opponent2: Player = { ...basePlayer, id: 'p3', name: 'Subject 2', character: CharacterType.SAMURAI };

function runTest(name: string, testFn: () => boolean) {
    try {
        if (testFn()) console.log(`✅ ${name}`);
        else console.error(`❌ ${name}`);
    } catch (e) {
        console.error(`❌ ${name} (EXCEPTION: ${e})`);
    }
}

console.log("=== RULER LOGIC VERIFICATION ===");

// 1. Task Penalty Check (BaseScoring)
runTest('Opponent Penalty for Failed Task (-10 pts)', () => {
    const scoring = new BaseScoring();
    const p2 = { ...opponent1, tasks: [TASKS[0]] }; // Task: Take a 1.
    // p2 has NO won cards. Logic: wonCards.some(1) -> FALSE.
    // Should lose 10 pts.

    const res = scoring.getScore(p2, 1, [basePlayer, p2, opponent2]);
    // Base score is 0. Penalty -10. Total -10.
    return res.score === -10 && res.logs.some(l => l.includes("Fallo de Tarea Real"));
});

runTest('Opponent Success for Task (0 pts penalty)', () => {
    const scoring = new BaseScoring();
    const p2 = { ...opponent1, tasks: [TASKS[0]], wonCards: [mockCard(Suit.RED, 1)] }; // Task: Take a 1. HAS a 1.
    // Should NOT lose points.

    const res = scoring.getScore(p2, 1, [basePlayer, p2, opponent2]);
    return res.score === 0 && res.logs.some(l => l.includes("Tarea Real Completada"));
});

// 2. Ruler Bonus Check (score_Ruler)
runTest('Ruler Bonus: All Opponents Succeed (+20 pts)', () => {
    const scoring = new RulerScoring();
    const p2 = { ...opponent1, tasks: [TASKS[0]], wonCards: [mockCard(Suit.RED, 1)] }; // Success
    const p3 = { ...opponent2, tasks: [TASKS[1]], wonCards: [mockCard(Suit.BLACK, 10)] }; // Task: Take 10. Success.

    const ruler = { ...basePlayer };

    const res = scoring.getScore(ruler, 1, [ruler, p2, p3]);
    // 2 opponents < 3 -> +20 pts.
    return res.score === 20 && res.logs.some(l => l.includes("obedientes"));
});

runTest('Ruler Bonus: One Opponent Fails (0 pts)', () => {
    const scoring = new RulerScoring();
    const p2 = { ...opponent1, tasks: [TASKS[0]], wonCards: [] }; // Fail
    const p3 = { ...opponent2, tasks: [TASKS[1]], wonCards: [mockCard(Suit.BLACK, 10)] }; // Success

    const ruler = { ...basePlayer };

    const res = scoring.getScore(ruler, 1, [ruler, p2, p3]);
    return res.score === 0;
});

// 3. Tyranny Win Check
runTest('Tyranny Win: 2 Wins, No Colors (Instant Win)', () => {
    const scoring = new RulerScoring();
    const ruler = {
        ...basePlayer,
        wins: 2,
        wonCards: [mockCard(Suit.BLACK, 10), mockCard(Suit.BLACK, 9)] // Only Black
    };

    const res = scoring.getScore(ruler, 1, [ruler, opponent1, opponent2]);
    return res.isInstantWin === true && res.score === 999;
});

runTest('Tyranny Fail: 2 Wins, Has Red Card (Normal Score)', () => {
    const scoring = new RulerScoring();
    const ruler = {
        ...basePlayer,
        wins: 2,
        wonCards: [mockCard(Suit.BLACK, 10), mockCard(Suit.RED, 5)] // Has Color
    };

    const res = scoring.getScore(ruler, 1, [ruler, opponent1, opponent2]);
    // 2 wins might give base points (e.g. 40 pts for Ruler at 2 wins).
    return res.isInstantWin === false && res.score !== 999;
});

console.log("=== VERIFICATION END ===");
