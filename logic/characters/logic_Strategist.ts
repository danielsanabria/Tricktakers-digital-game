import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, UIContext } from '../../game/core/types';

export class StrategistLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    const { deck, playerId, hand: providedHand } = context;
    const hand = providedHand || deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));

    return {
      hand,
      beasts: [],
      mp: 0
    };
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, performAction, abilityMode, player, setAbilityMode } = context;

    if (!isCurrentPlayer) return null;

    const usedIgnore = (player as any).strategistUsedIgnore;

    if (abilityMode === 'STRATEGIST_SETUP') {
      return React.createElement("div", { className: "fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 p-6 rounded-xl border border-amber-600 shadow-2xl z-50" },
        React.createElement("h3", { className: "text-amber-500 font-bold text-lg mb-2" }, "Plan Maestro de Trampas"),
        React.createElement("p", { className: "text-white text-sm mb-4" }, "Tus trampas han sido barajadas. ¿Deseas mantener este orden?"),
        React.createElement("button", {
          onClick: () => performAction('STRATEGIST_SET_TRAPS', { traps: context.trapDeck || [] }),
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

  onTrickWon(player: Player): Partial<Player> {
    if (player.wins >= 5) {
      return { score: 999 };
    }
    return {};
  }
}
