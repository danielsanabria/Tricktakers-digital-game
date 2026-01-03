import { AlchemistLogic } from '../logic/characters/logic_Alchemist';
import { calculateAlchemyValue } from '../game/core/alchemyUtils';
import { Player, Card, CardType, Suit, SetupContext } from '../game/core/types';
import { ALCHEMIST_DECK } from '../game/core/constants';

// Mock Player Creation
const createMockPlayer = (id: string): Player => ({
    id, name: 'Test', character: '3C' as any, hand: [], wonCards: [], items: [], tasks: [],
    beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0,
    alchemistDeck: []
} as any);

const runTest = (name: string, fn: () => boolean) => {
    try {
        if (fn()) console.log(`✅ ${name}`);
        else console.error(`❌ ${name}`);
    } catch (e) {
        console.error(`❌ ${name} (Error: ${e})`);
    }
};

const verifyAlchemist = () => {
    console.log("--- Verifying Alchemist Logic ---");
    const logic = new AlchemistLogic();
    const p1 = createMockPlayer('p1');

    // Test 1: Setup
    runTest('Setup initializes Alchemist Deck & Hand', () => {
        const res = logic.setup({ deck: [], playerId: 'p1', round: 1, players: [p1] } as any);
        // Deck is 15 cards. Hand 6. Deck remainder 9.
        return res.hand!.length === 6 && res.alchemistDeck!.length === 9;
    });

    // Test 2: Trick Win Element
    runTest('Gain TRICK_WIN Element on Win', () => {
        const res = logic.onTrickWon!({ ...p1, magicElements: [] }, [], 1);
        return res.magicElements!.includes('TRICK_WIN');
    });

    // Test 3: Alchemy Calculation - Sum
    runTest('Alchemy Sum (1, 2, 3) = 6', () => {
        const cards: Card[] = [
            { id: '1', value: 1, suit: Suit.RED, type: CardType.NUMBER },
            { id: '2', value: 2, suit: Suit.RED, type: CardType.NUMBER },
            { id: '3', value: 3, suit: Suit.BLUE, type: CardType.NUMBER },
        ];
        const res = calculateAlchemyValue(cards);
        return res.value === 6;
    });

    runTest('Alchemy Sum (5, 5, 5) = 5 (15 % 10)', () => {
        const cards: Card[] = [
            { id: '1', value: 5, suit: Suit.RED, type: CardType.NUMBER },
            { id: '2', value: 5, suit: Suit.RED, type: CardType.NUMBER },
            { id: '3', value: 5, suit: Suit.BLUE, type: CardType.NUMBER },
        ];
        const res = calculateAlchemyValue(cards);
        return res.value === 5;
    });

    runTest('Alchemy Sum 10/20/30 = 10 (Strong)', () => {
        const cards: Card[] = [
            { id: '1', value: 5, suit: Suit.RED, type: CardType.NUMBER },
            { id: '2', value: 4, suit: Suit.RED, type: CardType.NUMBER },
            { id: '3', value: 1, suit: Suit.BLUE, type: CardType.NUMBER },
        ]; // Sum 10
        const res = calculateAlchemyValue(cards);
        return res.value === 10 && res.isStrong === true;
    });

    // Test 4: Alchemy Elements
    runTest('Alchemy Detects 3_OF_A_KIND', () => {
        const cards: Card[] = [
            { id: '1', value: 4, suit: Suit.RED, type: CardType.NUMBER },
            { id: '2', value: 4, suit: Suit.BLUE, type: CardType.NUMBER },
            { id: '3', value: 4, suit: Suit.GREEN, type: CardType.NUMBER },
        ];
        const res = calculateAlchemyValue(cards);
        return res.elements.includes('3_OF_A_KIND');
    });

    runTest('Alchemy Detects FLUSH', () => {
        const cards: Card[] = [
            { id: '1', value: 1, suit: Suit.RED, type: CardType.NUMBER },
            { id: '2', value: 3, suit: Suit.RED, type: CardType.NUMBER },
            { id: '3', value: 5, suit: Suit.RED, type: CardType.NUMBER },
        ];
        const res = calculateAlchemyValue(cards);
        return res.elements.includes('FLUSH');
    });

    runTest('Alchemy Detects STRAIGHT', () => {
        const cards: Card[] = [
            { id: '1', value: 3, suit: Suit.RED, type: CardType.NUMBER },
            { id: '2', value: 2, suit: Suit.BLUE, type: CardType.NUMBER },
            { id: '3', value: 4, suit: Suit.GREEN, type: CardType.NUMBER },
        ];
        const res = calculateAlchemyValue(cards);
        return res.elements.includes('STRAIGHT');
    });
};

verifyAlchemist();
