import { SummonerLogic } from '../logic/characters/logic_Summoner';
import { Player, Card, CardType, Suit, SetupContext, PowerContext } from '../game/core/types';
import { BEASTS as CONST_BEASTS } from '../game/core/constants';

// Mock Constants
const MOCK_BEASTS = CONST_BEASTS;

// Helper to create context
const createMockPlayer = (id: string, character: any): Player => ({
    id, name: 'Test', character: character, hand: [], wonCards: [], items: [], tasks: [],
    beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0
} as any);

const runTest = (name: string, fn: () => boolean) => {
    try {
        if (fn()) console.log(`✅ ${name}`);
        else console.error(`❌ ${name}`);
    } catch (e) {
        console.error(`❌ ${name} (Error: ${e})`);
    }
};

const verifySummoner = () => {
    console.log("--- Verifying Summoner Logic ---");
    const logic = new SummonerLogic();
    const p1 = createMockPlayer('p1', '2C');

    // Test 1: Setup
    runTest('Setup initializes MP to 5', () => {
        const res = logic.setup({ deck: [], playerId: 'p1', round: 1, players: [p1] } as any);
        return res.mp === 5 && res.rearBeasts!.length === 0;
    });

    // Test 2: MP Gain on Win
    runTest('Gain 1 MP on Trick Win (Base)', () => {
        const res = logic.onTrickWon!({ ...p1, mp: 5, rearBeasts: [] }, [], 1);
        return res.mp === 6;
    });

    runTest('Gain 2 MP on Trick Win (El in Rear)', () => {
        const res = logic.onTrickWon!({ ...p1, mp: 5, rearBeasts: ['b-el'] }, [], 1);
        return res.mp === 7;
    });

    // Test 3: Power - El (Front)
    runTest('El (Front) beats Rare (5000)', () => {
        const ctx: PowerContext = {
            card: { id: 'c1', type: CardType.NUMBER, value: 5, suit: Suit.RED }, // Base card doesn't matter much as EL overrides
            leadSuit: Suit.RED,
            player: { ...p1, frontBeastId: 'b-el' },
            trickContainsRare: true,
            onesInSuits: [],
            tensInSuits: [],
            berserker10Suits: [],
            berserkerMainInPlay: false,
            whiteFlagInPlay: false,
            hermitInPlay: false,
            berserkerInPlay: false,
            isRevolt: false,
            isKakumei: false
        };
        const power = logic.getCardPower(ctx);
        return power === 5000;
    });

    runTest('El (Front) acts as White Flag (0) if no Rare', () => {
        const ctx: PowerContext = {
            card: { id: 'c1', type: CardType.NUMBER, value: 5, suit: Suit.RED },
            leadSuit: Suit.RED,
            player: { ...p1, frontBeastId: 'b-el' },
            trickContainsRare: false,
            onesInSuits: [],
            tensInSuits: [], // ... rest defaults
            isRevolt: false, isKakumei: false, berserkerInPlay: false, berserkerMainInPlay: false, berserker10Suits: [], whiteFlagInPlay: false, hermitInPlay: false
        };
        const power = logic.getCardPower(ctx);
        return power === 0;
    });

    // Test 4: Power - Miria (Front)
    runTest('Miria (Front) is strong (3000)', () => {
        const ctx: PowerContext = {
            card: { id: 'c1', type: CardType.NUMBER, value: 5, suit: Suit.RED },
            leadSuit: Suit.RED,
            player: { ...p1, frontBeastId: 'b-miria' },
            onesInSuits: [],
            trickContainsRare: false,
            tensInSuits: [], isRevolt: false, isKakumei: false, berserkerInPlay: false, berserkerMainInPlay: false, berserker10Suits: [], whiteFlagInPlay: false, hermitInPlay: false
        };
        const power = logic.getCardPower(ctx);
        return power === 3000;
    });

    runTest('Miria (Front) loses to 1 (-1)', () => {
        const ctx: PowerContext = {
            card: { id: 'c1', type: CardType.NUMBER, value: 5, suit: Suit.RED },
            leadSuit: Suit.RED,
            player: { ...p1, frontBeastId: 'b-miria' },
            onesInSuits: [Suit.BLUE], // There is a 1 in play
            trickContainsRare: false,
            tensInSuits: [], isRevolt: false, isKakumei: false, berserkerInPlay: false, berserkerMainInPlay: false, berserker10Suits: [], whiteFlagInPlay: false, hermitInPlay: false
        };
        const power = logic.getCardPower(ctx);
        return power === -1;
    });
};

verifySummoner();
