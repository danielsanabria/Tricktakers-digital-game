
import { SamuraiLogic } from '../logic/characters/logic_Samurai';
import { CharacterType, Suit, CardType, Player, Card, PowerContext } from '../game/core/types';

const createCard = (name: string, suit: Suit, value: number): Card => ({
    id: `c_${name}`, suit, value, type: CardType.NUMBER, name
});

const mockPlayer = (id: string, wins: number = 0): Player => ({
    id, name: 'Samurai', character: CharacterType.SAMURAI,
    hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins,
    items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [],
    timeTravelTokens: 0, timeTravelPredictions: [], collectedCards: []
});

function runTests() {
    console.log("⚔️ VERIFICANDO SAMURAI (3D) ⚔️\n");
    let passed = 0;
    let total = 0;
    const assert = (condition: boolean, msg: string) => { total++; if (condition) { console.log(`✅ ${msg}`); passed++; } else console.error(`❌ ${msg}`); };

    const logic = new SamuraiLogic();

    // --- TEST 1: Setup (Hand Purity) ---
    // Rule: Discard Black cards and redraw.
    {
        const p = mockPlayer('p1');
        // Initial Deck: Black, Black, Red, Blue, Green, ...
        const deck: Card[] = [
            createCard('b1', Suit.BLACK, 1),
            createCard('b2', Suit.BLACK, 2),
            createCard('r1', Suit.RED, 5),
            createCard('u1', Suit.BLUE, 5),
            createCard('g1', Suit.GREEN, 5),
            createCard('r2', Suit.RED, 9), // Replacement 1
            createCard('u2', Suit.BLUE, 9) // Replacement 2
        ];

        // Setup context draws 5.
        // Hand would be: B1, B2, R1, U1, G1.
        // Samurai Logic should discard B1, B2 and draw R2, U2.
        const updates = logic.setup({ deck: [...deck], players: [p], playerId: 'p1', round: 1 });

        const hasBlack = updates.hand?.some(c => c.suit === Suit.BLACK);
        assert(!hasBlack, `Setup: Hand must not contain Black cards. Hand: ${updates.hand?.map(c => c.suit).join(',')}`);
        assert(updates.hand?.length === 5, `Setup: Hand size remains 5. Got: ${updates.hand?.length}`);
    }

    // --- TEST 2: Spirit of Red (Red = Black Power) ---
    // Rule: Red cards get Black power boost (+1000).
    {
        const p = mockPlayer('p1');
        const redCard = createCard('Red5', Suit.RED, 5);

        const ctx: PowerContext = {
            card: redCard, leadSuit: Suit.BLUE, isRevolt: false, isKakumei: false,
            trickContainsRare: false, onesInSuits: [], tensInSuits: [], berserker10Suits: [],
            berserkerMainInPlay: false, whiteFlagInPlay: false, hermitInPlay: false, berserkerInPlay: false,
            player: p
        };

        const power = logic.getCardPower(ctx);
        // Base value 5. Spirit of Red -> Black (+1000). Total 1005.
        assert(power === 1005, `Spirit of Red: Red 5 should have power 1005 (Black Tier). Got: ${power}`);
    }

    // --- TEST 3: Spirit of Red Nullification (White Flag) ---
    // Rule: If White Flag in play, Spirit of Red Disabled.
    {
        const p = mockPlayer('p1');
        const redCard = createCard('Red5', Suit.RED, 5);

        const ctx: PowerContext = {
            card: redCard, leadSuit: Suit.BLUE, isRevolt: false, isKakumei: false,
            trickContainsRare: false, onesInSuits: [], tensInSuits: [], berserker10Suits: [],
            berserkerMainInPlay: false,
            whiteFlagInPlay: true, // Key: White Flag Active
            hermitInPlay: false, berserkerInPlay: false,
            player: p
        };

        const power = logic.getCardPower(ctx);
        // Base 5. No Black boost. No Lead Boost. Power 5.
        assert(power === 5, `Disabled Spirit: With White Flag, Red 5 has power 5. Got: ${power}`);
    }

    // --- TEST 4: Instant Win (4 Wins) ---
    // Rule: If 4 wins, update score to Win Game (999).
    {
        const p = mockPlayer('p1', 4); // 4 Wins
        const updates = logic.onTrickWon(p, [], 1);
        assert(updates.score === 999, `Instant Win: 4 wins triggers 999 score. Got: ${updates.score}`);
    }

    console.log(`\n🏁 RESULTADOS: ${passed}/${total} Tests Pasados.`);
}

runTests();
