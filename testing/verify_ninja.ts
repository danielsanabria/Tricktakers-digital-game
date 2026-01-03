
import { NinjaLogic } from '../logic/characters/logic_Ninja';
import { CharacterType, Suit, CardType, Player, Card, PowerContext } from '../game/core/types';

const mockPlayer = (id: string, wins: number = 0): Player => ({
    id, name: 'Ninja', character: CharacterType.NINJA,
    hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins,
    items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [],
    timeTravelTokens: 0, timeTravelPredictions: [], collectedCards: [],
    berserkerDeck: []
});

function runTests() {
    console.log("🥷 VERIFICANDO NINJA (2D) 🥷\n");
    let passed = 0;
    let total = 0;
    const assert = (condition: boolean, msg: string) => { total++; if (condition) { console.log(`✅ ${msg}`); passed++; } else console.error(`❌ ${msg}`); };

    const logic = new NinjaLogic();

    // --- TEST 1: Instant Win (5 Wins) ---
    {
        const p = mockPlayer('p1', 5); // 5 Wins
        const updates = logic.onTrickWon(p, [], 1);
        assert(updates.score === 999, `Instant Win: 5 wins triggers 999 score. Got: ${updates.score}`);
    }

    // --- TEST 2: Normal Win ( < 5 Wins) ---
    {
        const p = mockPlayer('p1', 4); // 4 Wins (High score but not instant win logic handled here)
        const updates = logic.onTrickWon(p, [], 1);
        // Should be empty or normal score update (if logic handled bonus points, but mostly static)
        assert(updates.score !== 999, `Normal Win: 4 wins does NOT trigger instant win. Got: ${updates.score || 'undefined/no-change'}`);
    }

    console.log(`\n🏁 RESULTADOS: ${passed}/${total} Tests Pasados.`);
}

runTests();
