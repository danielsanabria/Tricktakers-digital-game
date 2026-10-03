import { Suit, CardType, Card, Player, CharacterType, PowerContext } from './types';
import { getCharacterLogic } from '../../logic/logic_Registry';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const suits = [Suit.RED, Suit.BLUE, Suit.GREEN, Suit.BLACK];

  suits.forEach(suit => {
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `card-${suit}-${i}`, suit, value: i, type: CardType.NUMBER });
    }
  });

  deck.push({ id: 'rare-1', suit: Suit.COLORLESS, value: 11, type: CardType.RARE });
  deck.push({ id: 'rare-2', suit: Suit.COLORLESS, value: 11, type: CardType.RARE });
  deck.push({ id: 'whiteflag-1', suit: Suit.COLORLESS, value: 0, type: CardType.WHITE_FLAG });
  deck.push({ id: 'whiteflag-2', suit: Suit.COLORLESS, value: 0, type: CardType.WHITE_FLAG });

  return deck.sort(() => Math.random() - 0.5);
};

export const getValidMoves = (hand: Card[], leadSuit: Suit | null): Card[] => {
  if (hand.length === 0) return [];
  if (!leadSuit) return hand;

  // Rule: Must Follow
  // En Tricktakers, si tienes cartas del palo líder debes jugarlo,
  // A NO SER que juegues una carta Rara o Bandera Blanca (independientes del palo).
  const followSuitCards = hand.filter(c => c.suit === leadSuit);
  const specialAlwaysPlayable = hand.filter(c => c.type === CardType.RARE || c.type === CardType.WHITE_FLAG);

  if (followSuitCards.length > 0) {
    // Es legal jugar del palo líder o cualquier carta especial (Rara / Bandera Blanca)
    const validMoves = [...followSuitCards];
    for (const special of specialAlwaysPlayable) {
      if (!validMoves.some(m => m.id === special.id)) {
        validMoves.push(special);
      }
    }
    return validMoves;
  }

  return hand;
};




export const determineWinner = (
  playedCards: Card[],
  leadSuit: Suit | null,
  isRevolt: boolean,
  isKakumei: boolean,
  players: Player[],
  miriaPassive?: boolean
): string => {
  if (playedCards.length === 0) return '';

  // Global Context Flags
  const trickContainsRare = playedCards.some(c => c.type === CardType.RARE);
  const onesInSuits = playedCards.filter(c => c.value === 1).map(c => c.suit);
  const tensInSuits = playedCards.filter(c => c.value === 10).map(c => c.suit);
  const berserker10Suits = playedCards
    .filter(c => c.id.startsWith('berserker-10-'))
    .map(c => c.suit);
  const berserkerMainInPlay = playedCards.some(c => c.id.startsWith('berserker-main-'));

  const whiteFlagInPlay = playedCards.some(c => c.type === CardType.WHITE_FLAG);
  const hermitInPlay = players.some(p => p.character === CharacterType.HERMIT);
  const berserkerInPlay = players.some(p => p.character === CharacterType.BERSERKER);

  // Helper to get raw strength
  const getStrength = (card: Card): number => {
    const player = players.find(p => p.id === card.ownerId);
    if (!player) return 0;

    const logic = getCharacterLogic(player.character);
    const context: PowerContext = {
      card,
      leadSuit,
      isRevolt,
      isKakumei,
      onesInSuits: miriaPassive ? [] : onesInSuits,
      tensInSuits: miriaPassive ? [] : tensInSuits,
      berserker10Suits: miriaPassive ? [] : berserker10Suits,
      berserkerMainInPlay: miriaPassive ? false : berserkerMainInPlay,
      trickContainsRare,
      whiteFlagInPlay,
      hermitInPlay,
      berserkerInPlay,
      player
    };

    return logic.getCardPower(context);
  };

  let winnerCard = playedCards[0];
  let bestPower = getStrength(winnerCard);

  // KERNEL: Iterate and Compare
  for (let i = 1; i < playedCards.length; i++) {
    const card = playedCards[i];
    const power = getStrength(card);

    if (!(isKakumei || isRevolt)) {
      // Normal: Higher wins.
      // Tie-breaker: Usually First Played (FIFO).
      // "Win Ties" effect: Allows Late Player to win on equality.
      if (power > bestPower || (power === bestPower && card.winTies)) {
        bestPower = power;
        winnerCard = card;
      }
    } else {
      // Revolution: Lower wins.
      // If power < bestPower -> Win.
      // Tie? If power === bestPower && card.winTies -> Win.
      if (power < bestPower || (power === bestPower && card.winTies)) {
        bestPower = power;
        winnerCard = card;
      }
    }
  }

  return winnerCard.ownerId || '';
};

