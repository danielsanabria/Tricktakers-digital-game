
import React from 'react';
import { BaseCharacterLogic } from './logic_Interface';
import { UIContext, Player, Card } from '../types';

export class NinjaLogic extends BaseCharacterLogic {

  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    const newWins = (player.wins || 0) + 1;
    if (newWins === 5) {
      return { score: 999, wins: newWins }; // Instant Win
    }
    return { wins: newWins };
  }

  renderActions(context: UIContext): React.ReactNode {
    const { abilityMode, setAbilityMode, isCurrentPlayer } = context;

    if (!isCurrentPlayer) return null;

    const isActive = abilityMode === 'NINJA_FACE_DOWN';

    return (
      React.createElement("button", {
        onClick: () => setAbilityMode(isActive ? 'NONE' : 'NINJA_FACE_DOWN'),
        className: `btn ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'}`
      },
        React.createElement("i", { className: "fa-solid fa-user-ninja mr-2" }),
        "CLON DE SOMBRA"
      )
    );
  }
}
