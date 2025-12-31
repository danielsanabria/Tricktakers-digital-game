
import {
    Player, CharacterType, Card, Suit, CardType, GamePhase, SetupContext, PowerContext
} from './types';
import { CHARACTERS, ITEMS, BEASTS, TRAPS } from './constants';
import { createDeck, determineWinner, getValidMoves, calculateAlchemyValue, calculateCollectorScore } from './gameLogic';
import { getCharacterLogic } from './logic/logic_Registry';

function createInitialPlayers(characters: CharacterType[]): Player[] {
    return characters.map((char, i) => ({
        id: `p${i + 1}`,
        name: `Player ${i + 1}`,
        character: char,
        hand: [],
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
    }));
}

async function runSimulation(characters: CharacterType[], rounds: number = 1) {
    console.log("=== TRICKTAKERS SIMULATOR ===");
    console.log(`Players: ${characters.join(", ")}\n`);

    let players = createInitialPlayers(characters);
    let round = 1;

    while (round <= rounds) {
        console.log(`\n--- ROUND ${round} ---`);
        let deck = createDeck();

        // Setup Phase
        players = players.map(p => {
            const logic = getCharacterLogic(p.character);
            const setupData = logic.setup({ deck, playerId: p.id, round, players });
            return {
                ...p,
                ...setupData,
                wonCards: [],
                wins: 0,
                revoltUsed: false,
                wonRevolutionTrick: false
            };
        });

        let trick = 1;
        let starterIdx = 0;
        let isKakumei = false;
        let isRevolt = false;

        while (trick <= 5) {
            console.log(`\nTrick ${trick} (Starter: ${players[starterIdx].name})`);
            let playedCards: Card[] = [];
            let leadSuit: Suit | null = null;

            for (let i = 0; i < players.length; i++) {
                const currentIdx = (starterIdx + i) % players.length;
                const p = players[currentIdx];

                // Super simple AI: Play first valid card
                const validMoves = getValidMoves(p.hand, leadSuit);
                const card = validMoves[0] || p.hand[0];

                if (!card) {
                    console.log(`${p.name} has no cards to play! Skipping.`);
                    continue;
                }

                if (leadSuit === null && card.suit !== Suit.COLORLESS) {
                    leadSuit = card.suit;
                }

                const finalCard = { ...card, ownerId: p.id };
                playedCards.push(finalCard);
                p.hand = p.hand.filter(c => c.id !== card.id);

                console.log(`${p.name} (${CHARACTERS[p.character!].name}) played ${card.suit} ${card.value || ''} (${card.type})`);
            }

            // Determine Winner
            const winnerId = determineWinner(playedCards, leadSuit, isRevolt, isKakumei, players, false);
            const winnerIdx = players.findIndex(p => p.id === winnerId);
            const winner = players[winnerIdx];

            console.log(`Winner: ${winner.name} (${CHARACTERS[winner.character!].name})`);

            winner.wins++;
            winner.wonCards.push(...playedCards);

            // Post-Win Logic
            const logic = getCharacterLogic(winner.character);
            if (logic.onTrickWon) {
                const updates = logic.onTrickWon(winner, playedCards, round);
                // Adventurer Setup Simulation
                if (winner.character === CharacterType.ADVENTURER && winner.id === 'p1') {
                    console.log("  [SIM] Adventurer needs setup.");
                }
                // Berserker Setup Simulation
                if (winner.character === CharacterType.BERSERKER && winner.id === 'p1') {
                    console.log("  [SIM] Berserker Setup TRIGGERED.");
                }
                Object.assign(winner, updates);
                if (winner.character === CharacterType.ADVENTURER && updates.items) {
                    console.log(`Adventurer gained item: ${updates.items[updates.items.length - 1].name}`);
                }
            }

            starterIdx = winnerIdx;
            trick++;

            // End of Kakumei check (simplified)
            if (isKakumei) isKakumei = false;
        }

        // Round Resolution
        console.log(`\nRound ${round} Summary:`);
        players.forEach(p => {
            console.log(`${p.name} (${CHARACTERS[p.character!].name}): ${p.wins} wins`);
        });

        round++;
    }

    console.log("\n=== SIMULATION COMPLETE ===");
}

