import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, UIContext, Card, PowerContext } from '../../game/core/types';
import { ITEMS } from '../../game/core/constants';

export class AdventurerLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    const { playerId } = context;
    const baseSetup = super.setup(context);

    // Adventurer starts with 2 item slots.
    // Human picks manually, AI picks randomly.
    if (playerId !== 'p1') {
      const red = ITEMS.filter(i => i.type === 'RED' && ['it-4', 'it-5', 'it-6'].includes(i.id)).sort(() => Math.random() - 0.5)[0];
      const blue = ITEMS.filter(i => i.type === 'BLUE' && ['it-1', 'it-2', 'it-3'].includes(i.id)).sort(() => Math.random() - 0.5)[0];
      return { ...baseSetup, items: [red, blue], itemSlots: 2 };
    }
    return { ...baseSetup, items: [], itemSlots: 2 };
  }

  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    // Increase item slots by 1 (max 5)
    const newSlots = Math.min(5, (player.itemSlots || 0) + 1);

    // Also potentially refill items if below slots? 
    // Rule: "Inmediatamente después de usar un ítem, el sistema debe robar uno nuevo"
    // But also "Al ganar una baza, la pila se convierte en un nuevo espacio (slot) para un ítem... la IA debe robar un nuevo ítem".

    const missingItems = newSlots - player.items.length;
    if (missingItems > 0) {
      // Exclude held items AND used items
      const usedIds = player.usedItemIds || [];
      const possibleItems = ITEMS.filter(i =>
        !player.items.find(pi => pi.id === i.id) &&
        !usedIds.includes(i.id)
      );

      // OPTIONAL IMPROVEMENT: Filter out items just used? 
      // Current Random Logic:
      if (possibleItems.length > 0) {
        const randomized = [...possibleItems].sort(() => Math.random() - 0.5);
        const drawn = randomized.slice(0, 1);
        return { itemSlots: newSlots, items: [...player.items, ...drawn] };
      }
    }
    return { itemSlots: newSlots };
  }

  getCardPower(context: PowerContext): number {
    let power = super.getCardPower(context);
    const { player, card, isKakumei, isRevolt } = context;

    // Bonuses apply based on Wins (Level)
    const wins = player.wins || 0;

    // Level 2 (2 Wins): +2 to Even Cards
    if (wins === 2 && card.value % 2 === 0) {
      power += 2;
    }
    // Level 3 (3 Wins): +3 to Odd Cards
    else if (wins === 3 && card.value % 2 !== 0) {
      power += 3;
    }
    // Level 4 (4 Wins): +4 to All Cards
    else if (wins >= 4) {
      power += 4;
    }

    return power;
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, player, performAction, abilityMode, setAbilityMode } = context;
    if (!isCurrentPlayer) return null;

    if (abilityMode === 'ADVENTURER_SETUP') {
      const redItems = ITEMS.filter(i => i.type === 'RED');
      const blueItems = ITEMS.filter(i => i.type === 'BLUE');
      return React.createElement("div", { className: "p-4 bg-slate-800 rounded-xl space-y-4" },
        React.createElement("h3", { className: "text-white font-bold" }, "Elige tus ítems iniciales"),
        React.createElement("div", { className: "flex gap-2" },
          redItems.map(it => React.createElement("button", { key: it.id, onClick: () => performAction('CHOOSE_INITIAL_ITEM', it), className: "btn btn-rose !py-1.5 !px-3 text-[10px]" }, it.name)),
          blueItems.map(it => React.createElement("button", { key: it.id, onClick: () => performAction('CHOOSE_INITIAL_ITEM', it), className: "btn btn-blue !py-1.5 !px-3 text-[10px]" }, it.name))
        )
      );
    }

    return (
      React.createElement("div", { className: "flex flex-col gap-2" },
        React.createElement("div", { className: "flex gap-2" },
          player.items.map(item =>
            React.createElement("div", { key: item.id, className: "flex gap-1" },
              React.createElement("button", {
                onClick: () => performAction('USE_ITEM', item),
                className: `btn ${item.type === 'RED' ? 'btn-rose' : 'btn-blue'} !py-1 !px-3 text-[9px]`
              }, `USAR: ${item.name}`),
              React.createElement("button", {
                onClick: () => {
                  performAction('SHOW_ITEM_CARD', item.itemCardPath);
                },
                className: "bg-slate-700 text-white rounded px-2 text-[10px]"
              }, "?")
            )
          )
        )
      )
    );
  }
}