
import { StrategistScoring } from '../logic/scoring/score_Strategist';
import { Player, CharacterType } from '../game/core/types';
import { TRAPS } from '../game/core/constants';

const mockPlayer = (wins: number, isUser: boolean): Player => ({
    id: isUser ? 'p1' : 'p2',
    name: isUser ? 'User' : 'CPU',
    character: CharacterType.STRATEGIST,
    wins,
    hand: [], wonCards: [], items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 0, goldCrowns: 0, blackCrowns: 0, collectedCards: [],
    timeTravelTokens: 0, timeTravelPredictions: []
});

const testScoring = () => {
    console.log("=== Testing Strategist Scoring ===");
    const scoring = new StrategistScoring();

    // AI Checking
    [0, 1, 2, 3, 4, 5].forEach(wins => {
        const p = mockPlayer(wins, false);
        const result = scoring.getScore(p);
        console.log(`AI - Wins: ${wins}, Score: ${result.score}`);
    });

    // User Checking
    [2, 3, 4, 5].forEach(wins => {
        const p = mockPlayer(wins, true);
        const result = scoring.getScore(p);
        console.log(`User - Wins: ${wins}, Score: ${result.score}`);
    });
};

const testTraps = () => {
    console.log("\n=== Testing Traps Configuration ===");
    console.log(`Total Traps Configured: ${TRAPS.length} (Expected 5)`);
    TRAPS.forEach(t => {
        console.log(`Trap: ${t.name}, Image: ${t.imagePath || 'MISSING'}`);
    });
};

testScoring();
testTraps();
