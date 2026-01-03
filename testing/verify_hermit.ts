
import { HermitLogic } from '../logic/characters/logic_Hermit';
import { CharacterType, Suit, CardType, Player, Card, PowerContext } from '../game/core/types';

const createCard = (name: string, suit: Suit, value: number, type: CardType = CardType.NUMBER): Card => ({
    id: `c_${name}`, suit, value, type, name
});

const mockPlayer = (id: string): Player => ({
    id, name: 'Hermit', character: CharacterType.HERMIT,
    hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0,
    items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [],
    timeTravelTokens: 0, timeTravelPredictions: [], collectedCards: []
});

function runTests() {
    console.log("🏳️ VERIFICANDO HERMIT (4A) 🏳️\n");
    let passed = 0;
    let total = 0;
    const assert = (condition: boolean, msg: string) => { total++; if (condition) { console.log(`✅ ${msg}`); passed++; } else console.error(`❌ ${msg}`); };

    const logic = new HermitLogic();

    // --- TEST 1: Setup (White Flag) ---
    {
        const p = mockPlayer('p1');
        const deck = [
            createCard('1', Suit.RED, 1),
            createCard('2', Suit.RED, 2),
            createCard('3', Suit.RED, 3),
            createCard('4', Suit.RED, 4),
            createCard('5', Suit.RED, 5)
        ];
        const u = logic.setup({ deck, players: [p], playerId: 'p1', round: 1 });

        const hasWhiteFlag = u.hand?.some(c => c.type === CardType.WHITE_FLAG);
        assert(!!hasWhiteFlag, `Setup: Hand must contain White Flag. Got types: ${u.hand?.map(c => c.type).join(',')}`);
    }

    // --- TEST 2: White Flag Power (Normal) ---
    {
        const p = mockPlayer('p1');
        const wf = createCard('WhiteFlag', Suit.COLORLESS, 0, CardType.WHITE_FLAG);

        const ctx: PowerContext = {
            card: wf, leadSuit: Suit.RED, isRevolt: false, isKakumei: false,
            trickContainsRare: false, onesInSuits: [], tensInSuits: [], berserker10Suits: [],
            berserkerMainInPlay: false, whiteFlagInPlay: true, hermitInPlay: true, berserkerInPlay: false,
            player: p
        };

        const val = logic.getCardPower(ctx);
        assert(val === 0, `White Flag (Normal): Power 0. Got: ${val}`);
    }

    // --- TEST 3: White Flag vs Rare ---
    {
        const p = mockPlayer('p1');
        const wf = createCard('WhiteFlag', Suit.COLORLESS, 0, CardType.WHITE_FLAG);

        // Context contains Rare
        const ctx: PowerContext = {
            card: wf, leadSuit: Suit.RED, isRevolt: false, isKakumei: false,
            trickContainsRare: true, // RARE IS PRESENT
            onesInSuits: [], tensInSuits: [], berserker10Suits: [],
            berserkerMainInPlay: false, whiteFlagInPlay: true, hermitInPlay: true, berserkerInPlay: false,
            player: p
        };

        const val = logic.getCardPower(ctx);
        assert(val === 5000, `White Flag vs Rare: Power 5000 (Beats 2000). Got: ${val}`);
    }

    console.log(`\n🏁 RESULTADOS: ${passed}/${total} Tests Pasados.`);
}

runTests();
