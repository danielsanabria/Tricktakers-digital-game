
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, SetupContext, Player } from '../../game/core/types';

export class RulerLogic extends BaseCharacterLogic {

  setup(context: SetupContext): Partial<Player> {
    const { deck, playerId, players } = context;
    // Draw 5 cards
    const hand = deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));

    // AI Ruler: Auto-Assign Tasks (Simplified for logic class)
    // Note: TASKS import is needed or we can pass it via context if we refactor SetupContext.
    // For now, let's assume we can import it since this is a logic file.
    let tasks: any[] = [];
    if (playerId !== 'p1') {
      // AI Logic: Each player gets a random task from TASKS
      // This is tricky because setup() is called per player.
      // The original App.tsx logic assigned tasks to ALL players when Ruler setup ran.
      // A better way is to handle it in the Ruler's setup or in the engine.
    }

    return { hand, tasks: [], beasts: [], mp: 0 };
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, performAction, player } = context;
    if (!isCurrentPlayer) return null;

    // Check if Ruler has used token
    const usedToken = player.rulerUsedRuleAvoidance;

    return (
      React.createElement("div", { className: "flex gap-2" },


        !usedToken && React.createElement("button", {
          onClick: () => performAction('RULER_IGNORE_RULES'),
          className: "btn btn-amber !py-1.5 !px-4 text-[11px]"
        }, "IGNORAR REGLAS (TOKEN)")
      )
    );
  }
}
