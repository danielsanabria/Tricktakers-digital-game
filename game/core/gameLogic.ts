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
  // Characters like Ruler (5B) might ignore this, but that logic is handled inside player interaction or penalty checks.
  // The engine enforces valid moves for UI highlighting.
  const followSuitCards = hand.filter(c => c.suit === leadSuit);

  // Colorless cards (Rare, White Flag, Berserker Rare) generally don't follow suit rules strictly 
  // in terms of "matching color", but usually can be played. 
  // In Tricktakers, Rare/WhiteFlag are Colorless. 
  // If you have Lead Suit, you MUST play Lead Suit. 
  // If you don't, you can play anything (including Colorless).
  // EXCEPTION: Can you play Rare/WhiteFlag even if you have the suit?
  // Manual implies: "If you have the suit, you must play it." 
  // Rare cards usually transcend this or are played when you can't follow.
  // Standard Trick-taking: Must follow if possible.

  if (followSuitCards.length > 0) {
    // Logic refinement: Can I play a Rare if I have the suit?
    // Usually no, unless the card explicitly says so. 
    // We will enforce strict Must Follow for the base engine.
    return followSuitCards;
  }

  return hand;
};

export const calculateAlchemyValue = (cards: Card[]): { value: number, isStrong: boolean, elements: string[] } => {
  const sum = cards.reduce((acc, c) => acc + (c.type === CardType.RARE ? 11 : (c.type === CardType.WHITE_FLAG ? 0 : c.value)), 0);
  const lastDigit = sum % 10;
  const value = (sum === 10) ? 10 : lastDigit;

  const elements: string[] = [];
  if (cards.length === 3) {
    // 3 of a kind
    const uniqValues = new Set(cards.filter(c => c.type === CardType.NUMBER).map(c => c.value));
    if (uniqValues.size === 1) elements.push('3_OF_A_KIND');

    // Flush
    const uniqSuits = new Set(cards.filter(c => c.suit !== Suit.COLORLESS).map(c => c.suit));
    if (uniqSuits.size === 1) elements.push('FLUSH');

    // Straight
    const vals = cards.filter(c => c.type === CardType.NUMBER).map(c => c.value).sort((a, b) => a - b);
    if (vals.length === 3 && vals[2] === vals[1] + 1 && vals[1] === vals[0] + 1) {
      elements.push('STRAIGHT');
    }
  }

  return { value, isStrong: value === 10, elements };
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
      if (power > bestPower) {
        bestPower = power;
        winnerCard = card;
      }
    } else {
      if (power < bestPower) {
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

export const determineTournamentWinner = (players: Player[]): TournamentResult => {
  // Priority 1: Instant Win (Score >= 900) - e.g. King with 5 wins
  const instant = players.find(p => p.score >= 900);
  if (instant) return { winner: instant, reason: '¡Victoria Instantánea!' };

  // Priority 2: 2 Gold Crowns
  const gold = players.find(p => p.goldCrowns >= 2);
  if (gold) return { winner: gold, reason: 'Maestro de Coronas Doradas (2)' };

  // Priority 3: 3 Black Crowns
  const black = players.find(p => p.blackCrowns >= 3);
  if (black) return { winner: black, reason: 'Rey de la Miseria (3 Coronas Negras)' };

  // Priority 4: Max Score with Tie-Breaker (Hierarchy)
  const hierarchy = [
    CharacterType.KING,
    CharacterType.GAMBLER,
    CharacterType.RESISTANCE,
    CharacterType.ADVENTURER,
    CharacterType.HERMIT,
    CharacterType.COLLECTOR,
    CharacterType.BERSERKER,
    CharacterType.RULER,
    CharacterType.STRATEGIST,
    CharacterType.SUMMONER,
    CharacterType.PHANTOM_THIEF,
    CharacterType.TIME_TRAVELER
  ];

  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tie-breaker
    const idxA = hierarchy.indexOf(a.character!);
    const idxB = hierarchy.indexOf(b.character!);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  // Priority 1.5: Ruler Special Win (2+ Wins, No Color Cards)
  // Tyranny check (Ruler) - Placed here to override score if present?
  // Original code checked it after score but "Priority 1.5" implies it's high.
  // Let's check it before Score.
  const ruler = players.find(p => p.character === CharacterType.RULER);
  if (ruler && ruler.wins >= 2) {
    const hasColor = ruler.wonCards.some(c => c.suit !== Suit.COLORLESS);
    if (!hasColor) {
      return { winner: ruler, reason: 'Tiranía Absoluta (2+ victorias sin cartas de color)' };
    }
  }

  return { winner: sorted[0], reason: 'Victoria por Puntuación (y Jerarquía)' };
};
