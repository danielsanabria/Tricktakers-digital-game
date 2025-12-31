
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, PowerContext, SetupContext, Player } from '../../game/core/types';

export class ResistanceLogic extends BaseCharacterLogic {

  setup(context: SetupContext): Partial<Player> {
    const base = super.setup(context);
    const revoltsLeft = (context.round === 3) ? 2 : 1;
    return { ...base, revoltsLeft, wonRevolutionTrick: false };
  }

  getCardPower(context: PowerContext): number {
    return super.getCardPower(context);
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, player, performAction } = context;
    if (!isCurrentPlayer || !player.revoltsLeft || player.revoltsLeft <= 0) return null;

    return (
      React.createElement("button", {
        onClick: () => performAction('TRIGGER_KAKUMEI'),
        className: "btn btn-rose"
      },
        React.createElement("i", { className: "fa-solid fa-flag mr-2" }),
        "REVOLUCIÓN"
      )
    );
  }
}
