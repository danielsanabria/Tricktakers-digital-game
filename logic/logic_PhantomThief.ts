import React from 'react';
import { BaseCharacterLogic } from './logic_Interface';
import { UIContext, SetupContext, Player, Card } from '../types';

export class PhantomThiefLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    const { players, playerId } = context;
    const opponents = players.filter(p => p.id !== playerId);

    // Assign Partner (Random for now)
    const partner = opponents[Math.floor(Math.random() * opponents.length)];
    const targets = opponents.filter(p => p.id !== partner.id);

    return {
      ...super.setup(context),
      thiefPartnerId: partner.id,
      thiefTargetIds: targets.map(t => t.id),
      thiefChipValue: 0,
      thiefBetrayalMode: false
    };
  }

  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    // AI Logic: Randomly adjust chip or betrayal
    // For human, we might want a UI prompt, but here we just return state updates if AI
    // or maybe enable a "THIEF_ADJUST" mode?
    // Letting AI auto-adjust for simplicity for now.
    if (player.id !== 'p1') {
      const newChip = Math.random() > 0.5 ? 1 : 0;
      const betrayal = Math.random() > 0.8;
      return { thiefChipValue: newChip, thiefBetrayalMode: betrayal };
    }
    return {};
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, performAction, player } = context;
    if (!isCurrentPlayer) return null;

    return (
      React.createElement("div", { className: "flex flex-col gap-2" },
        React.createElement("div", { className: "text-xs text-white" },
          `Socio: ${player.thiefPartnerId} | Targets: ${player.thiefTargetIds?.join(', ')}`
        ),
        React.createElement("div", { className: "flex gap-2" },
          React.createElement("button", {
            onClick: () => performAction('PHANTOM_EXCHANGE_REQUEST'),
            className: "btn bg-purple-600 text-white text-xs"
          }, "CAMBIAR CARTA"),
          React.createElement("button", {
            onClick: () => performAction('PHANTOM_TOGGLE_CHIP'),
            className: "btn bg-slate-700 text-white text-xs"
          }, `Chip: ${player.thiefChipValue}`),
          React.createElement("button", {
            onClick: () => performAction('PHANTOM_TOGGLE_BETRAYAL'),
            className: `btn text-xs ${player.thiefBetrayalMode ? 'bg-red-600' : 'bg-slate-700'} text-white`
          }, player.thiefBetrayalMode ? "TRAICIÓN ACTIVA" : "TRAICIÓN")
        )
      )
    );
  }
}
