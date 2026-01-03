import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, Card, CardType, UIContext } from '../../game/core/types';
import { ALCHEMIST_DECK } from '../../game/core/constants';
import { calculateAlchemyValue } from '../../game/core/alchemyUtils';

export class AlchemistLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    const { playerId } = context;
    // 1. Create a deep copy of the Alchemist Deck
    const deckCopy = [...ALCHEMIST_DECK].map(c => ({ ...c, ownerId: playerId }));

    // 2. Shuffle the deck
    for (let i = deckCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
    }

    // 3. Draw 6 cards for initial hand
    const hand = deckCopy.splice(0, 6);

    return {
      hand,
      alchemistDeck: deckCopy,
      mp: 0,
      magicElements: []
    };
  }

  // Fixed JSX errors by using React.createElement for .ts file
  renderActions(context: UIContext): React.ReactNode {
    const { selectedCards, isCurrentPlayer, performAction, player } = context;
    if (!isCurrentPlayer) return null;

    // Importing dynamically to avoid circular dependencies if possible, or assume imports exist
    // Since we are in a class inside a file, we need helper imports.
    // We need 'calculateAlchemyValue' but it's not imported.
    // And we need access to player.hand to resolve card IDs.

    // NOTE: We need to import calculateAlchemyValue at the top of the file!
    // But since I can't see the top imports easily right now in this context without re-reading,
    // I will assume I can add the import in a separate step or it exists. 
    // Wait, I viewed the file in Step 335. imports are:
    // import { BaseCharacterLogic } from '../logic_Interface';
    // import { SetupContext, Player, Card, CardType, UIContext } from '../../game/core/types';
    // import { ALCHEMIST_DECK } from '../../game/core/constants';

    // I need to add import { calculateAlchemyValue } from '../../game/core/gameLogic';

    const actualCards = player.hand.filter(c => selectedCards.includes(c.id));
    // Safe fallback if function missing (will add import next)
    const result = calculateAlchemyValue(actualCards);

    const elements = result.elements || [];

    // Token Assets Mapping
    const tokenMap: Record<string, string> = {
      '3_OF_A_KIND': '/assets/3c-cards/alch-red-01-element-token.png', // Placeholder token
      'FLUSH': '/assets/3c-cards/alch-blue-01-element-token.png',
      'STRAIGHT': '/assets/3c-cards/alch-green-01-element-token.png',
      'SAME_AS_LEAD': '/assets/3c-cards/alch-purple-01-element-token.png'
    };

    return (
      React.createElement("div", { className: "flex flex-col items-center gap-2" },
        // Preview Box
        selectedCards.length > 0 && React.createElement("div", { className: "bg-gray-800 text-white p-2 rounded-lg text-xs flex items-center gap-2 border border-purple-500 shadow-xl" },
          React.createElement("div", { className: "font-bold text-center leading-none" },
            React.createElement("div", { className: "text-[10px] text-gray-400" }, "RESULTADO"),
            React.createElement("div", { className: "text-lg text-amber-400" }, result.value === 10 ? "10 (Fuerte)" : result.value)
          ),
          // Elements Icons
          elements.length > 0 && React.createElement("div", { className: "flex gap-1 pl-2 border-l border-gray-600" },
            elements.map(el =>
              React.createElement("img", {
                key: el,
                src: tokenMap[el] || tokenMap['3_OF_A_KIND'],
                className: "w-6 h-6 object-contain drop-shadow-md",
                title: el
              })
            )
          )
        ),

        // Action Button
        React.createElement("div", { className: "flex items-center gap-4 bg-white px-6 py-2 rounded-full shadow-lg border border-purple-200" },
          React.createElement("span", { className: "font-bold text-purple-600 text-xs" }, `ALQUIMIA (${selectedCards.length}/3)`),
          React.createElement("button", {
            disabled: selectedCards.length !== 3,
            onClick: () => performAction('ALCHEMIST_PLAY'),
            className: "btn btn-purple !py-1 !px-4 text-[10px] disabled:opacity-50"
          }, "TRANSMUTAR")
        )
      )
    );
  }

  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    return {
      magicElements: [...(player.magicElements || []), 'TRICK_WIN']
    };
  }
}
