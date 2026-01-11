
import { Card, CardType, Suit, Player, GamePhase, GameState } from '../game/core/types';

// Mock State
let players: Player[] = [
    {
        id: 'p1', name: 'Collector', character: 'COLLECTOR', hand: [
            { id: 'c1', suit: Suit.RED, value: 5, type: CardType.NUMBER, ownerId: 'p1', name: 'Red 5' },
            { id: 'c2', suit: Suit.BLUE, value: 3, type: CardType.NUMBER, ownerId: 'p1', name: 'Blue 3' }
        ],
        wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0, items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [], collectedCards: [],
        reservedCardId: null
    },
    { id: 'p2', name: 'Rival 1', character: 'WARRIOR', hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0, items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [], collectedCards: [] },
    { id: 'p3', name: 'Rival 2', character: 'MAGE', hand: [], wonCards: [], score: 0, goldCrowns: 0, blackCrowns: 0, wins: 0, items: [], tasks: [], mp: 0, beasts: [], rearBeasts: [], magicElements: [], collectedCards: [] }
];

let abilityMode = 'COLLECTOR_RESERVE'; // Assessing we entered this mode
let selectedCards = ['c1']; // User selected Red 5
let logs: string[] = [];

function addLog(msg: string) { logs.push(msg); }

// Simulate action handler from useGameActions.ts
function performAction(actionName: string, payload?: any) {
    if (actionName === 'COLLECTOR_RESERVE_CONFIRM') {
        if (selectedCards.length !== 1) return;
        const cardId = selectedCards[0];
        players = players.map(p => p.id === 'p1' ? { ...p, reservedCardId: cardId } : p);
        selectedCards = [];
        abilityMode = 'NONE';
        addLog(`Coleccionista ha reservado una carta de la mesa.`);
    }
}

// EXECUTION
console.log("Initial State:", players[0].reservedCardId, abilityMode);

performAction('COLLECTOR_RESERVE_CONFIRM');

console.log("After Reserve:", players[0].reservedCardId, abilityMode);

if (players[0].reservedCardId === 'c1' && abilityMode === 'NONE') {
    console.log("✅ Reserve Successful. Mode reset to NONE.");
} else {
    console.error("❌ Reserve Failed.");
}

// CRITICAL: Does the game allow playing now?
// If abilityMode is 'NONE', standard play controls should appear.
// The blocking might be because 'selectedCards' was cleared?
// Or maybe the 'Review' of the logic shows the Reserve Button is confusingly placed?
