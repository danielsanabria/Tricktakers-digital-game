
import { ResistanceLogic } from '../logic/characters/logic_Resistance';
import { CharacterType, Suit, CardType, Player, Card, PowerContext } from '../game/core/types';

const createCard = (name: string, suit: Suit, value: number): Card => ({
    id: `c_${name}`, suit, value, type: CardType.NUMBER, name
});

const mockPlayer = (id: string, round: number = 1): Player => ({
    id, name: 'Resistance', character: CharacterType.RESISTANCE,
    hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0,
    items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [],
    timeTravelTokens: 0, timeTravelPredictions: [], collectedCards: [],
    revoltsLeft: 1
});

function runTests() {
    console.log("✊ VERIFICANDO RESISTANCE (3A) ✊\n");
    let passed = 0;
    let total = 0;
    const assert = (condition: boolean, msg: string) => { total++; if (condition) { console.log(`✅ ${msg}`); passed++; } else console.error(`❌ ${msg}`); };

    const logic = new ResistanceLogic();

    // --- TEST 1: Setup (Revolts Count) ---
    {
        const p1 = mockPlayer('p1', 1);
        const u1 = logic.setup({ deck: [], players: [p1], playerId: 'p1', round: 1 });
        assert(u1.revoltsLeft === 1, `Round 1: 1 Revolt. Got: ${u1.revoltsLeft}`);

        const p3 = mockPlayer('p3', 3);
        const u3 = logic.setup({ deck: [], players: [p3], playerId: 'p1', round: 3 });
        assert(u3.revoltsLeft === 2, `Round 3: 2 Revolts. Got: ${u3.revoltsLeft}`);
    }

    // --- TEST 2: Revolt Power Logic (Lowest Wins -> Higher Value is WORSE) ---
    // In Revolt, we assume Game Loop sorts Ascending. So "Better" cards must be "Lower Value" or treated as such?
    // Wait, my implementation returns `1000 + Value` for Black.
    // And `Value` (1-10) for Colors.
    // If Game Loop sorts ASCENDING (Low to High):
    // Colors (5) < Black (1005). Color Wins. Correct.
    // Red 1 (1) < Red 10 (10). Red 1 Wins. Correct.
    // So my implementation supports Ascending Sort.
    {
        const p = mockPlayer('p1');

        // Case A: Revolt Active. Black vs Red.
        const blackCard = createCard('B10', Suit.BLACK, 10);
        const redCard = createCard('R5', Suit.RED, 5);

        const ctxBase: PowerContext = {
            card: blackCard, leadSuit: Suit.RED, isRevolt: true, isKakumei: false,
            trickContainsRare: false, onesInSuits: [], tensInSuits: [], berserker10Suits: [],
            berserkerMainInPlay: false, whiteFlagInPlay: false, hermitInPlay: false, berserkerInPlay: false,
            player: p
        };

        const blackPower = logic.getCardPower(ctxBase);
        const redPower = logic.getCardPower({ ...ctxBase, card: redCard });

        // Black should be > Red (so Red wins in Ascending sort)
        assert(blackPower > redPower, `Revolt: Black (${blackPower}) > Red (${redPower}) (Black Loses).`);
        assert(blackPower > 1000, `Revolt: Black is high tier (>1000). Got: ${blackPower}`);
    }

    // --- TEST 3: Lead Suit Nullified in Revolt ---
    {
        const p = mockPlayer('p1');
        const leadCard = createCard('Lead5', Suit.BLUE, 5);
        const followCard = createCard('Follow5', Suit.BLUE, 5);
        const offCard = createCard('Off5', Suit.RED, 5); // Same value, diff suit

        const ctx: PowerContext = {
            card: followCard, leadSuit: Suit.BLUE, isRevolt: true, isKakumei: false,
            trickContainsRare: false, onesInSuits: [], tensInSuits: [], berserker10Suits: [],
            berserkerMainInPlay: false, whiteFlagInPlay: false, hermitInPlay: false, berserkerInPlay: false,
            player: p
        };

        const followPower = logic.getCardPower(ctx);
        const offPower = logic.getCardPower({ ...ctx, card: offCard });

        assert(followPower === offPower, `Revolt: Lead Suit (${followPower}) equals Off Suit (${offPower}) (Nullified).`);
    }

    // --- TEST 4: Round 3 Bonus ---
    {
        const p = mockPlayer('p1');
        const updates = logic.onTrickWon(p, [], 3); // Round 3
        assert(updates.score === 30, `Round 3: Win gives +30 pts. Got: ${updates.score}`);
    }

    console.log(`\n🏁 RESULTADOS: ${passed}/${total} Tests Pasados.`);
}

runTests();
