
import { AdventurerLogic } from '../logic/characters/logic_Adventurer';
import { SetupContext, Player, Card, Suit, CardType, PowerContext, CharacterType } from '../game/core/types';
import { ITEMS } from '../game/core/constants';

const mockDeck: Card[] = [
    { id: 'c1', suit: Suit.RED, value: 5, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c2', suit: Suit.BLUE, value: 5, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c3', suit: Suit.GREEN, value: 5, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c4', suit: Suit.BLACK, value: 5, type: CardType.NUMBER, ownerId: 'p1' },
    { id: 'c5', suit: Suit.RED, value: 10, type: CardType.NUMBER, ownerId: 'p1' },
];

const createMockPlayer = (id: string): Player => ({
    id,
    name: `Player ${id}`,
    character: CharacterType.ADVENTURER,
    hand: [],
    wonCards: [],
    items: [],
    tasks: [],
    beasts: [],
    rearBeasts: [],
    mp: 0,
    magicElements: [],
    score: 0,
    goldCrowns: 0,
    blackCrowns: 0,
    wins: 0,
    gambleSwaps: 0,
    revoltUsed: false,
    rulerUsedRuleAvoidance: false,
    hermitUsedAbility: false,
    strategistUsedIgnore: false,
    betAmount: 0,
    collectedCards: [],
    timeTravelTokens: 0,
    timeTravelPredictions: [],
    berserkerDeck: [],
    thiefTargetIds: [],
    thiefChipValue: 0,
    thiefBetrayalMode: false,
    tasksAssigned: {}
});

const logic = new AdventurerLogic();

async function runTests() {
    console.log("--- Verifying Adventurer Logic ---");
    let passed = 0;
    let failed = 0;

    // Test 1: Setup (P1 vs CPU)
    // CPU should get random items. P1 gets none (waits for Modal).
    console.log("\nTest 1: Setup Logic");
    const ctxAI: SetupContext = {
        deck: [...mockDeck],
        playerId: 'cpu',
        round: 1,
        players: [createMockPlayer('p1'), createMockPlayer('cpu')]
    };

    const aiSetup = logic.setup(ctxAI);
    if (aiSetup.items && aiSetup.items.length === 2 && aiSetup.itemSlots === 2) {
        console.log("✅ AI Setup initialized with 2 items.");
        passed++;
    } else {
        console.error("❌ AI Setup failed to give items.", aiSetup.items);
        failed++;
    }

    const ctxP1: SetupContext = {
        deck: [...mockDeck],
        playerId: 'p1',
        round: 1,
        players: [createMockPlayer('p1'), createMockPlayer('cpu')]
    };
    const p1Setup = logic.setup(ctxP1);
    if ((!p1Setup.items || p1Setup.items.length === 0) && p1Setup.itemSlots === 2) {
        console.log("✅ P1 Setup waits for selection (0 items, 2 slots).");
        passed++;
    } else {
        console.error("❌ P1 Setup incorrectly gave items or wrong slots.", p1Setup.items, p1Setup.itemSlots);
        failed++;
    }

    // Test 2: Card Power (Level 1)
    console.log("\nTest 2: Level 1 Power (Standard)");
    const p1 = { ...createMockPlayer('p1'), hand: mockDeck };
    const contextLvl1: PowerContext = {
        card: { id: 'c1', suit: Suit.RED, value: 5, type: CardType.NUMBER, ownerId: 'p1' },
        leadSuit: Suit.RED,
        isRevolt: false,
        isKakumei: false,
        onesInSuits: [],
        tensInSuits: [],
        trickContainsRare: false,
        whiteFlagInPlay: false,
        player: p1,
        berserker10Suits: [],
        berserkerMainInPlay: false,
        hermitInPlay: false,
        berserkerInPlay: false
    };

    const powerLvl1 = logic.getCardPower(contextLvl1);
    // Base 5 + Lead Suit Bonus (500) = 505
    if (powerLvl1 === 505) {
        console.log("✅ Level 1 Power is base value (505).");
        passed++;
    } else {
        console.error(`❌ Level 1 Power wrong: ${powerLvl1} (Expected 505)`);
        failed++;
    }

    // Test 3: Card Power (Level 2 Bonus)
    // Level 2 (2 wins) -> +2 to Even Cards
    console.log("\nTest 3: Level 2 Power (+2 to Even)");
    const p1Lvl2 = { ...p1, wins: 2 };
    const contextLvl2Odd = { ...contextLvl1, player: p1Lvl2, card: { ...contextLvl1.card, value: 5 } };
    const contextLvl2Even = { ...contextLvl1, player: p1Lvl2, card: { ...contextLvl1.card, value: 4 } };

    if (logic.getCardPower(contextLvl2Odd) === 505) { // 5 + 500 = 505 (Odd unchanged)
        console.log("✅ Level 2: Odd card unchanged.");
        passed++;
    } else {
        console.error(`❌ Level 2: Odd card modified error: ${logic.getCardPower(contextLvl2Odd)}`);
        failed++;
    }

    if (logic.getCardPower(contextLvl2Even) === 506) { // 4 + 500 + 2 = 506
        console.log("✅ Level 2: Even card +2 bonus applied.");
        passed++;
    } else {
        console.error(`❌ Level 2: Even card bonus error. Got ${logic.getCardPower(contextLvl2Even)} expected 506`);
        failed++;
    }

    // Test 4: Card Power (Level 3 Bonus)
    // Level 3 (3 wins) -> +3 to Odd Cards
    console.log("\nTest 4: Level 3 Power (+3 to Odd)");
    const p1Lvl3 = { ...p1, wins: 3 };
    const contextLvl3Odd = { ...contextLvl1, player: p1Lvl3, card: { ...contextLvl1.card, value: 5 } };

    if (logic.getCardPower(contextLvl3Odd) === 508) { // 5 + 500 + 3 = 508
        console.log("✅ Level 3: Odd card +3 bonus applied.");
        passed++;
    } else {
        console.error(`❌ Level 3: Odd card bonus error. Got ${logic.getCardPower(contextLvl3Odd)} expected 508`);
        failed++;
    }

    // Test 5: onTrickWon (Gain Item)
    console.log("\nTest 5: onTrickWon Item Gain");
    const updates = logic.onTrickWon(p1, [mockDeck[0]], 1);
    if (updates.items && updates.items.length === 1 && updates.itemSlots === 1) {
        console.log("✅ Gained new item on win.");
        passed++;
    } else {
        console.error("❌ Failed to gain item on win.", updates);
        failed++;
    }

    console.log(`\nPassed: ${passed}/${passed + failed}`);
}

runTests();
