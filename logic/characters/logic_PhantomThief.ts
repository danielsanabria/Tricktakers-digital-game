import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, SetupContext, Player, Card, CharacterType, CardType, Suit } from '../../game/core/types';

export class PhantomThiefLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    const { players, playerId, deck } = context;

    // 1. Prepare Deck with Thief Card
    // Rule: Replaces a 10? Or added? Usually replaces "Rank 10 of a color".
    // Let's assume we replace the BLACK 10 for high impact, or random 10.
    // Documentation says: "The Thief Card is treated as a Rank 10." 
    // We will Replace the Black 10 with the Thief Card.
    const modifiedDeck = [...deck];
    const black10Index = modifiedDeck.findIndex(c => c.suit === Suit.BLACK && c.value === 10);

    // Thief Card Object
    const thiefCard: Card = {
      id: 'thief-card-unique',
      suit: Suit.BLACK,
      value: 10,
      type: CardType.NUMBER,
      name: 'Thief Card',
      imagePath: '/assets/5c-cards/phantom-partner.jpg'
    };

    if (black10Index !== -1) {
      modifiedDeck[black10Index] = thiefCard;
    } else {
      modifiedDeck[modifiedDeck.length - 1] = thiefCard;
    }

    const opponents = players.filter(p => p.id !== playerId);
    const partner = opponents[Math.floor(Math.random() * opponents.length)];
    const targets = opponents.filter(p => p.id !== partner.id);

    return {
      hand: context.deck.slice(0, 5),
      thiefPartnerId: partner.id,
      thiefTargetIds: targets.map(p => p.id),
      thiefChipValue: null,
      thiefBetrayalMode: false
    };
  }

  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    if (player.id !== 'p1') {
      const newChip = Math.random() > 0.5 ? 1 : 0;
      const betrayal = Math.random() > 0.8;
      return { thiefChipValue: newChip, thiefBetrayalMode: betrayal };
    }
    return {};
  }

  // Actions are now rendered in PhantomThiefBoard.tsx!
  renderActions(context: UIContext): React.ReactNode {
    return null;
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
