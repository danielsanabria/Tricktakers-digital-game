
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, SetupContext, Player } from '../../game/core/types';

export class TimeTravelerLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    return {
      ...super.setup(context),
      timeTravelTokens: 2,
      timeTravelPredictions: []
    };
  }
  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, performAction } = context;
    if (!isCurrentPlayer) return null;

    return (
      React.createElement("button", {
        onClick: () => performAction('TIME_TRAVEL_REWIND'),
        className: "btn btn-purple !py-2 !px-6"
      }, "REBOBINAR TIEMPO")
    );
  }
}
