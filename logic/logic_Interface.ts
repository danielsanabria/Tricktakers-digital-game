import { Player, Card, SetupContext, PowerContext, UIContext, CardType, Suit } from '../game/core/types';
import React from 'react';

export interface ICharacterLogic {
  /**
   * Called at the start of a round. 
   * Returns properties to update on the player (e.g. hand, mp, beasts).
   */
  setup(context: SetupContext): Partial<Player>;

  /**
   * Calculates the power of a played card.
   * Returns modified power value.
   */
  getCardPower(context: PowerContext): number;

  /**
   * Optional: Renders specific UI controls for the character (Action Bar).
   */
  renderActions?(context: UIContext): React.ReactNode;

  /**
   * Optional: Handle logic when a trick is won (e.g., Summoner gaining MP).
   */
  onTrickWon?(player: Player, cards: Card[], round: number): Partial<Player>;
}

export class BaseCharacterLogic implements ICharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    const { deck, playerId } = context;
    const hand = deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));
    return { hand, beasts: [], mp: 0, items: [], tasks: [] };
  }

  getCardPower(context: PowerContext): number {
    const { card, leadSuit } = context;
    let power = card.value;

    // Explicit Hierarchy:
    // 1. Rare (2000)
    // 2. Black (1000 + value)
    // 3. Lead Suit (500 + value)
    // 4. Follow Suit (Value)
    // 5. White Flag (0)

    if (card.type === CardType.RARE) {
      power = 2000;
    } else if (card.type === CardType.WHITE_FLAG) {
      power = 0;
    } else {
      // Suit Bonuses for Number cards
      if (card.suit === Suit.BLACK) {
        // In Kakumei, Black cards are the weakest, so they get a huge penalty to win in "Lowest Wins" mode.
        power += context.isKakumei ? -1000 : 1000;
      } else if (leadSuit && card.suit === leadSuit && !context.isKakumei && !context.isRevolt) {
        // User Feedback: "Invalidez del Palo Líder: En modo Rebelión, no existe la ventaja por palo líder"
        power += 500;
      }
    }

    return power;
  }
}