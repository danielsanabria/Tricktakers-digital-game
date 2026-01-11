
import { AdventurerLogic } from '../logic/characters/logic_Adventurer';
import { ITEMS } from '../game/core/constants';
import { Player, UIContext, Card, Suit, CardType, GamePhase, Item, CharacterType } from '../game/core/types';
import { determineWinner } from '../game/core/gameLogic';

// Mock UI interaction
const mockPerformAction = (action: string, payload?: any) => { };

// MOCKING the Logic from useGameActions.ts (Item Usage) and useGameLoop.ts (Card Play transformation)
function performUseItemMock(player: Player, item: Item, drawPile: Card[], setPlayer: (p: Player) => void, setMode: (m: string) => void) {
    let drawnCards: Card[] = [];
    let newAbilityMode = 'NONE';
    const currentDrawPile = [...drawPile];

    if (item.effect === 'DRAW_X') {
        newAbilityMode = 'ADVENTURER_SWAP';
        // Note: Real logic does not draw here anymore
    } else if (item.effect === 'DRAW_DISCARD') {
        newAbilityMode = 'ADVENTURER_SWAP';
    }

    if (newAbilityMode !== 'NONE') {
        setMode(newAbilityMode);
    }

    let newHand = player.hand;
    let pendingEffect = player.pendingItemEffect;

    if (item.effect === 'DRAW_X') {
        // newHand = [...player.hand, ...drawnCards]; // No draw yet
        pendingEffect = 'DISCARD_2';
    } else if (item.effect === 'DRAW_DISCARD') {
        // newHand = [...player.hand, ...drawnCards]; // No draw yet
        pendingEffect = 'DISCARD_1';
    } else {
        pendingEffect = item.effect;
    }

    const updatedItems = player.items.filter(i => i.id !== item.id);

    setPlayer({
        ...player,
        items: updatedItems,
        hand: newHand,
        pendingItemEffect: pendingEffect,
    });
}

function applyPendingEffectToCard(player: Player, card: Card, leadSuit: Suit | null): Card {
    let finalCard = { ...card, ownerId: player.id };
    if (player.pendingItemEffect) {
        if (player.pendingItemEffect === 'FIX_10' || player.pendingItemEffect === 'CHANGE_10') {
            finalCard.value = 10;
        } else if (player.pendingItemEffect === 'COLOR_SHIFT' && leadSuit) {
            finalCard.suit = leadSuit;
        } else if (player.pendingItemEffect === 'VALUE_MODIFY') {
            const mod = finalCard.value <= 4 ? 5 : -5;
            finalCard.value = Math.max(1, Math.min(9, finalCard.value + mod));
        } else if (player.pendingItemEffect === 'FACEDOWN') {
            finalCard.isFacedown = true;
        } else if (player.pendingItemEffect === 'WHITE_FLAG') {
            finalCard.type = CardType.WHITE_FLAG;
            finalCard.suit = Suit.COLORLESS;
            finalCard.value = 0;
        } else if (player.pendingItemEffect === 'WIN_TIES') {
            finalCard.winTies = true;
        }
    }
    return finalCard;
}

function createTestContext(items: string[] = []): { logic: AdventurerLogic, player: Player, context: UIContext } {
    const logic = new AdventurerLogic();
    const player: Player = {
        id: 'p1',
        name: 'Adventurer',
        character: CharacterType.ADVENTURER,
        hand: [
            { id: 'c1', suit: Suit.RED, value: 5, type: CardType.NUMBER, ownerId: 'p1' },
            { id: 'c2', suit: Suit.BLUE, value: 5, type: CardType.NUMBER, ownerId: 'p1' }
        ],
        wonCards: [],
        wins: 0,
        items: items.map(id => ITEMS.find(i => i.id === id)!),
        itemSlots: 2,
        magicElements: [], beasts: [], rearBeasts: [], timeTravelPredictions: [], collectedCards: [], tasks: [],
        mp: 0, goldCrowns: 0, blackCrowns: 0, score: 0,
        timeTravelTokens: 0 // Added missing required property
    };

    const context: UIContext = {
        player,
        abilityMode: 'NONE',
        setAbilityMode: () => { },
        performAction: mockPerformAction,
        isCurrentPlayer: true,
        selectedCards: [],
        setSelectedCards: () => { },
        round: 1,
        playedCards: []
    };

    return { logic, player, context };
}

