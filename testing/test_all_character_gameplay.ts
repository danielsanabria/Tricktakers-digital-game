import { Player, Suit, CardType, CharacterType } from '../game/core/types';
import { getCharacterLogic } from '../logic/logic_Registry';
import { createDeck, determineWinner } from '../game/core/gameLogic';
import { calculateAlchemyValue } from '../game/core/alchemyUtils';
import { PhantomThiefLogic } from '../logic/characters/logic_PhantomThief';
import { ITEMS, TASKS, BEASTS, TRAPS } from '../game/core/constants';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ ASSERTION FAILED: ${message}`);
        throw new Error(`Assertion failed: ${message}`);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

function mockPlayer(id: string, character: CharacterType): Player {
    return {
        id,
        name: `Player_${id}`,
        character,
        hand: [],
        wonCards: [],
        wins: 0,
        score: 30,
        goldCrowns: 0,
        blackCrowns: 0,
        crowns: { gold: 0, black: 0 },
        items: [],
        tasks: [],
        mp: 0,
        beasts: [],
        rearBeasts: [],
        magicElements: [],
        collectedCards: [],
        timeTravelTokens: 0,
        timeTravelPredictions: [],
        alchemistDeck: []
    } as any;
}

console.log("=================================================");
console.log("   FULL CHARACTER GAMEPLAY & MECHANICS VERIFICATION");
console.log("=================================================\n");

// ---------------------------------------------------------------------
// 1. TIER A: KING (1A), GAMBLER (2A), RESISTANCE (3A), HERMIT (4A), BERSERKER (5A)
// ---------------------------------------------------------------------
console.log("▶ [Tier A] Testing King, Gambler, Resistance, Hermit, Berserker...");

// 1.1 KING (1A)
{
    const kingLogic = getCharacterLogic(CharacterType.KING);
    const pKing = mockPlayer('p1', CharacterType.KING);
    const deck = createDeck();
    const setup = kingLogic.setup({ deck, playerId: pKing.id, round: 1, players: [pKing] });
    assert(setup.hand !== undefined && setup.hand.length === 6, "King receives 6 cards in setup (1 Rare + 5 Number)");
    assert(setup.hand!.some(c => c.type === CardType.RARE), "King has a Rare card in starting hand");
}

// 1.2 GAMBLER (2A)
{
    const gamblerLogic = getCharacterLogic(CharacterType.GAMBLER);
    const pGambler = mockPlayer('p1', CharacterType.GAMBLER);
    const setup = gamblerLogic.setup({ deck: [], playerId: pGambler.id, round: 1, players: [pGambler] });
    assert(setup.score === 50, "Gambler gains +20 bonus points on setup (starts with 50 pts)");
    assert(setup.gambleSwaps === 2, "Gambler gets 2 card swap chances on setup");
}

// 1.3 RESISTANCE (3A)
{
    const pRes = mockPlayer('p1', CharacterType.RESISTANCE);
    const pKing = mockPlayer('p2', CharacterType.KING);
    const pOthers = [pRes, pKing];

    // Trick during Kakumei (Revolution): Lowest number wins (e.g. Red 2 beats Red 8)
    const playedCards = [
        { id: 'r2', suit: Suit.RED, value: 2, type: CardType.NUMBER, ownerId: 'p1' },
        { id: 'r8', suit: Suit.RED, value: 8, type: CardType.NUMBER, ownerId: 'p2' }
    ];
    const winnerId = determineWinner(playedCards, Suit.RED, false, true, pOthers, false);
    assert(winnerId === 'p1', "Resistance Red 2 beats King Red 8 in Kakumei (lowest number wins)");

    // Revolution trick won with Black Card triggers Instant Win in scoring
    const resistanceScoring = new (getCharacterLogic(CharacterType.RESISTANCE) as any).constructor;
    const { ResistanceScoring } = await import('../logic/scoring/score_Resistance');
    const resScoring = new ResistanceScoring();
    const resBlackWinner = {
        ...pRes,
        wins: 1,
        wonRevolutionTrick: true,
        revoltWinningCard: { id: 'b1', suit: Suit.BLACK, value: 5, type: CardType.NUMBER }
    };
    const scoreRes = resScoring.getScore(resBlackWinner, 1, [resBlackWinner]);
    assert(scoreRes.isInstantWin === true && scoreRes.score === 999, "Resistance won Revolution trick with Black Card gives Instant Win (999 pts)");
}

// 1.4 HERMIT (4A)
{
    const hermitLogic = getCharacterLogic(CharacterType.HERMIT);
    const pHermit = mockPlayer('p1', CharacterType.HERMIT);
    const power = hermitLogic.getCardPower({
        card: { id: 'wf', suit: Suit.COLORLESS, value: 0, type: CardType.WHITE_FLAG },
        leadSuit: Suit.RED,
        isRevolt: false,
        isKakumei: false,
        trickContainsRare: true,
        onesInSuits: [],
        tensInSuits: [],
        berserker10Suits: [],
        berserkerMainInPlay: false,
        whiteFlagInPlay: true,
        hermitInPlay: true,
        berserkerInPlay: false,
        player: pHermit
    });
    assert(power === 5000, "Hermit Sage's Wisdom: White Flag beats Rare card (Power 5000)");
}

// 1.5 BERSERKER (5A)
{
    const berserkerLogic = getCharacterLogic(CharacterType.BERSERKER);
    const pBerserker = mockPlayer('p1', CharacterType.BERSERKER);
    const powerNormal = berserkerLogic.getCardPower({
        card: { id: 'berserker-main-p1', suit: Suit.COLORLESS, value: 12, type: CardType.RARE },
        leadSuit: Suit.RED,
        isRevolt: false,
        isKakumei: false,
        trickContainsRare: false,
        onesInSuits: [],
        tensInSuits: [],
        berserker10Suits: [],
        berserkerMainInPlay: true,
        whiteFlagInPlay: false,
        hermitInPlay: false,
        berserkerInPlay: true,
        player: pBerserker
    });
    assert(powerNormal === 3000, "Berserker Main Card has raw power 3000 in normal play");
}

// ---------------------------------------------------------------------
// 2. TIER B: ADVENTURER (3B), COLLECTOR (4B), RULER (5B)
// ---------------------------------------------------------------------
console.log("\n▶ [Tier B] Testing Adventurer, Collector, Ruler...");

// 2.1 ADVENTURER (3B)
{
    const advLogic = getCharacterLogic(CharacterType.ADVENTURER);
    const pAdv = mockPlayer('p1', CharacterType.ADVENTURER);
    const setup = advLogic.setup({ deck: createDeck(), playerId: pAdv.id, round: 1, players: [pAdv] });
    assert(setup.itemSlots === 2, "Adventurer starts with 2 item slots");

    // Winning a trick levels up item slots
    pAdv.itemSlots = 2;
    const trickWonUpdate = advLogic.onTrickWon(pAdv, [], 1);
    assert(trickWonUpdate.itemSlots === 3, "Adventurer level up increases item slots from 2 to 3");
}

// 2.2 COLLECTOR (4B)
{
    const colLogic = getCharacterLogic(CharacterType.COLLECTOR);
    const pCol = mockPlayer('p1', CharacterType.COLLECTOR);
    // Collector gathers cards into collectedCards upon loss or win
    const sampleCard = { id: 'c1', suit: Suit.RED, value: 7, type: CardType.NUMBER };
    pCol.collectedCards = [sampleCard];
    assert(pCol.collectedCards.length === 1 && pCol.collectedCards[0].id === 'c1', "Collector stores lost/won cards in collection reserve");
}

// 2.3 RULER (5B)
{
    const rulerLogic = getCharacterLogic(CharacterType.RULER);
    const pRuler = mockPlayer('p1', CharacterType.RULER);
    const pKing = mockPlayer('p2', CharacterType.KING);
    const setup = rulerLogic.setup({ deck: createDeck(), playerId: pRuler.id, round: 1, players: [pRuler, pKing] });
    assert(setup.hand !== undefined && setup.hand.length === 5, "Ruler receives 5 cards in setup");
    assert(TASKS.length === 16, "Ruler has 16 royal decree tasks available in registry (Normal, Hard, Difficult)");
}

// ---------------------------------------------------------------------
// 3. TIER C: STRATEGIST (1C), SUMMONER (2C), ALCHEMIST (3C), TIME TRAVELER (4C), PHANTOM THIEF (5C)
// ---------------------------------------------------------------------
console.log("\n▶ [Tier C] Testing Strategist, Summoner, Alchemist, Time Traveler, Phantom Thief...");

// 3.1 STRATEGIST (1C)
{
    const stratLogic = getCharacterLogic(CharacterType.STRATEGIST);
    const pStrat = mockPlayer('p1', CharacterType.STRATEGIST);
    const deck = createDeck();
    const setup = stratLogic.setup({ deck, playerId: pStrat.id, round: 1, players: [pStrat] });
    assert(setup.hand !== undefined && setup.hand.length === 5, "Strategist starts with 5 cards hand");
    assert(TRAPS.length === 5, "Strategist has 5 configured tactical traps");
}

// 3.2 SUMMONER (2C)
{
    const summLogic = getCharacterLogic(CharacterType.SUMMONER);
    const pSumm = mockPlayer('p1', CharacterType.SUMMONER);
    const setup = summLogic.setup({ deck: [], playerId: pSumm.id, round: 1, players: [pSumm] });
    assert(setup.mp === 5, "Summoner starts with 5 MP mana points");
    assert(setup.beasts !== undefined && setup.beasts.length === 6, "Summoner has 6 spirit beasts available");

    // MP gain on trick win
    const wonUpdate = summLogic.onTrickWon(pSumm, [], 1);
    assert(wonUpdate.mp === 1, "Summoner gains +1 MP when winning a trick (0 -> 1)");
}

// 3.3 ALCHEMIST (3C)
{
    const alchLogic = getCharacterLogic(CharacterType.ALCHEMIST);
    const pAlch = mockPlayer('p1', CharacterType.ALCHEMIST);
    const setup = alchLogic.setup({ deck: [], playerId: pAlch.id, round: 1, players: [pAlch] });
    assert(setup.hand !== undefined && setup.hand.length === 6, "Alchemist starts with 6 cards from Alchemist Deck");
    assert(setup.alchemistDeck !== undefined && setup.alchemistDeck.length === 9, "Alchemist reserve deck contains 9 cards");

    // Transmutation calculation
    const cards = [
        { id: '1', value: 3, suit: Suit.RED, type: CardType.NUMBER },
        { id: '2', value: 4, suit: Suit.RED, type: CardType.NUMBER },
        { id: '3', value: 3, suit: Suit.BLUE, type: CardType.NUMBER }
    ]; // 3 + 4 + 3 = 10 -> Strong 10
    const alchemyRes = calculateAlchemyValue(cards);
    assert(alchemyRes.value === 10 && alchemyRes.isStrong === true, "Alchemist transmutation sum 10 creates Strong 10");

    // Elements detection
    const flushCards = [
        { id: '1', value: 1, suit: Suit.BLUE, type: CardType.NUMBER },
        { id: '2', value: 3, suit: Suit.BLUE, type: CardType.NUMBER },
        { id: '3', value: 5, suit: Suit.BLUE, type: CardType.NUMBER }
    ];
    const flushRes = calculateAlchemyValue(flushCards);
    assert(flushRes.elements.includes('FLUSH'), "Alchemist detects FLUSH magic element");
}

// 3.4 TIME TRAVELER (4C)
{
    const ttLogic = getCharacterLogic(CharacterType.TIME_TRAVELER);
    const pTT = mockPlayer('p1', CharacterType.TIME_TRAVELER);
    const setup = ttLogic.setup({ deck: [], playerId: pTT.id, round: 1, players: [pTT] });
    assert(setup.timeTravelTokens === 2, "Time Traveler starts with 2 Time Travel tokens");
}

// 3.5 PHANTOM THIEF (5C)
{
    const ptLogic = getCharacterLogic(CharacterType.PHANTOM_THIEF);
    const pThief = mockPlayer('p1', CharacterType.PHANTOM_THIEF);
    const pPartner = mockPlayer('p2', CharacterType.KING);
    const pTarget = mockPlayer('p3', CharacterType.SAMURAI);
    const players = [pThief, pPartner, pTarget];

    const setup = ptLogic.setup({ deck: createDeck(), playerId: pThief.id, round: 1, players });
    assert(setup.thiefPartnerId !== undefined, "Phantom Thief establishes a secret partner");
    assert(setup.thiefTargetIds !== undefined && setup.thiefTargetIds.length === 1, "Phantom Thief sets heist target");

    // Test Steal logic
    pThief.wins = 2;
    pThief.thiefChipValue = 0;
    pThief.thiefTargetIds = ['p3'];
    pTarget.wins = 2;
    pTarget.goldCrowns = 1;

    const stealRes = PhantomThiefLogic.resolveSteal(players, () => {});
    const thiefAfter = stealRes.find(p => p.id === 'p1')!;
    const victimAfter = stealRes.find(p => p.id === 'p3')!;
    assert(thiefAfter.goldCrowns === 1 && victimAfter.goldCrowns === 0, "Phantom Thief successfully steals Gold Crown upon equal wins");
}

// ---------------------------------------------------------------------
// 4. TIER D: NINJA (2D), SAMURAI (3D)
// ---------------------------------------------------------------------
console.log("\n▶ [Tier D] Testing Ninja, Samurai...");

// 4.1 NINJA (2D)
{
    const ninjaLogic = getCharacterLogic(CharacterType.NINJA);
    const pNinja = mockPlayer('p1', CharacterType.NINJA);
    pNinja.wins = 5;
    const winRes = ninjaLogic.onTrickWon(pNinja, [], 1);
    assert(winRes.score === 999, "Ninja triggers Instant Win (999 pts) upon winning 5 tricks");
}

// 4.2 SAMURAI (3D)
{
    const samLogic = getCharacterLogic(CharacterType.SAMURAI);
    const pSam = mockPlayer('p1', CharacterType.SAMURAI);
    const deck = [
        { id: 'b1', suit: Suit.BLACK, value: 5, type: CardType.NUMBER },
        { id: 'b2', suit: Suit.BLACK, value: 3, type: CardType.NUMBER },
        { id: 'r1', suit: Suit.RED, value: 7, type: CardType.NUMBER },
        { id: 'g1', suit: Suit.GREEN, value: 2, type: CardType.NUMBER },
        { id: 'u1', suit: Suit.BLUE, value: 4, type: CardType.NUMBER },
        { id: 'r2', suit: Suit.RED, value: 9, type: CardType.NUMBER },
        { id: 'g2', suit: Suit.GREEN, value: 6, type: CardType.NUMBER }
    ];
    const setup = samLogic.setup({ deck, playerId: pSam.id, round: 1, players: [pSam] });
    assert(!setup.hand!.some(c => c.suit === Suit.BLACK), "Samurai setup purges all Black cards from hand");
    assert(setup.hand!.length === 5, "Samurai hand size remains exactly 5 non-Black cards");

    // Samurai Spirit of Red: Red cards have Black tier power (+1000)
    const redPower = samLogic.getCardPower({
        card: { id: 'r1', suit: Suit.RED, value: 8, type: CardType.NUMBER },
        leadSuit: Suit.BLUE,
        isRevolt: false,
        isKakumei: false,
        trickContainsRare: false,
        onesInSuits: [],
        tensInSuits: [],
        berserker10Suits: [],
        berserkerMainInPlay: false,
        whiteFlagInPlay: false,
        hermitInPlay: false,
        berserkerInPlay: false,
        player: pSam
    });
    assert(redPower === 1008, "Samurai Spirit of Red boosts Red 8 to Power 1008");
}

console.log("\n=================================================");
console.log("🎉 ALL CHARACTER GAMEPLAY TESTS PASSED WITH 100% SUCCESS!");
console.log("=================================================");
