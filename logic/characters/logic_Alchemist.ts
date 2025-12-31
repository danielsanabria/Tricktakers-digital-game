import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, Card, CardType, UIContext } from '../../game/core/types';

export class AlchemistLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    const { playerId, deck } = context;
    // Use the provided deck instead of creating a new one
    // But we need to splice it? Or copy? 
    // Usually setup modifies the deck (splice).
    // The previous implementation created a NEW deck, which is likely a bug for game consistency anyway.
    // However, if Alchemist needs "Magic Elements", maybe it draws from the main deck?

    // Alchemist Logic: Draw 6 cards.
    const hand = deck.splice(0, 6).map(c => ({ ...c, ownerId: playerId }));

    return { hand, beasts: [], mp: 0, magicElements: [] };
  }

  // Fixed JSX errors by using React.createElement for .ts file
  renderActions(context: UIContext): React.ReactNode {
    const { selectedCards, isCurrentPlayer, performAction } = context;
    if (!isCurrentPlayer) return null;

    return (
      React.createElement("div", { className: "flex items-center gap-4 bg-white px-6 py-2 rounded-full shadow-lg border border-purple-200" },
        React.createElement("span", { className: "font-bold text-purple-600 text-xs" }, `ALQUIMIA (${selectedCards.length}/3)`),
        React.createElement("button", {
          disabled: selectedCards.length !== 3,
          onClick: () => performAction('ALCHEMIST_PLAY'),
          className: "btn btn-purple !py-1 !px-4 text-[10px] disabled:opacity-50"
        }, "TRANSMUTAR")
      )
    );
  }
}