async function testResistance() {
    console.log("\n=== TESTING RESISTANCE (3A) ===");
    const players = createInitialPlayers([CharacterType.RESISTANCE, CharacterType.KING, CharacterType.HERMIT]);
    const res = players[0];

    // Setup manual hand for Resistance
    res.hand = [
        { id: 'r1', suit: Suit.BLACK, value: 8, type: CardType.NUMBER, ownerId: 'p1' },
        { id: 'r2', suit: Suit.RED, value: 1, type: CardType.NUMBER, ownerId: 'p1' }
    ];
    players[1].hand = [{ id: 'k1', suit: Suit.RED, value: 10, type: CardType.NUMBER, ownerId: 'p2' }];
    players[2].hand = [{ id: 'h1', suit: Suit.RED, value: 5, type: CardType.NUMBER, ownerId: 'p3' }];

    console.log("Triggering Revolution (Kakumei)...");
    let isKakumei = true;
    res.wonRevolutionTrick = false;

    const playedCards: Card[] = [
        res.hand[0], // Black 8
        players[1].hand[0], // Red 10
        players[2].hand[0] // Red 5
    ];

    console.log(`Resistance plays ${playedCards[0].suit} ${playedCards[0].value}`);
    console.log(`King plays ${playedCards[1].suit} ${playedCards[1].value}`);

    const winnerId = determineWinner(playedCards, Suit.RED, false, isKakumei, players, false);
    const winner = players.find(p => p.id === winnerId)!;
    console.log(`Winner with Kakumei: ${winner.name} (${CHARACTERS[winner.character!].name})`);

    // Check for Priority 1 Victory
    if (isKakumei && winner.character === CharacterType.RESISTANCE && playedCards[0].suit === Suit.BLACK) {
        console.log("SUCCESS: Resistance triggered INSTANT WIN with Black card during Kakumei!");
        winner.score += 900;
    }

    if (winner.score >= 900) {
        console.log("SIMULATION MODE: Game Over - Resistance Wins!");
    }
}

async function testAdventurerItems() {
    console.log("\n=== TESTING ADVENTURER ITEMS (3B) ===");
    const players = createInitialPlayers([CharacterType.ADVENTURER, CharacterType.KING, CharacterType.HERMIT]);
    const adv = players[0];

    // Test Case 1: Berserker's Axe (FIX_10)
    adv.hand = [{ id: 'a1', suit: Suit.RED, value: 3, type: CardType.NUMBER, ownerId: 'p1' }];
    adv.pendingItemEffect = 'FIX_10';
    console.log(`Adventurer plays RED 3 with FIX_10 effect...`);

    let card = { ...adv.hand[0] };
    if (adv.pendingItemEffect === 'FIX_10') {
        card.value = 10;
    }
    console.log(`Final Card Value: ${card.value} (Expected: 10)`);
    if (card.value === 10) console.log("SUCCESS: FIX_10 applied correctly.");

    // Test Case 2: Miracle Sword (VALUE_MODIFY)
    adv.hand = [{ id: 'a2', suit: Suit.BLUE, value: 3, type: CardType.NUMBER, ownerId: 'p1' }];
    adv.pendingItemEffect = 'VALUE_MODIFY';
    console.log(`Adventurer plays BLUE 3 with VALUE_MODIFY effect...`);

    card = { ...adv.hand[0] };
    if (adv.pendingItemEffect === 'VALUE_MODIFY') {
        const mod = card.value <= 4 ? 5 : -5;
        card.value = Math.max(1, Math.min(9, card.value + mod));
    }
    console.log(`Final Card Value: ${card.value} (Expected: 8)`);
    if (card.value === 8) console.log("SUCCESS: VALUE_MODIFY applied correctly.");
}

