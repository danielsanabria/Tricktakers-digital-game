import { BaseCharacterLogic } from '../logic_Interface';
import { PowerContext, Suit, SetupContext, Player, Card } from '../../game/core/types';

export class SamuraiLogic extends BaseCharacterLogic {

  setup(context: SetupContext): Partial<Player> {
    const { playerId, deck, hand: providedHand } = context;

    // Use dealt hand or draw if not provided
    let hand = providedHand || deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));

    // Rule: Samurai cannot have black cards.
    // Filter and redraw until no black cards.
    let hasBlack = hand.some(c => c.suit === Suit.BLACK);
    while (hasBlack) {
      const blackCount = hand.filter(c => c.suit === Suit.BLACK).length;
      hand = hand.filter(c => c.suit !== Suit.BLACK);
      // Construct replacement cards from deck
      const redrawn = deck.splice(0, blackCount).map(c => ({ ...c, ownerId: playerId }));
      hand = [...hand, ...redrawn];
      hasBlack = hand.some(c => c.suit === Suit.BLACK);
    }

    return { hand };
  }

  getCardPower(context: PowerContext): number {
    const { card, leadSuit, whiteFlagInPlay, isKakumei } = context;

    let effectiveSuit = card.suit;

    // Spirit of Red: Red cards treated as Black
    // Nullified by White Flag or Revolution
    if (effectiveSuit === Suit.RED && !whiteFlagInPlay && !isKakumei) {
      effectiveSuit = Suit.BLACK;
    }

    // Calculate Power
    let power = card.value;

    // Kakumei Logic
    if ((context.isRevolt || context.isKakumei) && card.type === 'NUMBER' && card.value >= 1 && card.value <= 9) {
      power = 10 - card.value;
    }

    if (effectiveSuit === Suit.BLACK) power += 1000;
    else if (leadSuit && effectiveSuit === leadSuit) power += 500;

    // Weakness Logic (simplified inheritance)
    if (context.onesInSuits.length > 0 && !isKakumei && card.value === 10) power = 1;

    return power;
  }

  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    // Exactly 4 wins = Instant Win
    if (player.wins === 4) {
      return { score: 999 };
    }
    return {};
  }
}
