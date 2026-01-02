
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, Player, Card } from '../../game/core/types';

export class NinjaLogic extends BaseCharacterLogic {

  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    if (player.wins >= 5) {
      return { score: 999 }; // Instant Win
    }
    return {};
  }

  renderActions(context: UIContext): React.ReactNode {
    const { abilityMode, setAbilityMode, isCurrentPlayer } = context;

    if (!isCurrentPlayer) return null;

    const isActive = abilityMode === 'NINJA_FACE_DOWN';

    return (
      React.createElement("button", {
        onClick: () => setAbilityMode(isActive ? 'NONE' : 'NINJA_FACE_DOWN'),
        className: `btn btn-slate ${isActive ? 'shadow-lg scale-105' : '!bg-white !text-slate-500 hover:!bg-slate-50'}`
      },
        React.createElement("i", { className: "fa-solid fa-user-ninja mr-2" }),
        "CLON DE SOMBRA"
      )
    );
  }
}
