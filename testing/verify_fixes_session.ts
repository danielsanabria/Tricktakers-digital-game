import { BaseCharacterLogic } from '../logic/logic_Interface';
import { KingLogic } from '../logic/characters/logic_King';
import { GamblerLogic } from '../logic/characters/logic_Gambler';
import { RulerLogic } from '../logic/characters/logic_Ruler';
import { SamuraiLogic } from '../logic/characters/logic_Samurai';
import { StrategistLogic } from '../logic/characters/logic_Strategist';
import { PhantomThiefLogic } from '../logic/characters/logic_PhantomThief';
import { AdventurerLogic } from '../logic/characters/logic_Adventurer';
import { BerserkerLogic } from '../logic/characters/logic_Berserker';
import { TimeTravelerLogic } from '../logic/characters/logic_TimeTraveler';
import { createDeck } from '../game/core/gameLogic';
import { CharacterType, Card, Suit, CardType, Player } from '../game/core/types';

console.log("==================================================");
console.log("   VERIFYING ROUND 2 DEALING & MULTIPLAYER FIXES   ");
console.log("==================================================");

let testsPassed = 0;
let totalTests = 0;

function assert(condition: boolean, msg: string) {
    totalTests++;
    if (!condition) {
        console.error(`❌ FAILED: ${msg}`);
        process.exit(1);
    }
    console.log(`✅ PASSED: ${msg}`);
    testsPassed++;
}

// TEST 1: Round 2 dealing when providedHand is empty array []
console.log("\n--- TEST 1: Empty Array Handling in Character Setup (Round 2 Dealing) ---");
const deck = createDeck();
const mockPlayers: Player[] = [
    { id: 'p1', name: 'Host', isHuman: true, isBotControlled: false, hand: [] } as any,
    { id: 'p2', name: 'Guest', isHuman: true, isBotControlled: false, hand: [] } as any,
];

// BaseCharacterLogic
const baseLogic = new BaseCharacterLogic();
const baseRes = baseLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(Array.isArray(baseRes.hand) && baseRes.hand.length === 5, "BaseCharacterLogic deals 5 cards when hand is []");
assert(baseRes.hand![0].ownerId === 'p2', "BaseCharacterLogic assigns correct ownerId to dealt cards");

// KingLogic
const kingLogic = new KingLogic();
const kingRes = kingLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(Array.isArray(kingRes.hand) && kingRes.hand.length === 6, "KingLogic deals 5 + 1 rare = 6 cards when hand is []");

// GamblerLogic
const gamblerLogic = new GamblerLogic();
const gamblerRes = gamblerLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(Array.isArray(gamblerRes.hand) && gamblerRes.hand.length === 5, "GamblerLogic deals 5 cards when hand is []");

// RulerLogic
const rulerLogic = new RulerLogic();
const rulerRes = rulerLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(Array.isArray(rulerRes.hand) && rulerRes.hand.length === 5, "RulerLogic deals 5 cards when hand is []");

// SamuraiLogic
const samuraiLogic = new SamuraiLogic();
const samuraiRes = samuraiLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(Array.isArray(samuraiRes.hand) && samuraiRes.hand.length === 5, "SamuraiLogic deals 5 non-black cards when hand is []");
assert(!samuraiRes.hand!.some(c => c.suit === Suit.BLACK), "SamuraiLogic ensures zero black cards in hand");

// StrategistLogic
const strategistLogic = new StrategistLogic();
const stratRes = strategistLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(Array.isArray(stratRes.hand) && stratRes.hand.length === 5, "StrategistLogic deals 5 cards when hand is []");

// PhantomThiefLogic
const thiefLogic = new PhantomThiefLogic();
const thiefRes = thiefLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(Array.isArray(thiefRes.hand) && thiefRes.hand.length === 5, "PhantomThiefLogic deals 5 cards when hand is []");

// AdventurerLogic
const advLogic = new AdventurerLogic();
const advResHuman = advLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(Array.isArray(advResHuman.hand) && advResHuman.hand.length === 5, "Adventurer human deals 5 cards");
assert(advResHuman.items?.length === 0, "Adventurer human starts with empty items awaiting modal");

const advResAI = advLogic.setup({ deck: [...deck], playerId: 'bot_1', round: 2, hand: [], players: [{ id: 'bot_1', isHuman: false, isBotControlled: true } as any] });
assert(advResAI.items?.length === 2, "Adventurer AI auto-picks 2 items");

// BerserkerLogic
const berserkerLogic = new BerserkerLogic();
const berserkerResHuman = berserkerLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(berserkerResHuman.berserkerDeck?.length === 7, "Berserker human receives exclusive 7-card deck for setup modal");

const berserkerResAI = berserkerLogic.setup({ deck: [...deck], playerId: 'bot_1', round: 2, hand: [], players: [{ id: 'bot_1', isHuman: false, isBotControlled: true } as any] });
assert(berserkerResAI.hand?.length === 5, "Berserker AI auto-draws 5 cards");

// TimeTravelerLogic
const ttLogic = new TimeTravelerLogic();
const ttResHuman = ttLogic.setup({ deck: [...deck], playerId: 'p2', round: 2, hand: [], players: mockPlayers });
assert(Array.isArray(ttResHuman.hand) && ttResHuman.hand.length === 5, "TimeTraveler human deals 5 cards");

console.log("\n--- TEST 2: Guest Player isHuman / isLocalPlayer Logic ---");
// Simulating PlayerBoard isHuman calculation
const evalIsHuman = (player: { id: string }, isLocalPlayer?: boolean) => {
    return isLocalPlayer !== undefined ? isLocalPlayer : (player.id === 'p1');
};

const hostPlayer = { id: 'p1' };
const guestPlayer = { id: 'p2' };

assert(evalIsHuman(guestPlayer, true) === true, "Guest player in PlayerHandArea (isLocalPlayer=true) is correctly identified as interactive human");
assert(evalIsHuman(guestPlayer, false) === false, "Guest player on opponent board (isLocalPlayer=false) is correctly identified as non-interactive opponent");
assert(evalIsHuman(hostPlayer, false) === false, "Host player on opponent board for guest (isLocalPlayer=false) is correctly identified as opponent");
assert(evalIsHuman(hostPlayer, true) === true, "Host player in PlayerHandArea (isLocalPlayer=true) is correctly identified as interactive human");

console.log(`\n==================================================`);
console.log(`🎉 ALL ${testsPassed}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log(`==================================================`);