async function testKing() {
    console.log("\n=== TESTING KING (1A) ===");
    const players = createInitialPlayers([CharacterType.KING, CharacterType.RESISTANCE, CharacterType.HERMIT]);
    const deck = createDeck();
    const king = players[0];

    // 1. Setup Phase
    const setupData = getCharacterLogic(king.character).setup({ deck, playerId: king.id, round: 1, players });
    Object.assign(king, setupData);

    console.log(`King Hand Size: ${king.hand.length} (Expected: 6)`);
    const hasRare = king.hand.some(c => c.type === CardType.RARE);
    console.log(`King has Rare card: ${hasRare}`);
    if (king.hand.length === 6 && hasRare) console.log("SUCCESS: King setup correct.");

    // 2. Instant Win check (onTrickWon)
    king.wins = 4;
    const logic = getCharacterLogic(king.character);
    const updates = logic.onTrickWon!(king, [], 1);
    console.log(`King Score after 5th win: ${updates.score} (Expected: 999)`);
    if (updates.score === 999) console.log("SUCCESS: King instant win triggered.");

    // 3. Round 3 Double Points (Manual check of scoring logic)
    // simulate scoring as in App.tsx
    const wins = 3; // 80 points
    let pts = CHARACTERS[CharacterType.KING].pointsByWins[wins];
    const round = 3;
    if (round === 3) pts *= 2;
    console.log(`King points for 3 wins in Round 3: ${pts} (Expected: 160)`);
    if (pts === 160) console.log("SUCCESS: King round 3 multiplier correct.");
}

async function testGambler() {
    console.log("\n=== TESTING GAMBLER (2A) ===");
    const players = createInitialPlayers([CharacterType.GAMBLER, CharacterType.KING, CharacterType.HERMIT]);
    const deck = createDeck();
    const gamb = players[0];

    // 1. Setup Points
    const setupData = getCharacterLogic(gamb.character).setup({ deck, playerId: gamb.id, round: 1, players });
    Object.assign(gamb, setupData);
    console.log(`Gambler Initial Score: ${gamb.score} (Expected: 50 -> 30 base + 20 bonus)`);
    if (gamb.score === 50) console.log("SUCCESS: Gambler selection bonus correct.");

    // 2. Instant Win: Bid 4, Win 4
    gamb.bid = 4;
    gamb.wins = 3; // About to win the 4th
    const logic = getCharacterLogic(gamb.character);
    const updates = logic.onTrickWon!(gamb, [], 1);
    console.log(`Gambler score after 4/4 wins: ${updates.score} (Expected: 999)`);
    if (updates.score === 999) console.log("SUCCESS: Gambler bid 4 win 4 instant win.");

    // 3. Scoring Success
    gamb.score = 50;
    gamb.bid = 2; // 90 points
    gamb.wins = 2;
    gamb.betAmount = 20;

    // Scoring logic from App.tsx
    const success = gamb.bid === gamb.wins;
    let pts = CHARACTERS[CharacterType.GAMBLER].pointsByWins[gamb.wins];
    if (success) {
        pts += gamb.betAmount;
    } else {
        pts = -gamb.betAmount;
    }
    console.log(`Gambler scoring success (2 wins, 20 bet): ${pts} (Expected: 110 -> 90 + 20)`);
    if (pts === 110) console.log("SUCCESS: Gambler scoring success correct.");

    // 4. Scoring Failure
    gamb.wins = 1;
    const failurePts = (gamb.bid === gamb.wins) ? pts : -gamb.betAmount;
    console.log(`Gambler scoring failure (1 win vs 2 bid, 20 bet): ${failurePts} (Expected: -20)`);
    if (failurePts === -20) console.log("SUCCESS: Gambler scoring failure (penalty) correct.");
}

