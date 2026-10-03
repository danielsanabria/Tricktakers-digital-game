import { Card, CardType, Suit, Player, CharacterType, PowerContext } from '../game/core/types';
import { KingLogic } from '../logic/characters/logic_King';
import { KingScoring } from '../logic/scoring/score_King';
import { GamblerLogic } from '../logic/characters/logic_Gambler';
import { GamblerScoring } from '../logic/scoring/score_Gambler';
import { ResistanceLogic } from '../logic/characters/logic_Resistance';
import { ResistanceScoring } from '../logic/scoring/score_Resistance';
import { HermitLogic } from '../logic/characters/logic_Hermit';
import { HermitScoring } from '../logic/scoring/score_Hermit';
import { BerserkerLogic } from '../logic/characters/logic_Berserker';
import { BerserkerScoring } from '../logic/scoring/score_Berserker';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ PASÓ: ${message}`);
  }
}

const createMockPlayer = (character: CharacterType, id: string = 'p1'): Player => ({
  id,
  name: `Test-${character}`,
  character,
  hand: [],
  wonCards: [],
  score: 30,
  goldCrowns: 0,
  blackCrowns: 0,
  wins: 0,
  items: [],
  tasks: [],
  beasts: [],
  rearBeasts: [],
  mp: 0,
  magicElements: [],
  collectedCards: [],
  timeTravelTokens: 0,
  timeTravelPredictions: []
});

console.log('--- INICIANDO TESTS DE FASE 2: PERSONAJES BÁSICOS (TIER A) ---\n');

// ==========================================
// 1. REY (KING - 1A)
// ==========================================
console.log('▶ TEST 1: Rey (King - 1A)');
const kingScoring = new KingScoring();

// Ronda 1: Puntuación estándar
const kingR1P1 = { ...createMockPlayer(CharacterType.KING), wins: 2 };
const resKingR1 = kingScoring.getScore(kingR1P1, 1, [kingR1P1]);
assert(resKingR1.score === 50, 'King R1 con 2 victorias debe dar 50 pts');

// Ronda 3: Duplica puntos por victorias
const kingR3P1 = { ...createMockPlayer(CharacterType.KING), wins: 2 };
const resKingR3 = kingScoring.getScore(kingR3P1, 3, [kingR3P1]);
assert(resKingR3.score === 100, 'King R3 con 2 victorias debe duplicar puntos (50 x 2 = 100 pts)');

const kingR3Wins4 = { ...createMockPlayer(CharacterType.KING), wins: 4 };
const resKingR3Wins4 = kingScoring.getScore(kingR3Wins4, 3, [kingR3Wins4]);
assert(resKingR3Wins4.score === 240, 'King R3 con 4 victorias debe duplicar puntos (120 x 2 = 240 pts)');

// Victoria Instantánea con 5 bazas
const kingWins5 = { ...createMockPlayer(CharacterType.KING), wins: 5 };
const resKingWins5 = kingScoring.getScore(kingWins5, 3, [kingWins5]);
assert(resKingWins5.isInstantWin === true && resKingWins5.score === 999, 'King con 5 victorias es Victoria Instantánea (Score: 999)');

// ==========================================
// 2. TAHÚR (GAMBLER - 2A)
// ==========================================
console.log('\n▶ TEST 2: Tahúr (Gambler - 2A)');
const gamblerScoring = new GamblerScoring();

// Acierto de puja 2 con 2 bazas ganadas y apuesta de 30 pts
const gamblerHit = { ...createMockPlayer(CharacterType.GAMBLER), bid: 2, wins: 2, betAmount: 30 };
const resGamblerHit = gamblerScoring.getScore(gamblerHit, 1, [gamblerHit]);
assert(resGamblerHit.score === 120, 'Gambler acierta puja 2 (+90 pts) y gana apuesta (+30 pts) = 120 pts');

// Fallo de puja: puja 2 pero gana 1 baza (apuesta 30 pts)
const gamblerMiss = { ...createMockPlayer(CharacterType.GAMBLER), bid: 2, wins: 1, betAmount: 30 };
const resGamblerMiss = gamblerScoring.getScore(gamblerMiss, 1, [gamblerMiss]);
assert(resGamblerMiss.score === -30, 'Gambler falla puja: 0 pts de tabla y pierde apuesta (-30 pts)');

// Victoria Instantánea con puja 4 y 4 victorias
const gamblerBid4 = { ...createMockPlayer(CharacterType.GAMBLER), bid: 4, wins: 4, betAmount: 50 };
const resGamblerBid4 = gamblerScoring.getScore(gamblerBid4, 1, [gamblerBid4]);
assert(resGamblerBid4.isInstantWin === true && resGamblerBid4.score === 999, 'Gambler acierta puja 4 = Victoria Instantánea');

// Victoria Instantánea con 5 victorias
const gamblerWins5 = { ...createMockPlayer(CharacterType.GAMBLER), bid: 1, wins: 5 };
const resGamblerWins5 = gamblerScoring.getScore(gamblerWins5, 1, [gamblerWins5]);
assert(resGamblerWins5.isInstantWin === true && resGamblerWins5.score === 999, 'Gambler con 5 victorias = Victoria Instantánea');

// ==========================================
// 3. LA RESISTENCIA (RESISTANCE - 3A)
// ==========================================
console.log('\n▶ TEST 3: La Resistencia (Resistance - 3A)');
const resistanceScoring = new ResistanceScoring();

// Victoria en Revolución con Bandera Blanca (+30 pts)
const resWF = {
  ...createMockPlayer(CharacterType.RESISTANCE),
  wins: 1,
  wonRevolutionTrick: true,
  revoltWinningCard: { id: 'wf', suit: Suit.COLORLESS, value: 0, type: CardType.WHITE_FLAG }
};
assert(resistanceScoring.getScore(resWF, 1, [resWF]).score === 30, 'Revolución ganada con Bandera Blanca = +30 pts');

// Victoria en Revolución con carta 1-3 RGB (+50 pts)
const resLow = {
  ...createMockPlayer(CharacterType.RESISTANCE),
  wins: 1,
  wonRevolutionTrick: true,
  revoltWinningCard: { id: 'r2', suit: Suit.RED, value: 2, type: CardType.NUMBER }
};
assert(resistanceScoring.getScore(resLow, 1, [resLow]).score === 50, 'Revolución ganada con Red 2 = +50 pts');

// Victoria en Revolución con carta 7-9 RGB (+100 pts)
const resHigh = {
  ...createMockPlayer(CharacterType.RESISTANCE),
  wins: 1,
  wonRevolutionTrick: true,
  revoltWinningCard: { id: 'b8', suit: Suit.BLUE, value: 8, type: CardType.NUMBER }
};
assert(resistanceScoring.getScore(resHigh, 1, [resHigh]).score === 100, 'Revolución ganada con Blue 8 = +100 pts');

// Victoria en Revolución con Carta Negra = Victoria Instantánea
const resBlack = {
  ...createMockPlayer(CharacterType.RESISTANCE),
  wins: 1,
  wonRevolutionTrick: true,
  revoltWinningCard: { id: 'k1', suit: Suit.BLACK, value: 1, type: CardType.NUMBER }
};
const resBlackScore = resistanceScoring.getScore(resBlack, 1, [resBlack]);
assert(resBlackScore.isInstantWin === true && resBlackScore.score === 999, 'Revolución ganada con Carta Negra = Victoria Instantánea');

// Ronda 3 (Battle Ready): +30 pts por cada baza ganada
const resR3 = { ...createMockPlayer(CharacterType.RESISTANCE), wins: 3, wonRevolutionTrick: false };
assert(resistanceScoring.getScore(resR3, 3, [resR3]).score === 90, 'Resistance R3 con 3 victorias gana +90 pts (3 x 30 pts)');

// Bazas normales en R1/R2 = 0 pts
const resNormal = { ...createMockPlayer(CharacterType.RESISTANCE), wins: 2, wonRevolutionTrick: false };
assert(resistanceScoring.getScore(resNormal, 1, [resNormal]).score === 0, 'Resistance bazas convencionales en R1 dan 0 pts');

// ==========================================
// 4. ERMITAÑO (HERMIT - 4A)
// ==========================================
console.log('\n▶ TEST 4: Ermitaño (Hermit - 4A)');
const hermitLogic = new HermitLogic();
const hermitScoring = new HermitScoring();

// Sage's Wisdom: White Flag vence a Rara (Poder 5000)
const hermitPlayer = createMockPlayer(CharacterType.HERMIT);
const powerWF = hermitLogic.getCardPower({
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
  player: hermitPlayer
});
assert(powerWF === 5000, 'Bandera Blanca del Ermitaño contra Rara tiene poder 5000');

// Puntuación del Ermitaño
assert(hermitScoring.getScore({ ...hermitPlayer, wins: 0 }, 1, []).score === 50, 'Hermit 0 victorias = +50 pts');
assert(hermitScoring.getScore({ ...hermitPlayer, wins: 1 }, 1, []).score === -10, 'Hermit 1 victoria = -10 pts');
assert(hermitScoring.getScore({ ...hermitPlayer, wins: 2 }, 1, []).score === -30, 'Hermit 2 victorias = -30 pts');
assert(hermitScoring.getScore({ ...hermitPlayer, wins: 3 }, 1, []).score === 70, 'Hermit 3 victorias = +70 pts');
assert(hermitScoring.getScore({ ...hermitPlayer, wins: 4 }, 1, []).score === 100, 'Hermit 4 victorias = +100 pts');
assert(hermitScoring.getScore({ ...hermitPlayer, wins: 5 }, 1, []).isInstantWin === true, 'Hermit 5 victorias = Victoria Instantánea');

// ==========================================
// 5. BERSERKER (5A)
// ==========================================
console.log('\n▶ TEST 5: Berserker (5A)');
const berserkerLogic = new BerserkerLogic();
const berserkerScoring = new BerserkerScoring();
const berserkerPlayer = createMockPlayer(CharacterType.BERSERKER);

// Poder de Carta Principal Berserker vs Revolución
const powerBerserkerNormal = berserkerLogic.getCardPower({
  card: { id: 'berserker-main-p1', suit: Suit.COLORLESS, value: 12, type: CardType.RARE },
  leadSuit: null,
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
  player: berserkerPlayer
});
assert(powerBerserkerNormal === 3000, 'Carta Berserker normal tiene poder 3000');

const powerBerserkerRevolt = berserkerLogic.getCardPower({
  card: { id: 'berserker-main-p1', suit: Suit.COLORLESS, value: 12, type: CardType.RARE },
  leadSuit: null,
  isRevolt: true,
  isKakumei: true,
  trickContainsRare: false,
  onesInSuits: [],
  tensInSuits: [],
  berserker10Suits: [],
  berserkerMainInPlay: true,
  whiteFlagInPlay: false,
  hermitInPlay: false,
  berserkerInPlay: true,
  player: berserkerPlayer
});
assert(powerBerserkerRevolt === 4000, 'Carta Berserker en Revolución es la más débil (poder 4000 en menor-gana)');

// Puntuación: 0 victorias en Ronda 1 vs Ronda 3
const berserkerR10Wins = berserkerScoring.getScore({ ...berserkerPlayer, wins: 0 }, 1, []);
assert(berserkerR10Wins.score === -30 && berserkerR10Wins.isInstantWin === false, 'Berserker con 0 victorias en Ronda 1 debe restar -30 pts (NO ganar)');

const berserkerR20Wins = berserkerScoring.getScore({ ...berserkerPlayer, wins: 0 }, 2, []);
assert(berserkerR20Wins.score === -30 && berserkerR20Wins.isInstantWin === false, 'Berserker con 0 victorias en Ronda 2 debe restar -30 pts (NO ganar)');

const berserkerR30Wins = berserkerScoring.getScore({ ...berserkerPlayer, wins: 0 }, 3, []);
assert(berserkerR30Wins.isInstantWin === true && berserkerR30Wins.score === 999, 'Berserker con 0 victorias en Ronda 3 ES VICTORIA INSTANTÁNEA');

// Penalización por 5 victorias
const berserker5Wins = berserkerScoring.getScore({ ...berserkerPlayer, wins: 5 }, 1, []);
assert(berserker5Wins.score === -50, 'Berserker con 5 victorias recibe penalización de -50 pts');

console.log('\n🎉 ¡TODOS LOS TESTS DE PERSONAJES BÁSICOS (TIER A) DE LA FASE 2 HAN PASADO CON ÉXITO!\n');