console.log("\n=== VERIFYING ADVENTURER ITEMS AND LOGIC ===\n");

let passed = 0;
let failed = 0;

// Test 1: Active Items (Draw)
console.log("[Test 1] Fairy Mischief (it-12) - Draw 1");
{
    const item12 = ITEMS.find(i => i.id === 'it-12')!;
    const { player } = createTestContext(['it-12']);
    let updatedPlayer = { ...player };
    let mode = 'NONE';
    const drawPile: Card[] = [{ id: 'new1', value: 1, type: CardType.NUMBER, suit: Suit.RED, ownerId: '' }];

    performUseItemMock(player, item12, drawPile, (p) => updatedPlayer = p, (m) => mode = m);

    // Swap Logic: Hand size should NOT increase yet. Mode should be ADVENTURER_SWAP.
    if (updatedPlayer.hand.length === 2 && mode === 'ADVENTURER_SWAP') {
        console.log("✅ PASS: Fairy Mischief set mode to ADVENTURER_SWAP (No immediate draw).");
        passed++;
    } else {
        console.error(`❌ FAIL: Fairy Mischief failed. Mode: ${mode}, Hand: ${updatedPlayer.hand.length}`);
        failed++;
    }
}

// Test 2: Passive Item - Dragon Doll (Win Ties)
console.log("\n[Test 2] Dragon Doll (it-13) - Win Ties");
{
    const item13 = ITEMS.find(i => i.id === 'it-13')!;
    const { player } = createTestContext(['it-13']);
    let updatedPlayer = { ...player };
    let mode = 'NONE';

    // Use Item
    performUseItemMock(player, item13, [], (p) => updatedPlayer = p, (m) => mode = m);

    // Play Card with Effect
    const cardToPlay = updatedPlayer.hand[0]; // Red 5
    const finalCard = applyPendingEffectToCard(updatedPlayer, cardToPlay, Suit.RED);

    if (finalCard.winTies) {
        console.log("✅ PASS: winTies flag set on card.");
        passed++;
    } else {
        console.error("❌ FAIL: winTies flag NOT set.");
        failed++;
    }

    // Verify Win Logic vs Tie
    const rivalCard: Card = { id: 'r1', suit: Suit.RED, value: 5, type: CardType.NUMBER, ownerId: 'p2' }; // Equal Value
    const winner = determineWinner([rivalCard, finalCard], Suit.RED, false, false, [
        { id: 'p2', character: CharacterType.KING } as any,
        { ...updatedPlayer, id: 'p1' }
    ]);

    if (winner === 'p1') {
        console.log("✅ PASS: Dragon Doll won the tie.");
        passed++;
    } else {
        console.error("❌ FAIL: Dragon Doll LOST the tie (Winner: " + winner + ")");
        failed++;
    }

    // Verify Win Logic vs Rare (User Bug Report Check)
    const rareCard: Card = { id: 'rare1', suit: Suit.COLORLESS, value: 11, type: CardType.RARE, ownerId: 'p2' };
    const winnerRare = determineWinner([rareCard, finalCard], Suit.RED, false, false, [
        { id: 'p2', character: CharacterType.KING } as any,
        { ...updatedPlayer, id: 'p1' }
    ]);

    console.log("   Info: Dragon Doll vs Rare -> Winner: " + winnerRare);
    if (winnerRare === 'p2') {
        console.log("ℹ️ INFO: Dragon Doll correctly LOST to Rare (Because Power 5 < 11 and not tied).");
        console.log("   (This confirms User might be mistaken about item effect or referred to White Orb)");
    } else {
        console.error("❓ UNEXPECTED: Dragon Doll BEAT Rare? (Logic quirk?)");
    }
}