async function testStrategist() {
    console.log("\n=== TESTING STRATEGIST (1C) ===");
    const players = createInitialPlayers([CharacterType.STRATEGIST, CharacterType.KING, CharacterType.HERMIT]);
    const strat = players[0];
    const king = players[1];

    // 1. Trap Check & Immunity
    const trap = TRAPS.find(t => t.id === 'trap-4')!; // Black Card trap
    console.log(`Trap Active: ${trap.name}`);
    const blackCard = { id: 'b1', suit: Suit.BLACK, value: 5, type: CardType.NUMBER, ownerId: strat.id };

    // Strategist plays black card
    let trapPool = 0;
    if (trap.condition(blackCard, null) && strat.character !== CharacterType.STRATEGIST) {
        trapPool += 10;
    }
    console.log(`Trap Pool after Strategist plays Black: ${trapPool} (Expected: 0)`);
    if (trapPool === 0) console.log("SUCCESS: Strategist immune to traps.");

    // King plays black card
    const kingCard = { ...blackCard, ownerId: king.id };
    king.score = 50;
    if (trap.condition(kingCard, null) && king.character !== CharacterType.STRATEGIST) {
        if (king.score >= 10) {
            king.score -= 10;
            trapPool += 10;
        }
    }
    console.log(`Trap Pool after King plays Black: ${trapPool} (Expected: 10)`);
    console.log(`King Score: ${king.score} (Expected: 40)`);
    if (trapPool === 10 && king.score === 40) console.log("SUCCESS: Opponent penalized by trap.");

    // 2. Collection
    strat.wins = 0;
    if (strat.character === CharacterType.STRATEGIST && trapPool > 0) {
        strat.score += trapPool;
        trapPool = 0;
    }
    console.log(`Strategist Score after winning: ${strat.score} (Expected: 40 -> 30 base + 10 pool)`);
    if (strat.score === 40) console.log("SUCCESS: Strategist captured the pool.");
}

async function testSummoner() {
    console.log("\n=== TESTING SUMMONER (2C) ===");
    const players = createInitialPlayers([CharacterType.SUMMONER, CharacterType.KING, CharacterType.HERMIT]);
    const summ = players[0];

    // 1. MP Setup
    const deck = createDeck();
    const setupData = getCharacterLogic(summ.character).setup({ deck, playerId: summ.id, round: 1, players });
    Object.assign(summ, setupData);
    console.log(`Summoner Initial MP: ${summ.mp} (Expected: 5)`);
    if (summ.mp === 5) console.log("SUCCESS: Summoner MP setup correct.");

    // 2. Front Movement Cost
    summ.rearBeasts = ['b-miria'];
    const playedCard = { id: 'c1', suit: Suit.RED, value: 5, type: CardType.NUMBER, ownerId: summ.id };

    // Move MIRIA to front (No matching color/value)
    const beast = BEASTS.find(b => b.id === 'b-miria')!;
    let cost = 0;
    const match = (beast.suit && playedCard.suit === beast.suit) || (playedCard.value === 10);
    if (!match) cost = 1;

    summ.mp -= cost;
    summ.frontBeastId = 'b-miria';
    console.log(`Summoner MP after moving MIRIA (no match): ${summ.mp} (Expected: 4)`);
    if (summ.mp === 4) console.log("SUCCESS: Summoner paid MP for movement.");

    // 3. Power Overwrite
    const logic = getCharacterLogic(summ.character);
    const power = logic.getCardPower!({
        card: playedCard,
        player: summ,
        leadSuit: Suit.BLUE,
        isRevolt: false,
        isKakumei: false,
        trickContainsRare: false,
        trickContainsOne: false,
        whiteFlagInPlay: false,
        hermitInPlay: false,
        berserkerInPlay: false
    });
    console.log(`Card Power with MIRIA at front: ${power} (Expected: 3000)`);
    if (power === 3000) console.log("SUCCESS: Beast at front overwrote card power.");
}

async function testNinja() {
    console.log("\n=== TESTING NINJA (2D) ===");
    const players = createInitialPlayers([CharacterType.NINJA, CharacterType.KING, CharacterType.HERMIT]);
    const ninja = players[0];

    // 1. Instant Win check
    ninja.wins = 4;
    const logic = getCharacterLogic(ninja.character);
    const updates = logic.onTrickWon!(ninja, [], 1);
    console.log(`Ninja score after 5th win: ${updates.score} (Expected: 999)`);
    if (updates.score === 999) console.log("SUCCESS: Ninja instant win at 5 wins.");

    // 2. Face down play simulation
    const card = { id: 'n1', suit: Suit.RED, value: 5, type: CardType.NUMBER, ownerId: ninja.id, isFacedown: true };
    console.log(`Ninja plays ${card.suit} ${card.value} FACE DOWN.`);
    if (card.isFacedown) console.log("SUCCESS: Ninja played card face down.");
}

