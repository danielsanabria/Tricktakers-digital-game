import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, SetupContext, Player, Card, CharacterType } from '../../game/core/types';

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
            className: "btn btn-purple !py-1 !px-3 text-[10px]"
          }, "CAMBIAR CARTA"),
          React.createElement("button", {
            onClick: () => performAction('PHANTOM_TOGGLE_CHIP'),
            className: "btn btn-slate !py-1 !px-3 text-[10px]"
          }, `CHIP: ${player.thiefChipValue}`),
          React.createElement("button", {
            onClick: () => performAction('PHANTOM_TOGGLE_BETRAYAL'),
            className: `btn ${player.thiefBetrayalMode ? 'btn-rose scale-105 shadow-lg' : 'btn-slate !bg-white !text-slate-500 hover:!border-rose-500'} !py-1 !px-3 text-[10px]`
          }, player.thiefBetrayalMode ? "TRAICIÓN ACTIVA" : "TRAICIÓN")
        )
      )
    );
  }

  static resolveSteal(players: Player[], addLog: (msg: string) => void): Player[] {
    const thief = players.find(p => p.character === CharacterType.PHANTOM_THIEF);
    if (!thief || thief.wins === 0 || thief.wins === 5) return players;

    let updated = [...players];
    let targetIds = thief.thiefBetrayalMode ? [thief.thiefPartnerId!] : (thief.thiefTargetIds || []);
    const chip = thief.thiefChipValue || 0;

    let bestVictimId: string | null = null;
    let bestStealType: 'GOLD' | 'BLACK' | 'POINTS' | null = null;

    targetIds.forEach(tid => {
      const victim = updated.find(v => v.id === tid);
      if (!victim) return;

      const diff = Math.abs(thief.wins - victim.wins);
      const matches = chip === 0 ? diff === 0 : (diff === 1);

      if (matches) {
        if (victim.goldCrowns > 0) {
          if (bestStealType !== 'GOLD') { bestStealType = 'GOLD'; bestVictimId = victim.id; }
        } else if (victim.blackCrowns > 0) {
          if (bestStealType !== 'GOLD' && bestStealType !== 'BLACK') { bestStealType = 'BLACK'; bestVictimId = victim.id; }
        } else if (victim.score >= 30) {
          if (!bestStealType) { bestStealType = 'POINTS'; bestVictimId = victim.id; }
        }
      }
    });

    if (bestVictimId && bestStealType) {
      updated = updated.map(p => {
        if (p.id === bestVictimId) {
          if (bestStealType === 'GOLD') return { ...p, goldCrowns: p.goldCrowns - 1 };
          if (bestStealType === 'BLACK') return { ...p, blackCrowns: p.blackCrowns - 1 };
          if (bestStealType === 'POINTS') return { ...p, score: p.score - 30 };
        }
        if (p.id === thief.id) {
          const victimName = updated.find(v => v.id === bestVictimId)?.name || 'Víctima';
          if (bestStealType === 'GOLD') { addLog(`Phantom Thief roba Corona Dorada a ${victimName}.`); return { ...p, goldCrowns: p.goldCrowns + 1 }; }
          if (bestStealType === 'BLACK') { addLog(`Phantom Thief roba Corona Negra a ${victimName}.`); return { ...p, blackCrowns: p.blackCrowns + 1 }; }
          if (bestStealType === 'POINTS') { addLog(`Phantom Thief roba 30 puntos a ${victimName}.`); return { ...p, score: p.score + 30 }; }
        }
        return p;
      });
    }

    return updated;
  }

  static resolveBonus(players: Player[], addLog: (msg: string) => void): Player[] {
    const thief = players.find(p => p.character === CharacterType.PHANTOM_THIEF);
    if (!thief || thief.wins !== 2) return players;

    return players.map(p => {
      if (p.id === thief.thiefPartnerId) {
        addLog(`Phantom Thief otorga 50 puntos a su socio ${p.name}.`);
        return { ...p, score: p.score + 50 };
      }
      return p;
    });
  }
}
