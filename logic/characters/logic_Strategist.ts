
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, CardType, Card, UIContext } from '../../game/core/types';
import { Suit } from '../../game/core/types';

export class StrategistLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    // 1. Add Black 7 to hand
    const black7: Card = {
      id: `strat-b7-${context.playerId}`,
      suit: Suit.BLACK,
      value: 7,
      type: CardType.NUMBER,
      ownerId: context.playerId
    };

    // 2. Draw 5 random cards (total 6) -> Must discard 1 later
    // Logic similar to King, App.tsx should handle "Discard Phase" if hand > 5
    const hand: Card[] = context.deck.splice(0, 5).map(c => ({ ...c, ownerId: context.playerId }));
    hand.push(black7);

    // 3. Initialize Traps (Random Order for MVP)
    // The App will handle the "Trap Deck" state, logic just ensures hand is ready.

    // Return modified hand
    return {
      hand,
      beasts: [],
      mp: 0
    };
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, performAction, abilityMode, player, setAbilityMode, round } = context;

    if (!isCurrentPlayer) return null;

    // Tactical Ability: Ignore Suit (Once per round)
    // We need to track if it's used. Let's assume 'strategistUsedIgnore' property on player?
    // User didn't specify tracking "used" state, but implies "Once per round".
    // I need to add 'strategistUsedIgnore' to Player interface first? 
    // Or I can use existing flags if any, or just add logic.
    // For now, I'll add a button that sets ability mode.

    // Note: To properly track "Once per round", I should add a flag to Player.
    // I'll update types.ts in next step. For now, assume property acts as check.

    const usedIgnore = (player as any).strategistUsedIgnore;

    // Setup Phase: Define Trap Order
    if (abilityMode === 'STRATEGIST_SETUP') {
      // Mock UI for Trap Ordering.
      // Ideally we show list of traps and allow dragging or numbering.
      // For MVP: "Cycle Order" or "Default Shuffle".
      // As a simple fix, we just allow confirming the current random shuffle or a preset list.
      // Real implementation requires complex DND logic which is weird in React.createElement.
      // We will just show "Confirm Trap Plan".
      // And maybe allow simple "Swap Top Trap" with another?

      return React.createElement("div", { className: "fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 p-6 rounded-xl border border-amber-600 shadow-2xl z-50" },
        React.createElement("h3", { className: "text-amber-500 font-bold text-lg mb-2" }, "Plan Maestro de Trampas"),
        React.createElement("p", { className: "text-white text-sm mb-4" }, "Tus trampas han sido barajadas. ¿Deseas mantener este orden?"),
        React.createElement("button", {
          onClick: () => performAction('STRATEGIST_SET_TRAPS', { traps: context.trapDeck || [] }), // Pass current deck back as 'set'
          className: "btn btn-amber w-full"
        }, "CONFIRMAR PLAN")
      );
    }

    return (
      React.createElement("div", { className: "flex flex-col gap-2" },
        !usedIgnore && (
          React.createElement("button", {
            onClick: () => setAbilityMode(abilityMode === 'STRATEGIST_IGNORE_SUIT' ? 'NONE' : 'STRATEGIST_IGNORE_SUIT'),
            className: `btn ${abilityMode === 'STRATEGIST_IGNORE_SUIT' ? 'btn-amber shadow-lg scale-105' : 'btn-slate border-slate-200 !bg-white !text-slate-500 hover:!border-amber-500 hover:!text-amber-500'}`
          }, abilityMode === 'STRATEGIST_IGNORE_SUIT' ? "CANCELAR HABILIDAD" : "IGNORAR PALO (1 VEZ)")
        )
      )
    );
  }

  // Strategist actions (Playing traps) are currently reactive in the engine (checked on every card play),
  // rather than an active button press, so standard human logic applies.

  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    if (player.wins >= 5) {
      return { score: 999 }; // Instant Win
    }
    return {};
  }
}