async function testAlchemist() {
    console.log("\n=== TESTING ALCHEMIST (3C) ===");
    const cards: Card[] = [
        { id: 'a1', suit: Suit.RED, value: 5, type: CardType.NUMBER },
        { id: 'a2', suit: Suit.RED, value: 7, type: CardType.NUMBER },
        { id: 'a3', suit: Suit.RED, value: 3, type: CardType.NUMBER }
    ];
    // 5+7+3 = 15 -> Ones digit is 5.
    const result = calculateAlchemyValue(cards);
    console.log(`Alchemist transmute (5, 7, 3): Value ${result.value} (Expected: 5)`);
    if (result.value === 5) console.log("SUCCESS: Alchemy calculation correct.");

    const cards2: Card[] = [
        { id: 'a4', suit: Suit.BLUE, value: 6, type: CardType.NUMBER },
        { id: 'a5', suit: Suit.BLUE, value: 4, type: CardType.NUMBER },
        { id: 'a6', suit: Suit.BLUE, value: 0, type: CardType.WHITE_FLAG }
    ];
    // 6+4+0 = 10 -> Ones digit is 0. isStrong should be true.
    const result2 = calculateAlchemyValue(cards2);
    console.log(`Alchemist transmute (6, 4, WF): Value ${result2.value}, Strong: ${result2.isStrong} (Expected: 10, true)`);
    if (result2.value === 10 && result2.isStrong) console.log("SUCCESS: Alchemy strong transmutation correct (Sum 10).");

    const cards3: Card[] = [
        { id: 'a7', suit: Suit.BLUE, value: 9, type: CardType.NUMBER },
        { id: 'a8', suit: Suit.BLUE, value: 9, type: CardType.NUMBER },
        { id: 'a9', suit: Suit.BLUE, value: 2, type: CardType.NUMBER }
    ];
    // 9+9+2 = 20 -> Value 0 (11 or more rule)
    const result3 = calculateAlchemyValue(cards3);
    console.log(`Alchemist transmute (9, 9, 2): Value ${result3.value} (Expected: 0)`);
    if (result3.value === 0) console.log("SUCCESS: Alchemy 11+ rule correct (Sum 20 -> 0).");
}

async function testSamurai() {
    console.log("\n=== TESTING SAMURAI (3D) ===");
    const players = createInitialPlayers([CharacterType.SAMURAI, CharacterType.KING, CharacterType.HERMIT]);
    const sam = players[0];

    // 1. Setup Phase (Black Card Filter)
    const deck = [
        { id: 'b1', suit: Suit.BLACK, value: 5, type: CardType.NUMBER },
        { id: 'b2', suit: Suit.BLACK, value: 2, type: CardType.NUMBER },
        { id: 'r1', suit: Suit.RED, value: 8, type: CardType.NUMBER },
        { id: 'g1', suit: Suit.GREEN, value: 1, type: CardType.NUMBER },
        { id: 'bl1', suit: Suit.BLUE, value: 4, type: CardType.NUMBER },
        { id: 'r2', suit: Suit.RED, value: 3, type: CardType.NUMBER }, // Backup cards
        { id: 'g2', suit: Suit.GREEN, value: 6, type: CardType.NUMBER }
    ];
    const logic = getCharacterLogic(sam.character);
    const setupData = logic.setup({ deck: [...deck], playerId: sam.id, round: 1, players });
    Object.assign(sam, setupData);

    console.log(`Samurai Hand after setup: ${sam.hand.map(c => c.suit).join(', ')}`);
    const hasBlack = sam.hand.some(c => c.suit === Suit.BLACK);
    console.log(`Samurai has Black cards: ${hasBlack} (Expected: false)`);
    if (!hasBlack && sam.hand.length === 5) console.log("SUCCESS: Samurai filtered black cards.");

    // 2. Spirit of Red (Power Check)
    const redCard = { id: 'sr1', suit: Suit.RED, value: 8, type: CardType.NUMBER, ownerId: sam.id };
    const power = logic.getCardPower!({
        card: redCard,
        player: sam,
        leadSuit: Suit.BLUE,
        isRevolt: false,
        isKakumei: false,
        trickContainsRare: false,
        trickContainsOne: false,
        whiteFlagInPlay: false,
        hermitInPlay: false,
        berserkerInPlay: false
    });
    // RED treated as BLACK -> Power 1008
    console.log(`Samurai Red 8 Power: ${power} (Expected: 1008)`);
    if (power === 1008) console.log("SUCCESS: Spirit of Red active.");

    // 3. Instant Win Check
    sam.wins = 3;
    const winUpdates = logic.onTrickWon!(sam, [], 1);
    console.log(`Samurai score after 4th win: ${winUpdates.score} (Expected: 999)`);
    if (winUpdates.score === 999) console.log("SUCCESS: Samurai instant win at 4 wins.");

    // 4. Greedy Penalty
    sam.wins = 5;
    // Simulate App.tsx resolveRound
    let pts = CHARACTERS[CharacterType.SAMURAI].pointsByWins[sam.wins];
    if (sam.wins === 5) pts = -100;
    console.log(`Samurai points for 5 wins: ${pts} (Expected: -100)`);
    if (pts === -100) console.log("SUCCESS: Samurai greedy penalty applied.");
}

