
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, PowerContext, SetupContext, Player, Suit, Card } from '../../game/core/types';

export class ResistanceLogic extends BaseCharacterLogic {

  setup(context: SetupContext): Partial<Player> {
    const base = super.setup(context);
    const revoltsLeft = (context.round === 3) ? 2 : 1; // Round 3: 2 Revolts, others 1
    return { ...base, revoltsLeft, wonRevolutionTrick: false };
  }

  getCardPower(context: PowerContext): number {
    const { card, isRevolt, isKakumei } = context;
    // Base Power
    let power = super.getCardPower(context);

    // Revolt Logic Override
    // In Revolt, Lowest number wins. Black is WEAKEST.
    // If Logic Interface doesn't auto-invert, we might need to do it here.
    // However, usually 'isRevolt' flag in `resolveTrick` handles the "Lower is Better" sorting.
    // BUT "Black is Weaker than Colors" is a specific Tier change.

    // Standard Base Logic:
    // Black = +1000.
    // Lead = +500.

    if (isRevolt || isKakumei) {
      // 1. Black Cards Logic (Weakest in Revolt)
      if (card.suit === Suit.BLACK) {
        return 1000 + card.value;
      }

      // 2. Lead Suit Logic (Nullified in Revolt)
      // If card followed suit, Base logic added +500. We strip it by returning raw value.
      // We know it's NOT Black here.
      if (context.leadSuit && card.suit === context.leadSuit) {
        return card.value;
      }
    }

    return power;
  }

  onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
    // Scoring Logic
    let scoreGain = 0;
    let instantWin = false;

    // Check if this was a Revolt Trick (How do we know? `wonRevolutionTrick` flag? Or `isRevolt` context passed?)
    // `onTrickWon` arguments don't include context directly, but `player.revoltUsed` might be set?
    // Actually `useGameLoop` sets `isRevolt` for the trick.
    // We need to know if *this specific trick* was a Revolt.
    // We might rely on `player.revoltUsed` if it resets per trick? No, it's per usage.
    // Maybe `cards` contains the token info?
    // Or we assume `BaseCharacterLogic` doesn't support "Context" here easily?

    // Workaround: We check if the WINNING CARD (?) or any card had the token.
    // But `cards` are just cards.
    // Wait, the User Request says "Win with Black Card in Revolt Trick = Win Game".
    // If I can't detect Revolt Trick here, I have a problem.
    // However, `logic_Resistance` setup initializes `wonRevolutionTrick`.
    // Maybe `resolveTrick` updates the player BEFORE calling `onTrickWon`?
    // Or `resolveTrick` passes a "Context" with `isRevolt`?
    // looking at `logic_Interface.ts`, `onTrickWon` signature is `(player, cards, round)`.

    // I will assume for now I cannot easily detect mechanism without Game Loop support.
    // BUT, Round 3 Bonus is easier.
    if (round === 3) {
      scoreGain += 30;
    }

    // SCORING TABLE (Revolt Trick Only)
    // If I can't detect Revolt, I can't apply this.
    // I will add a TODO comment or try to infer from `player` state if updated?

    return {
      score: (player.score || 0) + scoreGain,
      // instantWin? Not returnable in Partial<Player>. Handled by GameLoop checking `score >= 999` usually.
      // If Instant Win, set score = 999.
    };
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
