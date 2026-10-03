import { Player, Card, Suit, CardType, CharacterType, AIDifficulty } from '../game/core/types';
import { getAiMove } from '../game/core/gameLogic';
import { getBeginnerAiMove } from '../logic/ai/beginnerAI';
import { getIntermediateAiMove } from '../logic/ai/intermediateAI';
import { getExpertAiMove } from '../logic/ai/expertAI';
import { AIContext } from '../logic/ai/aiTypes';
import { TrickIntention, getCharacterTrickIntention } from '../logic/ai/aiCharacterGoals';

function createPlayer(id: string, name: string, character: CharacterType, hand: Card[], overrides?: Partial<Player>): Player {
    return {
        id,
        name,
        character,
        hand,
        wonCards: [],
        items: [],
        tasks: [],
        beasts: [],
        rearBeasts: [],
        mp: 0,
        magicElements: [],
        score: 30,
        goldCrowns: 0,
        blackCrowns: 0,
        wins: 0,
        timeTravelTokens: 0,
        timeTravelPredictions: [],
        collectedCards: [],
        ...overrides
    };
}

console.log("=================================================");
console.log("   AI LEVELS (BEGINNER / INTERMEDIATE / EXPERT)  ");
console.log("=================================================\n");

let passedTests = 0;

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    }
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
}

// -------------------------------------------------------------------------
// TEST 1: Beginner AI returns valid move and doesn't throw
// -------------------------------------------------------------------------
console.log("\n--- TEST 1: Beginner AI ---");
{
    const hand: Card[] = [
        { id: 'c1', suit: Suit.RED, value: 3, type: CardType.NUMBER },
        { id: 'c2', suit: Suit.BLUE, value: 7, type: CardType.NUMBER },
        { id: 'c3', suit: Suit.RED, value: 9, type: CardType.NUMBER },
    ];
    const player = createPlayer('ai1', 'Bot', CharacterType.KING, hand);
    const context: AIContext = {
        player,
        leadSuit: Suit.RED,
        playedCards: [],
        trick: 1,
        round: 1,
        allPlayers: [player],
        difficulty: AIDifficulty.BEGINNER
    };

    const move = getBeginnerAiMove(context);
    // Must follow RED
    assert(move === 'c1' || move === 'c3', `Beginner AI follows lead suit RED (got: ${move})`);
}

// -------------------------------------------------------------------------
// TEST 2: Intermediate AI - Efficiency & Goal Orientation
// -------------------------------------------------------------------------
console.log("\n--- TEST 2: Intermediate AI Efficiency ---");
{
    // King wants to win. Played card: RED 4. King has RED 5, RED 8, RED 2.
    // Winning candidates: RED 5 and RED 8.
    // Intermediate AI should play RED 5 (cheapest winning card, saving RED 8).
    const hand: Card[] = [
        { id: 'c-red-2', suit: Suit.RED, value: 2, type: CardType.NUMBER },
        { id: 'c-red-5', suit: Suit.RED, value: 5, type: CardType.NUMBER },
        { id: 'c-red-8', suit: Suit.RED, value: 8, type: CardType.NUMBER },
    ];
    const king = createPlayer('p-king', 'King Bot', CharacterType.KING, hand);
    const opponentCard: Card = { id: 'c-opp', suit: Suit.RED, value: 4, type: CardType.NUMBER, ownerId: 'p1' };
    const oppPlayer = createPlayer('p1', 'Human', CharacterType.ADVENTURER, []);

    const context: AIContext = {
        player: king,
        leadSuit: Suit.RED,
        playedCards: [opponentCard],
        trick: 1,
        round: 1,
        allPlayers: [oppPlayer, king],
        difficulty: AIDifficulty.INTERMEDIATE
    };

    const move = getIntermediateAiMove(context);
    assert(move === 'c-red-5', `Intermediate AI picks cheapest winning card (RED 5 instead of RED 8), got: ${move}`);
}

// -------------------------------------------------------------------------
// TEST 3: Intermediate AI - Hermit counter against Rare
// -------------------------------------------------------------------------
console.log("\n--- TEST 3: Intermediate Hermit Counter ---");
{
    const hand: Card[] = [
        { id: 'c-blue-5', suit: Suit.BLUE, value: 5, type: CardType.NUMBER },
        { id: 'wf-1', suit: Suit.COLORLESS, value: 0, type: CardType.WHITE_FLAG },
    ];
    const hermit = createPlayer('p-hermit', 'Hermit Bot', CharacterType.HERMIT, hand);
    const rareCard: Card = { id: 'rare-1', suit: Suit.COLORLESS, value: 11, type: CardType.RARE, ownerId: 'p1' };
    const oppPlayer = createPlayer('p1', 'Human', CharacterType.ADVENTURER, []);

    const context: AIContext = {
        player: hermit,
        leadSuit: Suit.COLORLESS,
        playedCards: [rareCard],
        trick: 2,
        round: 1,
        allPlayers: [oppPlayer, hermit],
        difficulty: AIDifficulty.INTERMEDIATE
    };

    const move = getIntermediateAiMove(context);
    assert(move === 'wf-1', `Hermit Intermediate AI counters Rare card with White Flag (got: ${move})`);
}

