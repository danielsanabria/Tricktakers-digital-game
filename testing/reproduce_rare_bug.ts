
import { determineWinner } from '../game/core/gameLogic';
import { Card, CardType, Suit, Player, CharacterType } from '../game/core/types';
import { BerserkerLogic } from '../logic/characters/logic_Berserker';

const createPlayer = (id: string, character: CharacterType): Player => ({
    id,
    name: id,
    character,
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
    timeTravelPredictions: []
});

const runTest = () => {
    console.log("=== Reproducing RARE vs Berserker 10 Bug ===");

    // Players
    const p1 = createPlayer('BeserkerUser', CharacterType.BERSERKER);
    const p2 = createPlayer('HermitRival', CharacterType.HERMIT);
    const p3 = createPlayer('KingRival', CharacterType.KING);
    const players = [p1, p2, p3];

    // Cards
    // User (Berserker) plays GREEN 10
    const cardBerserker = {
        id: 'berserker-10-GREEN-user', // Important: ID format matters for BerserkerLogic
        suit: Suit.GREEN,
        value: 10,
        type: CardType.NUMBER,
        ownerId: p1.id
    };

    // Rival 1 (Hermit) plays BLACK 9
    const cardHermit = {
        id: 'card-BLACK-9',
        suit: Suit.BLACK,
        value: 9,
        type: CardType.NUMBER,
        ownerId: p2.id
    };

    // Rival 2 (King) plays RARE
    const cardKing = {
        id: 'king-rare-rival',
        suit: Suit.COLORLESS,
        value: 11,
        type: CardType.RARE,
        ownerId: p3.id
    };

    // Trick Play Order: Berserker -> Hermit -> King
    // Lead Suit: GREEN (from Berserker)
    const playedCards = [cardBerserker, cardHermit, cardKing];
    const leadSuit = Suit.GREEN;

    // Check Powers individually to debug
    const logicBerserker = new BerserkerLogic();
    // Quick mock of context for power calc
    const contextBase = {
        leadSuit,
        isRevolt: false,
        isKakumei: false,
        onesInSuits: [],
        berserker10Suits: [Suit.GREEN],
        berserkerMainInPlay: false,
        whiteFlagInPlay: false,
        hermitInPlay: true,
        berserkerInPlay: true,
        trickContainsRare: true
    };

    const powerBerserker = logicBerserker.getCardPower({ ...contextBase, card: cardBerserker, player: p1 });
    console.log(`Berserker 10 Power: ${powerBerserker}`);
    // Expected bug: 3000+

    // King Power (approx via manual calc logic or we can Instantiate KingLogic)
    // RARE base is 2000.
    console.log(`King RARE Power (Base): 2000`);

    const winnerId = determineWinner(playedCards, leadSuit, false, false, players);
    console.log(`Winner ID: ${winnerId}`);

    if (winnerId === p3.id) {
        console.log("PASS: King won with RARE.");
    } else if (winnerId === p1.id) {
        console.log("FAIL: Berserker won with 10.");
    } else {
        console.log(`FAIL: Unexpected winner ${winnerId}`);
    }
};

runTest();