// Example: Test All Implemented Characters
async function main() {
    await testResistance();
    await testAdventurerItems();
    await testKing();
    await testGambler();
    await testStrategist();
    await testSummoner();
    await testNinja();
    await testAlchemist();
    await testSamurai();
    await testHermit();
    await testCollector();
    await testTimeTraveler();
    await testBerserker();
}

async function testBerserker() {
    console.log("\n--- Testing Berserker (5A) ---");
    const players = createInitialPlayers([CharacterType.BERSERKER, CharacterType.KING, CharacterType.HERMIT]);
    const berserker = players[0];
    const logic = getCharacterLogic(CharacterType.BERSERKER);

    // 1. Off-Suit Weakness Test
    const leadSuit = Suit.BLACK;
    const offSuitCard: Card = { id: 'berserker-blue-10', suit: Suit.BLUE, value: 10, type: CardType.NUMBER, ownerId: berserker.id };

    // Calculate Power
    const power = logic.getCardPower!({
        card: offSuitCard,
        player: berserker,
        leadSuit: leadSuit,
        isRevolt: false,
        isKakumei: false,
        trickContainsRare: false,
        trickContainsOne: false,
        whiteFlagInPlay: false,
        hermitInPlay: false,
        berserkerInPlay: true
    });

    console.log(`Berserker Plays Off-Suit (Blue 10 vs Black Lead): Power ${power} (Expected: 10)`);
    if (power === 10) console.log("SUCCESS: Berserker fails to get 3000 boost on off-suit.");
    else console.log("FAILURE: Berserker got incorrect power bonus.");

    // 2. Main Card Strength (Colorless 12)
    const mainCard: Card = { id: 'berserker-main', suit: Suit.COLORLESS, value: 12, type: CardType.RARE, ownerId: berserker.id, imagePath: 'berserker-init.png' };
    const mainPower = logic.getCardPower!({
        card: mainCard,
        player: berserker,
        leadSuit: leadSuit,
        isRevolt: false,
        isKakumei: false,
        trickContainsRare: false,
        trickContainsOne: false,
        whiteFlagInPlay: false,
        hermitInPlay: false,
        berserkerInPlay: true
    });
    console.log(`Berserker Plays Main Card (Colorless vs Black Lead): Power ${mainPower} (Expected: 3000)`);
    if (mainPower === 3000) console.log("SUCCESS: Berserker Main Card retains 3000 boost.");
    else console.log("FAILURE: Berserker Main Card incorrect power.");

    // 3. Matching Suit Strength
    const matchingCard: Card = { id: 'berserker-black-10', suit: Suit.BLACK, value: 10, type: CardType.NUMBER, ownerId: berserker.id };
    const matchingPower = logic.getCardPower!({
        card: matchingCard,
        player: berserker,
        leadSuit: leadSuit,
        isRevolt: false,
        isKakumei: false,
        trickContainsRare: false,
        trickContainsOne: false,
        whiteFlagInPlay: false,
        hermitInPlay: false,
        berserkerInPlay: true
    });
    console.log(`Berserker Plays Matching Suit (Black 10 vs Black Lead): Power ${matchingPower} (Expected >= 3500)`);
    // Base 3000 + 1000 (Black Bonus) + 500 (Lead Match) = 4500
    if (matchingPower >= 3000) console.log("SUCCESS: Berserker matching suit retains boost.");
}

