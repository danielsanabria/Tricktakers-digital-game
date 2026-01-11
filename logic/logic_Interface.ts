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

    // 5. White Flag / Face Down (0)

    if (card.isFacedown) {
      return 0;
    }

    if (card.type === CardType.RARE) {
      power = 2000;
    } else if (card.type === CardType.WHITE_FLAG) {
      // White Flag Logic: Weakest (0) normally, but Strongest if Rare is in play.
      if (context.trickContainsRare) {
        power = 3000; // Beats Rare (2000) and everything else.
      } else {
        power = 0;
      }
    } else {
      // Suit Bonuses for Number cards
      if (card.suit === Suit.BLACK) {
        // Black is always high power (Trump). 
        // In Normal Mode (Highest Wins), this makes it win.
        // In Kakumei/Revolt (Lowest Wins), this makes it lose (Colores > Negro).
        power += 1000;
      } else if (leadSuit && card.suit === leadSuit && !(context.isKakumei || context.isRevolt)) {
        // User Feedback: "Invalidez del Palo Líder: En modo Rebelión, no existe la ventaja por palo líder"
        power += 500;
      }

      // Rule of 1 vs 10: Only if Berserker is in play
      if (context.berserkerInPlay) {
        // 1 beats 10 of same suit
        if (card.value === 1 && context.tensInSuits.includes(card.suit)) {
          if (context.isKakumei || context.isRevolt) {
            power += 10.1 - 1; // 1 -> 10.1 (stronger than 10 but loses to 2-9 in Revolution)
          }
          // Standard: stay power 1.
        }
        if (card.value === 10 && context.onesInSuits.includes(card.suit)) {
          if (context.isKakumei || context.isRevolt) {
            power += 10.2 - 10; // 10 -> 10.2 (weaker than 10.1)
          } else {
            power = -1; // Standard: nerf to bottom so 2 beats both 1 and 10.
          }
        }

        // 1 beats Berserker Main Card
        if (card.value === 1 && context.berserkerMainInPlay) {
          if (!(context.isKakumei || context.isRevolt)) {
            power = 3001; // Standard: 1 wins.
          }
          // Revolution: power stays 1. 1 wins naturally (1 < 3000).
        }
      }
    }

    return power;
  }
}