export const getAiMove = (
  player: Player,
  leadSuit: Suit | null,
  playedCards: Card[]
): string => {
  const validMoves = getValidMoves(player.hand, leadSuit);
  if (validMoves.length === 0) return '';

  // Random for now to keep it unpredictable as requested
  return validMoves[Math.floor(Math.random() * validMoves.length)].id;
};

export interface TournamentResult {
  winner: Player;
  reason: string;
}

export const CHARACTER_HIERARCHY: CharacterType[] = [
  CharacterType.KING,          // 1A
  CharacterType.STRATEGIST,    // 1C
  CharacterType.GAMBLER,       // 2A
  CharacterType.SUMMONER,      // 2C
  CharacterType.NINJA,         // 2D
  CharacterType.RESISTANCE,    // 3A
  CharacterType.ADVENTURER,    // 3B
  CharacterType.ALCHEMIST,     // 3C
  CharacterType.SAMURAI,       // 3D
  CharacterType.HERMIT,        // 4A
  CharacterType.COLLECTOR,     // 4B
  CharacterType.TIME_TRAVELER, // 4C
  CharacterType.BERSERKER,     // 5A
  CharacterType.RULER,         // 5B
  CharacterType.PHANTOM_THIEF  // 5C
];

export const compareByHierarchy = (a: Player, b: Player): number => {
  const idxA = a.character ? CHARACTER_HIERARCHY.indexOf(a.character) : 999;
  const idxB = b.character ? CHARACTER_HIERARCHY.indexOf(b.character) : 999;
  return idxA - idxB;
};

export const determineTournamentWinner = (players: Player[]): TournamentResult => {
  // Prioridad 1: Victoria Instantánea de Personaje (Score >= 900)
  const instants = players.filter(p => p.score >= 900);
  if (instants.length > 0) {
    instants.sort(compareByHierarchy);
    return { winner: instants[0], reason: `¡Victoria Instantánea por Personaje! (${instants[0].name})` };
  }

  // Prioridad 1.5: Victoria Especial de Tiranía del Gobernante (2+ victorias sin cartas de color)
  const ruler = players.find(p => p.character === CharacterType.RULER);
  if (ruler && ruler.wins >= 2) {
    const hasColor = ruler.wonCards.some(c => c.suit === Suit.RED || c.suit === Suit.BLUE || c.suit === Suit.GREEN);
    if (!hasColor) {
      return { winner: ruler, reason: 'Tiranía Absoluta (2+ victorias sin cartas de color)' };
    }
  }

  // Prioridad 2: Maestro de Coronas Doradas (2 Coronas Doradas)
  const goldWinners = players.filter(p => p.goldCrowns >= 2);
  if (goldWinners.length > 0) {
    goldWinners.sort(compareByHierarchy);
    return { winner: goldWinners[0], reason: 'Maestro de Coronas Doradas (2)' };
  }

  // Prioridad 3: Rey de la Miseria (3 Coronas Negras)
  const blackWinners = players.filter(p => p.blackCrowns >= 3);
  if (blackWinners.length > 0) {
    blackWinners.sort(compareByHierarchy);
    return { winner: blackWinners[0], reason: 'Rey de la Miseria (3 Coronas Negras)' };
  }

  // Prioridad 4: Mayor Puntuación con Desempate por Jerarquía Oficial
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return compareByHierarchy(a, b);
  });

  return { winner: sorted[0], reason: 'Victoria por Puntuación (y Jerarquía Oficial)' };
};