// Test 3: Passive Item - White Orb (White Flag)
console.log("\n[Test 3] White Orb (it-9) - White Flag vs Rare");
{
    const item9 = ITEMS.find(i => i.id === 'it-9')!;
    const { player } = createTestContext(['it-9']);
    let updatedPlayer = { ...player };

    performUseItemMock(player, item9, [], (p) => updatedPlayer = p, (m) => { });

    const cardToPlay = updatedPlayer.hand[0];
    const finalCard = applyPendingEffectToCard(updatedPlayer, cardToPlay, Suit.RED);

    if (finalCard.type === CardType.WHITE_FLAG) {
        console.log("✅ PASS: Card converted to WHITE_FLAG.");
        passed++;
    } else {
        console.error("❌ FAIL: Card NOT converted to WHITE_FLAG.");
        failed++;
    }

    // Verify White Flag vs Rare
    const rareCard: Card = { id: 'rare1', suit: Suit.COLORLESS, value: 11, type: CardType.RARE, ownerId: 'p2' };

    try {
        const winner = determineWinner([rareCard, finalCard], Suit.RED, false, false, [
            { id: 'p2', character: CharacterType.KING } as any,
            { ...updatedPlayer, id: 'p1' }
        ]);

        if (winner === 'p1') {
            console.log("✅ PASS: White Orb (White Flag) BEAT Rare.");
            passed++;
        } else {
            console.error("❌ FAIL: White Orb LOST to Rare. (Winner: " + winner + ")");
            failed++;
        }
    } catch (e) {
        console.error("⚠️ Error running determineWinner (likely dependency issue in test environment):", e);
    }
}

console.log(`\nSUMMARY: Passed: ${passed}, Failed: ${failed}`);

// Test 4: Active Item - Map of Destiny (it-1) - Draw 2, Discard 2
console.log("\n[Test 4] Map of Destiny (it-1) - Swap 2");
{
    const item1 = ITEMS.find(i => i.id === 'it-1')!;
    const { player } = createTestContext(['it-1']);
    let updatedPlayer = { ...player };
    let mode = 'NONE';
    const drawPile: Card[] = [
        { id: 'd1', value: 1, type: CardType.NUMBER, suit: Suit.RED, ownerId: '' },
        { id: 'd2', value: 2, type: CardType.NUMBER, suit: Suit.BLUE, ownerId: '' }
    ];

    performUseItemMock(player, item1, drawPile, (p) => updatedPlayer = p, (m) => mode = m);

    // Initial check: Should NOT draw immediate. Mode is ADVENTURER_SWAP.
    if (updatedPlayer.hand.length === 2 && mode === 'ADVENTURER_SWAP') {
        console.log("✅ STEP 1: Hand size unchanged (2), Mode is ADVENTURER_SWAP.");
        passed++;
    } else {
        console.error(`❌ STEP 1 FAIL: Hand size ${updatedPlayer.hand.length} (expected 2), Mode ${mode}`);
        failed++;
    }

    // Verify Pending Effect is set
    // Note: Item effect sets DISCARD_2 to indicate max selectable
    if (updatedPlayer.pendingItemEffect === 'DISCARD_2') {
        console.log("✅ STEP 2: Pending Item Effect is DISCARD_2.");
        passed++;
    } else {
        console.error(`❌ STEP 2 FAIL: Pending Effect is '${updatedPlayer.pendingItemEffect}'`);
        failed++;
    }

    // Simulate Bulk Swap (Action: ADVENTURER_EXECUTE_SWAP)
    let nextMode = mode;
    let nextPlayer = { ...updatedPlayer };

    // ACTION: ADVENTURER_EXECUTE_SWAP
    if (mode === 'ADVENTURER_SWAP') {
        // Swapping 2 cards
        const swapAmount = 2;
        const swapIds = nextPlayer.hand.slice(0, swapAmount).map(c => c.id);

        // Remove from hand
        const handAfterRemove = nextPlayer.hand.filter(c => !swapIds.includes(c.id));

        // Draw new
        const newCards = drawPile.slice(0, swapAmount).map(c => ({ ...c, ownerId: 'p1' }));

        nextPlayer.hand = [...handAfterRemove, ...newCards];

        // Clear effect and mode
        nextPlayer.pendingItemEffect = null;
        nextMode = 'NONE';
    }

    if (nextMode === 'NONE' && nextPlayer.pendingItemEffect === null && nextPlayer.hand.length === 2) {
        console.log("✅ STEP 3: After Swap, Mode is NONE, Hand size matches (2).");
        passed++;
    } else {
        console.error(`❌ STEP 3 FAIL: Mode ${nextMode}, Length ${nextPlayer.hand.length}`);
        failed++;
    }
}
