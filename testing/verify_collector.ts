
import { CollectorLogic } from '../logic/characters/logic_Collector';
import { CharacterType, Suit, CardType, Player, Card } from '../game/core/types';

const createCard = (id: string, suit: Suit, value: number): Card => ({
    id, suit, value, type: CardType.NUMBER, name: `${suit} ${value}`
});

const mockPlayer = (id: string, collectedCards: Card[]): Player => ({
    id, name: 'Collector', character: CharacterType.COLLECTOR,
    hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0,
    items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [],
    collectedCards, timeTravelTokens: 0, timeTravelPredictions: []
});

function runTests() {
    console.log("🦋 VERIFICANDO COLLECTOR (4B) 🦋\n");
    let passed = 0;
    let total = 0;
    const assert = (condition: boolean, msg: string) => { total++; if (condition) { console.log(`✅ ${msg}`); passed++; } else console.error(`❌ ${msg}`); };

    const logic = new CollectorLogic();

    // --- TEST 1: Pair (NOT A VALID SET) ---
    // Rule: Docs table does not list Pair. Only 3-of-kind is minimum for "Kind" sets.
    // So Pair should result in garbage penalty (-10).
    {
        const cards = [
            createCard('c1', Suit.RED, 5),
            createCard('c2', Suit.BLUE, 5)
        ];
        const score = logic.calculateScore(mockPlayer('p1', cards));
        assert(score === -10, `Pair (5,5) is invalid. Should be garbage penalty -10. Got: ${score}`);
    }

    // --- TEST 2: Three of a Kind (40 pts) ---
    {
        const cards = [
            createCard('c1', Suit.RED, 7),
            createCard('c2', Suit.BLUE, 7),
            createCard('c3', Suit.GREEN, 7)
        ];
        const score = logic.calculateScore(mockPlayer('p1', cards));
        assert(score === 40, `Three of a Kind (7,7,7) worth 40 pts. Got: ${score}`);
    }

    // --- TEST 3: Straight (3 Cards) (30 pts) ---
    {
        const cards = [
            createCard('c1', Suit.RED, 1),
            createCard('c2', Suit.BLUE, 2),
            createCard('c3', Suit.GREEN, 3)
        ];
        const score = logic.calculateScore(mockPlayer('p1', cards));
        assert(score === 30, `Straight (1,2,3) worth 30 pts. Got: ${score}`);
    }

    // --- TEST 4: Flush (3 Cards) (20 pts) ---
    {
        const cards = [
            createCard('c1', Suit.RED, 2),
            createCard('c2', Suit.RED, 5),
            createCard('c3', Suit.RED, 9)
        ];
        const score = logic.calculateScore(mockPlayer('p1', cards));
        assert(score === 20, `Flush (Red,Red,Red) worth 20 pts. Got: ${score}`);
    }

    // --- TEST 5: Multiple Sets (Optimization) ---
    // Cards: 5(R), 5(B), 6(G), 7(Bk)
    // Option A: Straight (5,6,7) = 30 pts. Leftover: 5(R). Unused = 1. Penalty = 0. Total = 30.
    // Option B: No valid 3-kind or flush.
    // Option C: No Sets. Unused = 4. Penalty = -20.
    {
        const cards = [
            createCard('c1', Suit.RED, 5),
            createCard('c2', Suit.BLUE, 5),
            createCard('c3', Suit.GREEN, 6),
            createCard('c4', Suit.BLACK, 7)
        ];
        const score = logic.calculateScore(mockPlayer('p1', cards));
        assert(score === 30, `Optimization: Should find Straight(30) + 0 Garbage. Got: ${score}`);
    }

    // --- TEST 6: Royal Flush / Straight Flush? (Bonus?) ---
    // If game has it. If not, just sum of Straight + Flush? 
    // They are usually separate sets calculation.

    // --- TEST 7: Setup (Initial Collection) ---
    {
        const p = mockPlayer('test', []);
        const ctx = { deck: [createCard('d1', Suit.RED, 1)], players: [p], playerId: 'test', round: 1 };
        const updates = logic.setup(ctx as any);
        assert(updates.collectedCards !== undefined && updates.collectedCards.length >= 0, "Setup initializes collectedCards");
    }

    console.log(`\n🏁 RESULTADOS: ${passed}/${total} Tests Pasados.`);
}

runTests();