// -------------------------------------------------------------------------
// TEST 4: Berserker Intention WANT_LOSE and Safe Dumping
// -------------------------------------------------------------------------
console.log("\n--- TEST 4: Berserker Goal & Intermediate AI Dumping ---");
{
    const berserkerHand: Card[] = [
        { id: 'b-red-2', suit: Suit.RED, value: 2, type: CardType.NUMBER },
        { id: 'b-red-8', suit: Suit.RED, value: 8, type: CardType.NUMBER },
    ];
    const berserker = createPlayer('p-berserker', 'Berserker Bot', CharacterType.BERSERKER, berserkerHand, { wins: 0 });
    const oppCard: Card = { id: 'c-high', suit: Suit.RED, value: 9, type: CardType.NUMBER, ownerId: 'p1' };
    const oppPlayer = createPlayer('p1', 'Human', CharacterType.KING, []);

    const intention = getCharacterTrickIntention(berserker, 1, 1);
    assert(intention === TrickIntention.WANT_LOSE, `Berserker intention is WANT_LOSE`);

    const context: AIContext = {
        player: berserker,
        leadSuit: Suit.RED,
        playedCards: [oppCard],
        trick: 1,
        round: 1,
        allPlayers: [oppPlayer, berserker],
        difficulty: AIDifficulty.INTERMEDIATE
    };

    const move = getIntermediateAiMove(context);
    // Both red-2 and red-8 lose to 9, intermediate dumps lowest or safe losing card
    assert(move === 'b-red-2' || move === 'b-red-8', `Berserker plays safe losing card without winning trick (got: ${move})`);
}

// -------------------------------------------------------------------------
// TEST 5: Expert AI - Meta Defense against Tournament Threat
// -------------------------------------------------------------------------
console.log("\n--- TEST 5: Expert AI Meta-Defense ---");
{
    // Opponent p1 has 1 Gold Crown (1 more crown wins tournament!)
    // Opponent played RED 6. Expert AI has RED 3 and RED 7.
    // Expert AI must prioritize winning to deny trick to dangerous opponent.
    const expertHand: Card[] = [
        { id: 'e-red-3', suit: Suit.RED, value: 3, type: CardType.NUMBER },
        { id: 'e-red-7', suit: Suit.RED, value: 7, type: CardType.NUMBER },
    ];
    const expert = createPlayer('p-expert', 'Expert Bot', CharacterType.ADVENTURER, expertHand);
    const dangerousOpp: Player = createPlayer('p1', 'Human Threat', CharacterType.KING, [], { goldCrowns: 1 });
    const threatCard: Card = { id: 'threat-card', suit: Suit.RED, value: 6, type: CardType.NUMBER, ownerId: 'p1' };

    const context: AIContext = {
        player: expert,
        leadSuit: Suit.RED,
        playedCards: [threatCard],
        trick: 3,
        round: 2,
        allPlayers: [dangerousOpp, expert],
        difficulty: AIDifficulty.EXPERT
    };

    const move = getExpertAiMove(context);
    assert(move === 'e-red-7', `Expert AI detects tournament threat and plays winning card RED 7 (got: ${move})`);
}

// -------------------------------------------------------------------------
// TEST 6: Expert AI - Anti-Berserker Trick Dumping
// -------------------------------------------------------------------------
console.log("\n--- TEST 6: Expert AI Sabotaging Berserker ---");
{
    // Berserker has 0 wins and is on trick 4.
    // Berserker currently leads with RED 7 (winning).
    // Expert has RED 4 and RED 8.
    // Normal AI wanting to win might play RED 8, but Expert AI sees Berserker is about
    // to secure 0 wins! Expert AI lets Berserker win the trick by playing RED 4, breaking their bonus!
    const expertHand: Card[] = [
        { id: 'e-red-4', suit: Suit.RED, value: 4, type: CardType.NUMBER },
        { id: 'e-red-8', suit: Suit.RED, value: 8, type: CardType.NUMBER },
    ];
    const expert = createPlayer('p-expert', 'Expert Bot', CharacterType.ADVENTURER, expertHand);
    const berserkerOpp = createPlayer('p-ber', 'Berserker Opp', CharacterType.BERSERKER, [], { wins: 0 });
    const berserkerLead: Card = { id: 'ber-lead', suit: Suit.RED, value: 7, type: CardType.NUMBER, ownerId: 'p-ber' };

    const context: AIContext = {
        player: expert,
        leadSuit: Suit.RED,
        playedCards: [berserkerLead],
        trick: 4,
        round: 1,
        allPlayers: [berserkerOpp, expert],
        difficulty: AIDifficulty.EXPERT
    };

    const move = getExpertAiMove(context);
    assert(move === 'e-red-4', `Expert AI forces Berserker to take trick 4 to bust their 0-win condition (got: ${move})`);
}

// -------------------------------------------------------------------------
// TEST 7: AI Engine Dispatcher via getAiMove
// -------------------------------------------------------------------------
console.log("\n--- TEST 7: AI Engine Dispatcher Integration ---");
{
    const hand: Card[] = [
        { id: 'c-dis-1', suit: Suit.GREEN, value: 2, type: CardType.NUMBER },
    ];
    const player = createPlayer('ai-p', 'Bot', CharacterType.KING, hand);

    const moveBeginner = getAiMove(player, null, [], { difficulty: AIDifficulty.BEGINNER });
    const moveIntermediate = getAiMove(player, null, [], { difficulty: AIDifficulty.INTERMEDIATE });
    const moveExpert = getAiMove(player, null, [], { difficulty: AIDifficulty.EXPERT });

    assert(moveBeginner === 'c-dis-1', `Dispatcher beginner executes cleanly`);
    assert(moveIntermediate === 'c-dis-1', `Dispatcher intermediate executes cleanly`);
    assert(moveExpert === 'c-dis-1', `Dispatcher expert executes cleanly`);
}

console.log(`\n🎉 ALL ${passedTests} AI TESTS COMPLETED SUCCESSFULLY!`);
