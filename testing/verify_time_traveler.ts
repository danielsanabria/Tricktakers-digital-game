
import { TimeTravelerLogic } from '../logic/characters/logic_TimeTraveler';
import { Player, Card, CardType, Suit, SetupContext, CharacterType } from '../game/core/types';
// Helper to create mock player
const createMockPlayer = (id: string): Player => ({
    id, name: 'Test', character: CharacterType.TIME_TRAVELER, hand: [], wonCards: [], items: [], tasks: [],
    beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0,
    timeTravelPredictions: [], timeTravelTokens: 0
} as any);

const runTests = (tests: { name: string, fn: () => boolean }[]) => {
    tests.forEach(t => {
        try {
            if (t.fn()) console.log(`✅ ${t.name}`);
            else console.error(`❌ ${t.name}`);
        } catch (e) {
            console.error(`❌ ${t.name} (Error: ${e})`);
        }
    });
};

runTests([
    {
        name: "Setup initializes Tokens & Predictions",
        fn: () => {
            const logic = new TimeTravelerLogic();
            const player = createMockPlayer('p1');
            const context: SetupContext = {
                deck: [],
                playerId: 'p1',
                round: 1,
                players: [player]
            };
            const updates = logic.setup(context);
            if (updates.timeTravelTokens !== 2) throw new Error(`Tokens should be 2, got ${updates.timeTravelTokens}`);
            if (!Array.isArray(updates.timeTravelPredictions)) throw new Error("Predictions should be an array");
            return true;
        }
    }
]);
