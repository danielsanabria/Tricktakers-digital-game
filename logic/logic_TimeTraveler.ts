
import React from 'react';
import { BaseCharacterLogic } from './logic_Interface';
import { UIContext, SetupContext, Player } from '../types';

export class TimeTravelerLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    return {
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
        className: "btn bg-fuchsia-600 text-white"
      }, "REBOBINAR TIEMPO")
    );
  }
}
