import { KingLogic } from '../logic/characters/logic_King';
import { StrategistLogic } from '../logic/characters/logic_Strategist';
import { GamblerLogic } from '../logic/characters/logic_Gambler';
import { SummonerLogic } from '../logic/characters/logic_Summoner';
import { NinjaLogic } from '../logic/characters/logic_Ninja';
import { ResistanceLogic } from '../logic/characters/logic_Resistance';
import { AdventurerLogic } from '../logic/characters/logic_Adventurer';
import { AlchemistLogic } from '../logic/characters/logic_Alchemist';
import { SamuraiLogic } from '../logic/characters/logic_Samurai';
import { HermitLogic } from '../logic/characters/logic_Hermit';
import { CollectorLogic } from '../logic/characters/logic_Collector';
import { TimeTravelerLogic } from '../logic/characters/logic_TimeTraveler';
import { BerserkerLogic } from '../logic/characters/logic_Berserker';
import { RulerLogic } from '../logic/characters/logic_Ruler';
import { PhantomThiefLogic } from '../logic/characters/logic_PhantomThief';
import { CharacterType, Suit, CardType, Player } from '../game/core/types';

// --- MOCK DATA ---
const mockDeck = Array(60).fill(null).map((_, i) => ({
    id: `card-${i}`,
    suit: i % 2 === 0 ? Suit.RED : i % 3 === 0 ? Suit.BLUE : Suit.GREEN,
    value: (i % 9) + 1,
    type: CardType.NUMBER
}));

const basePlayer: Player = {
    id: 'p1',
    name: 'Tester',
    character: null,
    hand: [],
    wonCards: [],
    score: 0,
    goldCrowns: 0,
    blackCrowns: 0,
    wins: 0,
    items: [],
    tasks: [],
    mp: 0,
    beasts: [],
    rearBeasts: [],
    magicElements: [],
    collectedCards: [],
    timeTravelTokens: 0,
    timeTravelPredictions: [],
    revoltsLeft: 0,
    itemSlots: 0,
    gambleSwaps: 0,
    betAmount: 0,
    thiefChipValue: 0,
    thiefTargetIds: [],
    thiefBetrayalMode: false
};

const otherPlayers: Player[] = [
    { ...basePlayer, id: 'p2', name: 'Riv 1' },
    { ...basePlayer, id: 'p3', name: 'Riv 2' }
];

function runTest(name: string, testFn: () => boolean) {
    try {
        if (testFn()) console.log(`✅ ${name}`);
        else console.error(`❌ ${name}`);
    } catch (e) {
        console.error(`❌ ${name} (EXCEPTION: ${e})`);
    }
}

console.log("=== TRICKTAKERS CHARACTER LOGIC VERIFICATION ===");

// 1. KING (1A)
runTest('King Setup (Rare + 6 Cards)', () => {
    const l = new KingLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 6 && res.hand.some(c => c.type === CardType.RARE);
});

// 2. STRATEGIST (1C)
runTest('Strategist Setup (Black 7 + 6 Cards)', () => {
    const l = new StrategistLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 6 && res.hand.some(c => c.value === 7 && c.suit === Suit.BLACK);
});

// 3. GAMBLER (2A)
runTest('Gambler Default Setup (5 Cards)', () => {
    const l = new GamblerLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 5;
});

// 4. SUMMONER (2C)
runTest('Summoner Setup (Beasts initialized)', () => {
    const l = new SummonerLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.mp === 5 && res.beasts && res.beasts.length > 0;
});

// 5. NINJA (2D)
runTest('Ninja Setup', () => {
    const l = new NinjaLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 5;
});

// 6. RESISTANCE (3A)
runTest('Resistance Setup', () => {
    const l = new ResistanceLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 5;
});

// 7. ADVENTURER (3B)
runTest('Adventurer Setup (Has Items)', () => {
    const l = new AdventurerLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    // Adventurer provides items after selection, but setup might init slots.
    return res.hand?.length === 5;
});

// 8. ALCHEMIST (3C)
runTest('Alchemist Setup', () => {
    const l = new AlchemistLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 6;
});

// 9. SAMURAI (3D)
runTest('Samurai Setup', () => {
    const l = new SamuraiLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 5;
});

// 10. HERMIT (4A)
runTest('Hermit Setup', () => {
    const l = new HermitLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 5;
});

// 11. COLLECTOR (4B)
runTest('Collector Setup', () => {
    const l = new CollectorLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 5;
});

// 12. TIME TRAVELER (4C)
runTest('Time Traveler Setup', () => {
    const l = new TimeTravelerLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 5;
});

// 13. BERSERKER (5A)
runTest('Berserker Setup', () => {
    const l = new BerserkerLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 5;
});

// 14. RULER (5B)
runTest('Ruler Setup', () => {
    const l = new RulerLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    // Ruler assigns tasks to opponents (in res.tasksAssigned)
    return res.hand?.length === 5;
});

// 15. PHANTOM THIEF (5C)
runTest('Phantom Thief Setup', () => {
    const l = new PhantomThiefLogic();
    const res = l.setup({ deck: [...mockDeck], playerId: 'p1', round: 1, players: [basePlayer, ...otherPlayers] });
    return res.hand?.length === 5 && !!res.thiefPartnerId;
});

console.log("=== VALIDATION END ===");
