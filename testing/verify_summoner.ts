
import { SummonerLogic } from '../logic/characters/logic_Summoner';
import { CharacterType, Suit, CardType, Player, Card, PowerContext } from '../game/core/types';

const createCard = (name: string, suit: Suit, value: number, type: CardType = CardType.NUMBER): Card => ({
    id: `c_${name}`, suit, value, type, name
});

const mockPlayer = (id: string, mp: number): Player => ({
    id, name: 'Summoner', character: CharacterType.SUMMONER,
    hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0,
    items: [], tasks: [], mp, beasts: [], rearBeasts: [], magicElements: [],
    timeTravelTokens: 0, timeTravelPredictions: [], collectedCards: []
});

function runTests() {
    console.log("🐺 VERIFICANDO SUMMONER (2C) 🐺\n");
    let passed = 0;
    let total = 0;
    const assert = (condition: boolean, msg: string) => { total++; if (condition) { console.log(`✅ ${msg}`); passed++; } else console.error(`❌ ${msg}`); };

    const logic = new SummonerLogic();

    // --- TEST 1: Setup MP (5) ---
    {
        const p = mockPlayer('p1', 0); // Init 0
        const updates = logic.setup({ deck: [], players: [p], playerId: 'p1', round: 1 });
        assert(updates.mp === 5, `Setup: Starts with 5 MP. Got: ${updates.mp}`);
    }

    // --- TEST 2: Gain MP on Win (+1) ---
    {
        const p = mockPlayer('p1', 2);
        const updates = logic.onTrickWon(p, [], 1);
        assert(updates.mp === 3, `Trick Win: Gain +1 MP (2->3). Got: ${updates.mp}`);
    }

    // --- TEST 3: Gain Extra MP with El in Rear ---
    {
        const p = mockPlayer('p1', 2);
        p.rearBeasts = ['b-el'];
        const updates = logic.onTrickWon(p, [], 1);
        assert(updates.mp === 4, `Trick Win + El(Rear): Gain +2 MP (2->4). Got: ${updates.mp}`);
    }

    // --- TEST 4: Miria (Berserker) Logic ---
    // Rule: Miria beats standards (3000) but loses to 1.
    {
        let p = mockPlayer('p1', 5);
        p.frontBeastId = 'b-miria'; // Summoned Miria
        const card = createCard('AnyCard', Suit.RED, 5); // Card played underneath doesn't matter much for Power, mainly Color cost?
        // Assume cost paid.

        // Case A: Normal Fight (vs High Card)
        const ctx: PowerContext = {
            card, leadSuit: Suit.RED, isRevolt: false, isKakumei: false,
            trickContainsRare: false, onesInSuits: [], tensInSuits: [], berserker10Suits: [],
            berserkerMainInPlay: false, whiteFlagInPlay: false, hermitInPlay: false, berserkerInPlay: false,
            player: p
        };
        const val = logic.getCardPower(ctx);
        assert(val === 3000, `Miria: Power 3000 (Berserker base). Got: ${val}`);

        // Case B: Vs 1 (Lose)
        const ctx1: PowerContext = { ...ctx, onesInSuits: [Suit.BLUE] }; // 1 in play
        const val1 = logic.getCardPower(ctx1);
        assert(val1 === -1, `Miria: Loses to 1 (Power -1). Got: ${val1}`);
    }

    // --- TEST 5: El (White Flag) Logic ---
    // Rule: Power 0. Beats Rare (5000).
    {
        let p = mockPlayer('p1', 5);
        p.frontBeastId = 'b-el';
        const card = createCard('AnyCard', Suit.RED, 5);

        // Case A: vs Rare
        const ctx: PowerContext = {
            card, leadSuit: Suit.RED, isRevolt: false, isKakumei: false,
            trickContainsRare: true, onesInSuits: [], tensInSuits: [], berserker10Suits: [],
            berserkerMainInPlay: false, whiteFlagInPlay: false, hermitInPlay: false, berserkerInPlay: false,
            player: p
        };
        const val = logic.getCardPower(ctx);
        assert(val === 5000, `El: Beats Rare (Power 5000). Got: ${val}`);

        // Case B: Normal (Weak)
        const ctxNormal: PowerContext = { ...ctx, trickContainsRare: false };
        const valNormal = logic.getCardPower(ctxNormal);
        assert(valNormal === 0, `El: Normal Power 0. Got: ${valNormal}`);
    }

    console.log(`\n🏁 RESULTADOS: ${passed}/${total} Tests Pasados.`);
}

runTests();
