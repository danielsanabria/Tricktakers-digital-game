
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, CardType, Suit, UIContext, Card } from '../../game/core/types';

export class KingLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    const { deck, playerId } = context;

    // Manual Rule: "Start with King Rare card... then discard to keep hand limit"
    // Implementation: Deal 5 standard cards + 1 Rare Card = 6 Cards.
    // The UI will force a discard before the first trick.

    // 1. Create the King's Rare
    const rareCard = {
      id: `king-rare-${playerId}-${Date.now()}`,
      suit: Suit.COLORLESS,
      value: 11,
      type: CardType.RARE,
      ownerId: playerId
    };

    // 2. Draw 5 random cards from the deck
    const hand = deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));

    // 3. Add Rare to hand (Total 6)
    hand.push(rareCard);

    return {
      hand,
      beasts: [],
      mp: 0
    };
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, player, selectedCards, performAction, abilityMode, setAbilityMode } = context;

    if (!isCurrentPlayer) return null;

    // Setup Phase Discard Logic
    // If King has more than 5 cards, they MUST discard one before playing.
    if (player.hand.length > 5) {
      const isSelected = selectedCards.length === 1;

      return (
        React.createElement("div", { className: "flex flex-col items-center gap-2 bg-amber-50 p-3 rounded-xl border-2 border-amber-400 shadow-lg animate-pulse" },
          React.createElement("span", { className: "font-black text-amber-600 text-sm uppercase" }, "👑 Preparación Real: Descarta 1 carta"),

          isSelected ? (
            React.createElement("button", {
              onClick: () => performAction('KING_DISCARD'),
              className: "btn bg-amber-600 text-white w-full shadow-lg"
            }, "CONFIRMAR DESCARTE")
          ) : (
            React.createElement("span", { className: "text-xs text-amber-800" }, "Selecciona una carta para descartar")
          )
        )
      );
    }

    return null;
  }
  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    // King Instant Win Condition: 5 Wins
    // Note: player.wins is the count BEFORE this trick. So we check if wins + 1 >= 5.
    if (player.wins + 1 >= 5) {
      return { score: 999 }; // Trigger Instant Win (Priority 1)
    }
    return {};
  }
}
