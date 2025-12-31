
import React from 'react';
import { BaseCharacterLogic } from './logic_Interface';
import { UIContext, SetupContext, Player } from '../types';

export class RulerLogic extends BaseCharacterLogic {

  setup(context: SetupContext): Partial<Player> {
    const { deck, playerId } = context;
    // Draw 5 cards
    const hand = deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));

    // Tasks are assigned in App.tsx startRound or via specific action during setup phase
    // We initialize as empty here to avoid overwriting or duplicates if called multiple times
    return { hand, tasks: [], beasts: [], mp: 0 };
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, performAction, player } = context;
    if (!isCurrentPlayer) return null;

    // Check if Ruler has used token
    const usedToken = player.rulerUsedRuleAvoidance;

    return (
      React.createElement("div", { className: "flex gap-2" },
        React.createElement("button", {
          onClick: () => performAction('RULER_ASSIGN_TASK'),
          className: "btn bg-slate-800 text-white"
        }, "ASIGNAR TAREA"),

        !usedToken && React.createElement("button", {
          onClick: () => performAction('RULER_IGNORE_RULES'),
          className: "btn bg-yellow-500 text-white"
        }, "IGNORAR REGLAS (TOKEN)")
      )
    );
  }
}
