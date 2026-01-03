
import { PhantomThiefLogic } from '../logic/characters/logic_PhantomThief';
import { CharacterType, Suit, CardType, Player, Card, SetupContext } from '../game/core/types';

// Mock Data Helpers
const createCard = (id: string, suit: Suit, value: number, type: CardType = CardType.NUMBER): Card => ({
    id, suit, value, type, name: `${suit} ${value}`
});

const createPlayer = (id: string, name: string): Player => ({
    id, name, character: null, hand: [], wonCards: [], score: 0,
    goldCrowns: 0, blackCrowns: 0, wins: 0, items: [], tasks: [],
    mp: 0, beasts: [], rearBeasts: [], magicElements: [], collectedCards: [],
    timeTravelTokens: 0, timeTravelPredictions: []
});

function runTests() {
    console.log("🕵️‍♀️ VERIFICANDO PHANTOM THIEF (5C) 🕵️‍♀️\n");
    let passed = 0;
    let total = 0;

    const assert = (condition: boolean, msg: string) => {
        total++;
        if (condition) {
            console.log(`✅ ${msg}`);
            passed++;
        } else {
            console.error(`❌ ${msg}`);
        }
    };

    // --- TEST 1: Setup (Partner Assignment) ---
    {
        console.log("\n🧪 TEST 1: Setup & Partner Assignment");
        const logic = new PhantomThiefLogic();
        const p1 = createPlayer('p1', 'Thief'); // Self
        const p2 = createPlayer('p2', 'Partner?');
        const p3 = createPlayer('p3', 'Target?');
        const players = [p1, p2, p3];

        const deck = [
            createCard('c1', Suit.RED, 1), createCard('c2', Suit.BLUE, 2),
            createCard('c3', Suit.GREEN, 3), createCard('c4', Suit.BLACK, 4),
            createCard('c5', Suit.RED, 5), createCard('c6', Suit.BLUE, 6)
        ];

        const context: SetupContext = { deck, playerId: 'p1', round: 1, players };
        const updates = logic.setup(context);

        assert(updates.thiefPartnerId !== undefined, "Se asignó un Partner ID");
        assert(updates.thiefPartnerId === 'p2' || updates.thiefPartnerId === 'p3', "El partner es p2 o p3");
        assert(updates.thiefTargetIds!.length === 1, "Hay 1 objetivo en partida de 3");
        assert(!updates.thiefTargetIds!.includes(updates.thiefPartnerId!), "El partner no está en targets");

        // Note: The actual Card Swap happens in the ACTION 'PHANTOM_THIEF_SETUP', not in logic.setup().
        // logic.setup() only assigns the ID. We simulated the Action logic in useGameActions.
        // Logic class tests can only verify the initial state return.
    }

    // --- TEST 2: Scoring - Steal Logic (Equal Wins, Chip 0) ---
    {
        console.log("\n🧪 TEST 2: Steal Logic (Equal Wins, Chip 0)");

        let p1 = { ...createPlayer('p1', 'Thief'), character: CharacterType.PHANTOM_THIEF, wins: 3, thiefChipValue: 0 };
        let p2 = { ...createPlayer('p2', 'Partner'), wins: 1 };
        let p3 = { ...createPlayer('p3', 'Victim'), wins: 3, goldCrowns: 1 }; // Equal wins to Thief (3 vs 3)

        // Setup Relationships
        p1.thiefPartnerId = 'p2';
        p1.thiefTargetIds = ['p3'];

        const players = [p1, p2, p3];
        const log = (msg: string) => console.log(`   [LOG] ${msg}`);

        const result = PhantomThiefLogic.resolveSteal(players, log);
        const newThief = result.find(p => p.id === 'p1');
        const newVictim = result.find(p => p.id === 'p3');

        assert(newThief!.goldCrowns === 1, "Thief robó 1 Corona Dorada");
        assert(newVictim!.goldCrowns === 0, "Victim perdió 1 Corona Dorada");
    }

    // --- TEST 3: Steal Logic (Diff 1 Win, Chip 1) ---
    {
        console.log("\n🧪 TEST 3: Steal Logic (Diff 1 Win, Chip 1)");

        // Thief has 2 wins, Victim has 3 (Diff 1). Chip is 1 (±1).
        let p1 = { ...createPlayer('p1', 'Thief'), character: CharacterType.PHANTOM_THIEF, wins: 2, thiefChipValue: 1 };
        let p2 = { ...createPlayer('p2', 'Partner'), wins: 0 };
        let p3 = { ...createPlayer('p3', 'Victim'), wins: 3, blackCrowns: 2 };

        p1.thiefPartnerId = 'p2';
        p1.thiefTargetIds = ['p3'];

        const players = [p1, p2, p3];
        const result = PhantomThiefLogic.resolveSteal(players, () => { });
        const newThief = result.find(p => p.id === 'p1');
        const newVictim = result.find(p => p.id === 'p3');

        assert(newThief!.blackCrowns === 1, "Thief robó 1 Corona Negra");
        assert(newVictim!.blackCrowns === 1, "Victim bajó a 1 Corona Negra");
    }

    // --- TEST 4: Failed Steal (Conditions mismatch) ---
    {
        console.log("\n🧪 TEST 4: Failed Steal (Mismatch)");

        // Thief 2 wins, Victim 4 wins. Diff 2. Chip 1 covers ±1. Fails.
        let p1 = { ...createPlayer('p1', 'Thief'), character: CharacterType.PHANTOM_THIEF, wins: 2, thiefChipValue: 1 };
        let p3 = { ...createPlayer('p3', 'Victim'), wins: 4, score: 50 };

        p1.thiefPartnerId = 'p2';
        p1.thiefTargetIds = ['p3'];

        const players = [p1, p3];
        const result = PhantomThiefLogic.resolveSteal(players, () => { });
        const newVictim = result.find(p => p.id === 'p3');

        assert(newVictim!.score === 50, "Victim conserva sus puntos (Robo falló)");
    }

    // --- TEST 5: Bonus (Partner gets 50pts if Thief wins 2 tricks) ---
    {
        console.log("\n🧪 TEST 5: Partner Bonus");

        let p1 = { ...createPlayer('p1', 'Thief'), character: CharacterType.PHANTOM_THIEF, wins: 2 };
        let p2 = { ...createPlayer('p2', 'Partner'), score: 10 };

        p1.thiefPartnerId = 'p2';

        const players = [p1, p2];
        const result = PhantomThiefLogic.resolveBonus(players, () => { });
        const newPartner = result.find(p => p.id === 'p2');

        assert(newPartner!.score === 60, "Partner recibió +50 puntos (Score 10 -> 60)");
    }

    console.log(`\n🏁 RESULTADOS: ${passed}/${total} Tests Pasados.`);
}

runTests();
