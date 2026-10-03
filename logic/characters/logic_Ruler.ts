
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, SetupContext, Player } from '../../game/core/types';

// Helper Component for Ruler Setup
const RulerSetup: React.FC<UIContext> = (context) => {
  const { performAction } = context;

  return React.createElement("div", { className: "p-4 bg-amber-900/90 rounded-xl space-y-4 text-white max-w-lg mx-auto border border-amber-500 shadow-xl" },
    React.createElement("h3", { className: "font-bold text-lg text-center text-amber-300" }, "Decreta tus Leyes"),
    React.createElement("p", { className: "text-xs text-center text-amber-100" }, "Asigna una tarea real a cada uno de tus oponentes."),
    React.createElement("div", { className: "flex flex-col gap-2" },
      ['p2', 'p3'].map(pid =>
        React.createElement("div", { key: pid, className: "flex justify-between items-center bg-amber-800/50 p-2 rounded" },
          React.createElement("span", { className: "font-bold" }, `Para Rival ${pid.replace('p', '')}:`),
          React.createElement("button", {
            className: "btn btn-amber text-xs",
            onClick: () => performAction('RULER_OPEN_TASK_SELECTION', pid)
          }, "Seleccionar Tarea")
        )
      )
    )
  );
};

export class RulerLogic extends BaseCharacterLogic {

  setup(context: SetupContext): Partial<Player> {
    const { deck, playerId, hand: providedHand } = context;
    const hand = providedHand || deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));
    return { hand, tasks: [], beasts: [], mp: 0 };
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, performAction, abilityMode } = context;
    if (!isCurrentPlayer) return null;

    if (abilityMode === 'RULER_SETUP') {
      return React.createElement(RulerSetup, context);
    }

    const isActive = abilityMode === 'RULER_IGNORE_RULES';

    return (
      React.createElement("div", { className: "flex gap-2" },
        React.createElement("button", {
          onClick: () => performAction('RULER_IGNORE_RULES'),
          className: `btn ${isActive ? 'btn-amber shadow-lg scale-105' : 'btn-slate !bg-white !text-slate-600 hover:!border-amber-500'} !py-1.5 !px-4 text-[11px]`
        }, isActive ? "DECRETAR PALO (ACTIVO)" : "IGNORAR REGLAS Y DECRETAR PALO")
      )
    );
  }
}