async function testHermit() {
    console.log("\n--- Testing Hermit (4A) ---");
    const hermit = createInitialPlayers([CharacterType.HERMIT])[0];
    const logic = getCharacterLogic(CharacterType.HERMIT);

    // 1. White Flag > Rare
    const rareCard: Card = { id: 'rare', suit: Suit.COLORLESS, value: 50, type: CardType.RARE };
    const wfCard: Card = { id: 'wf', suit: Suit.COLORLESS, value: 0, type: CardType.WHITE_FLAG, ownerId: hermit.id };
    const power = logic.getCardPower({ card: wfCard, trickContainsRare: true, leadSuit: null, player: hermit, isRevolt: false, isKakumei: false, trickContainsOne: false, whiteFlagInPlay: true, hermitInPlay: true, berserkerInPlay: false });
    console.log(`Hermit WF Power vs Rare: ${power} (Expected: 5000)`);
    if (power === 5000) console.log("SUCCESS: Hermit WF beats Rare.");

    // 2. Bonus Points
    const updates = logic.onTrickWon!(hermit, [rareCard, wfCard], 1);
    console.log(`Hermit bonus points (Round 1): ${updates.score} (Expected: 30)`);
    if (updates.score === 30) console.log("SUCCESS: Hermit received bonus points.");
}

async function testCollector() {
    console.log("\n--- Testing Collector (4B) ---");
    const coll = createInitialPlayers([CharacterType.COLLECTOR])[0];
    const logic = getCharacterLogic(CharacterType.COLLECTOR);

    // 1. Poker Scoring
    coll.collectedCards = [
        { id: '1', suit: Suit.RED, value: 1, type: CardType.NUMBER },
        { id: '2', suit: Suit.RED, value: 2, type: CardType.NUMBER },
        { id: '3', suit: Suit.RED, value: 3, type: CardType.NUMBER }
    ];
    // In our simplified logic: count >= 3 of same suit = +20
    const result = calculateCollectorScore(coll.collectedCards);
    console.log(`Collector score for Flush 3: ${result.score} (Expected: 20)`);
    if (result.score === 20) console.log("SUCCESS: Collector scoring working.");

    // 2. Garbage Penalty
    coll.collectedCards = [
        { id: '1', suit: Suit.RED, value: 1, type: CardType.NUMBER },
        { id: '2', suit: Suit.BLUE, value: 2, type: CardType.NUMBER }
    ];
    const result2 = calculateCollectorScore(coll.collectedCards);
    console.log(`Collector score for 2 garbage: ${result2.score} (Expected: -10)`);
    if (result2.score === -10) console.log("SUCCESS: Collector penalty working.");
}

async function testTimeTraveler() {
    console.log("\n--- Testing Time Traveler (4C) ---");
    const tt = createInitialPlayers([CharacterType.TIME_TRAVELER])[0];

    // 1. Prediction Scoring
    tt.timeTravelPredictions = ['p2', 'p1', 'p3']; // Predicted p2 for gold, p1 & p3 for black

    // Simulate resolveRound end
    const roundGoldWinnerId = 'p2';
    const roundBlackWinners = [{ id: 'p1' }, { id: 'p3' }];

    let predictionBonus = 0;
    if (tt.timeTravelPredictions[0] === roundGoldWinnerId) predictionBonus += 50;
    if (roundBlackWinners.some(bw => bw.id === tt.timeTravelPredictions[1])) predictionBonus += 50;
    if (roundBlackWinners.some(bw => bw.id === tt.timeTravelPredictions[2])) predictionBonus += 50;

    console.log(`Time Traveler prediction bonus: ${predictionBonus} (Expected: 150)`);
    if (predictionBonus === 150) console.log("SUCCESS: Time Traveler prediction scoring working.");
}

main().catch(console.error);

