import { Card, CardType, Suit, Player, CharacterType } from '../game/core/types';
import { getValidMoves, determineWinner, determineTournamentWinner, CHARACTER_HIERARCHY } from '../game/core/gameLogic';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ PASÓ: ${message}`);
  }
}

console.log('--- INICIANDO TESTS DE FASE 1: CORE ENGINE ---\n');

// ==========================================
// 1. TESTS DE getValidMoves
// ==========================================
console.log('▶ TEST 1: Reglas de "Must Follow" y Cartas Especiales');

const handWithSuitAndSpecials: Card[] = [
  { id: 'c1', suit: Suit.RED, value: 5, type: CardType.NUMBER },
  { id: 'c2', suit: Suit.BLUE, value: 7, type: CardType.NUMBER },
  { id: 'rare', suit: Suit.COLORLESS, value: 11, type: CardType.RARE },
  { id: 'wf', suit: Suit.COLORLESS, value: 0, type: CardType.WHITE_FLAG }
];

const validMovesWithRed = getValidMoves(handWithSuitAndSpecials, Suit.RED);
assert(validMovesWithRed.some(c => c.id === 'c1'), 'Debe permitir jugar la carta roja del palo líder');
assert(!validMovesWithRed.some(c => c.id === 'c2'), 'Debe bloquear la carta azul que no sigue el palo líder');
assert(validMovesWithRed.some(c => c.id === 'rare'), 'Debe permitir SIEMPRE jugar la Carta Rara aunque se tenga del palo líder');
assert(validMovesWithRed.some(c => c.id === 'wf'), 'Debe permitir SIEMPRE jugar la Bandera Blanca aunque se tenga del palo líder');

const handWithoutLeadSuit: Card[] = [
  { id: 'c2', suit: Suit.BLUE, value: 7, type: CardType.NUMBER },
  { id: 'c3', suit: Suit.GREEN, value: 3, type: CardType.NUMBER }
];
const validMovesWithoutSuit = getValidMoves(handWithoutLeadSuit, Suit.RED);
assert(validMovesWithoutSuit.length === 2, 'Si no se tiene el palo líder, cualquier carta es jugable');

// ==========================================
// 2. TESTS DE determineWinner (Jerarquías y Poder)
// ==========================================
console.log('\n▶ TEST 2: Resolución de Bazas (determineWinner)');

const mockPlayers: Player[] = [
  { id: 'p1', name: 'Jugador 1', character: CharacterType.KING, hand: [], wonCards: [], score: 30, goldCrowns: 0, blackCrowns: 0, wins: 0, items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [] },
  { id: 'p2', name: 'Jugador 2', character: CharacterType.GAMBLER, hand: [], wonCards: [], score: 30, goldCrowns: 0, blackCrowns: 0, wins: 0, items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [] },
  { id: 'p3', name: 'Jugador 3', character: CharacterType.RESISTANCE, hand: [], wonCards: [], score: 30, goldCrowns: 0, blackCrowns: 0, wins: 0, items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [] }
];

// Caso A: Palo líder vs Fuera de palo
const trickLeadVsOffSuit: Card[] = [
  { id: 't1', ownerId: 'p1', suit: Suit.RED, value: 3, type: CardType.NUMBER },
  { id: 't2', ownerId: 'p2', suit: Suit.BLUE, value: 9, type: CardType.NUMBER },
  { id: 't3', ownerId: 'p3', suit: Suit.RED, value: 6, type: CardType.NUMBER }
];
const winnerA = determineWinner(trickLeadVsOffSuit, Suit.RED, false, false, mockPlayers);
assert(winnerA === 'p3', 'Red 6 vence a Red 3 y Blue 9 (no sigue palo)');

// Caso B: Triunfo Negro vence a palo líder
const trickTrumpVsLead: Card[] = [
  { id: 't1', ownerId: 'p1', suit: Suit.RED, value: 9, type: CardType.NUMBER },
  { id: 't2', ownerId: 'p2', suit: Suit.BLACK, value: 2, type: CardType.NUMBER }
];
const winnerB = determineWinner(trickTrumpVsLead, Suit.RED, false, false, mockPlayers);
assert(winnerB === 'p2', 'Black 2 (Triunfo) vence a Red 9 (Palo líder)');

// Caso C: Carta Rara vence a Triunfo Negro
const trickRareVsBlack: Card[] = [
  { id: 't1', ownerId: 'p1', suit: Suit.BLACK, value: 9, type: CardType.NUMBER },
  { id: 't2', ownerId: 'p2', suit: Suit.COLORLESS, value: 11, type: CardType.RARE }
];
const winnerC = determineWinner(trickRareVsBlack, Suit.BLACK, false, false, mockPlayers);
assert(winnerC === 'p2', 'Carta Rara vence a Black 9');

// Caso D: Desempate FIFO (Primera jugada gana)
const trickTieFIFO: Card[] = [
  { id: 't1', ownerId: 'p1', suit: Suit.BLUE, value: 5, type: CardType.NUMBER },
  { id: 't2', ownerId: 'p2', suit: Suit.GREEN, value: 5, type: CardType.NUMBER }
];
const winnerD = determineWinner(trickTieFIFO, Suit.RED, false, false, mockPlayers);
assert(winnerD === 'p1', 'En igualdad de poder fuera de palo, gana la primera jugada (FIFO)');

// Caso E: Dragon Doll (winTies vence desempate)
const trickWinTies: Card[] = [
  { id: 't1', ownerId: 'p1', suit: Suit.BLUE, value: 5, type: CardType.NUMBER },
  { id: 't2', ownerId: 'p2', suit: Suit.GREEN, value: 5, type: CardType.NUMBER, winTies: true }
];
const winnerE = determineWinner(trickWinTies, Suit.RED, false, false, mockPlayers);
assert(winnerE === 'p2', 'Carta con winTies gana empates sobre cartas anteriores');

// Caso F: Revolución / Revolt (El más bajo gana, RGB > Negro)
const trickRevolt: Card[] = [
  { id: 't1', ownerId: 'p1', suit: Suit.BLACK, value: 1, type: CardType.NUMBER },
  { id: 't2', ownerId: 'p2', suit: Suit.RED, value: 8, type: CardType.NUMBER },
  { id: 't3', ownerId: 'p3', suit: Suit.GREEN, value: 2, type: CardType.NUMBER }
];
const winnerF = determineWinner(trickRevolt, Suit.RED, true, true, mockPlayers);
assert(winnerF === 'p3', 'En Revolución, Green 2 vence a Red 8 (más bajo gana) y a Black 1 (Negro es más débil que RGB)');

// ==========================================
// 3. TESTS DE determineTournamentWinner (Jerarquía y Coronas)
// ==========================================
console.log('\n▶ TEST 3: Criterios de Victoria y Desempates Oficiales');

// Caso A: Empate en Victoria Instantánea (ambos con score 999) -> Desempata Jerarquía (King 1A > Gambler 2A)
const playersTieInstant: Player[] = [
  { ...mockPlayers[1], score: 999 }, // Gambler (2A)
  { ...mockPlayers[0], score: 999 }  // King (1A)
];
const resInstant = determineTournamentWinner(playersTieInstant);
assert(resInstant.winner.character === CharacterType.KING, 'King (1A) vence a Gambler (2A) en desempate de victoria instantánea');

// Caso B: 2 Coronas Doradas
const playersGoldCrown: Player[] = [
  { ...mockPlayers[1], goldCrowns: 2 },
  { ...mockPlayers[0], goldCrowns: 1 }
];
const resGold = determineTournamentWinner(playersGoldCrown);
assert(resGold.winner.id === 'p2', 'Jugador con 2 coronas doradas gana la partida');

// Caso C: 3 Coronas Negras
const playersBlackCrown: Player[] = [
  { ...mockPlayers[2], blackCrowns: 3 },
  { ...mockPlayers[0], blackCrowns: 1 }
];
const resBlack = determineTournamentWinner(playersBlackCrown);
assert(resBlack.winner.id === 'p3', 'Jugador con 3 coronas negras gana la partida');

// Caso D: Empate en puntos -> Desempate por jerarquía oficial
const playersTiePoints: Player[] = [
  { ...mockPlayers[2], score: 150 }, // Resistance (3A)
  { ...mockPlayers[1], score: 150 }  // Gambler (2A)
];
const resPoints = determineTournamentWinner(playersTiePoints);
assert(resPoints.winner.character === CharacterType.GAMBLER, 'Gambler (2A) vence a Resistance (3A) por jerarquía en empate a 150 pts');

// ==========================================
// 4. TESTS DE Elegibilidad de Coronas Negras
// ==========================================
console.log('\n▶ TEST 4: Elegibilidad Universal de Coronas Negras');

const isEligibleForBlackCrown = (p: Player): boolean => {
  if (p.character === CharacterType.COLLECTOR) return false;
  if (p.character === CharacterType.NINJA) return p.wins === 2;
  if (p.character === CharacterType.PHANTOM_THIEF) return p.wins === 1;
  if (p.character === CharacterType.RESISTANCE) return p.wins === 0 || (p.wins === 1 && !!p.wonRevolutionTrick);
  return p.wins === 0;
};

const ninjaP: Player = { ...mockPlayers[0], character: CharacterType.NINJA, wins: 2 };
assert(isEligibleForBlackCrown(ninjaP) === true, 'Ninja con 2 victorias ES elegible para corona negra');

const ninjaWrong: Player = { ...mockPlayers[0], character: CharacterType.NINJA, wins: 0 };
assert(isEligibleForBlackCrown(ninjaWrong) === false, 'Ninja con 0 victorias NO es elegible para corona negra (solo con 2)');

const thiefP: Player = { ...mockPlayers[0], character: CharacterType.PHANTOM_THIEF, wins: 1 };
assert(isEligibleForBlackCrown(thiefP) === true, 'Phantom Thief con 1 victoria ES elegible para corona negra');

const resistanceRevP: Player = { ...mockPlayers[0], character: CharacterType.RESISTANCE, wins: 1, wonRevolutionTrick: true };
assert(isEligibleForBlackCrown(resistanceRevP) === true, 'Resistance con 1 victoria en Revolución ES elegible para corona negra');

const collectorP: Player = { ...mockPlayers[0], character: CharacterType.COLLECTOR, wins: 0 };
assert(isEligibleForBlackCrown(collectorP) === false, 'Collector con 0 victorias NUNCA es elegible para corona negra');

const standard0Wins: Player = { ...mockPlayers[0], character: CharacterType.KING, wins: 0 };
assert(isEligibleForBlackCrown(standard0Wins) === true, 'Jugador estándar con 0 victorias ES elegible para corona negra');

console.log('\n🎉 ¡TODOS LOS TESTS DEL CORE ENGINE DE LA FASE 1 HAN PASADO CON ÉXITO!\n');
