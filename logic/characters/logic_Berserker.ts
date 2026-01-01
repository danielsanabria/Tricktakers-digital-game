import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, CardType, Suit, PowerContext, Card, UIContext } from '../../game/core/types';

export class BerserkerLogic extends BaseCharacterLogic {

  setup(context: SetupContext): Partial<Player> {
    const { playerId } = context;
    // 1. Draw normal hand first (Base logic)
    const baseSetup = super.setup(context);

    // 2. Define the Exclusive Deck (7 cards total)
    // The "Berserker Card" (Main)
    const berserkerMain: Card = {
      id: `berserker-main-${playerId}`,
      suit: Suit.COLORLESS,
      value: 12, // Stronger than rare (11)
      type: CardType.RARE,
      ownerId: playerId,
      imagePath: '/assets/color-cards/berserker-cards/berserker-init.png'
    };

    // 6 supplementary cards (10s of each suit + 2 extra)
    const basicSuits = [Suit.RED, Suit.BLUE, Suit.GREEN, Suit.BLACK];
    const supplementary: Card[] = [
      ...basicSuits.map(s => ({
        id: `berserker-10-${s}-${playerId}`,
        suit: s,
        value: 10,
        type: CardType.NUMBER,
        ownerId: playerId,
        imagePath: `/assets/color-cards/berserker-cards/${s.toLowerCase()}-10.jpg`
      })),
      {
        id: `berserker-rare-${playerId}`,
        suit: Suit.COLORLESS,
        value: 11,
        type: CardType.RARE,
        ownerId: playerId,
        imagePath: '/assets/color-cards/berserker-cards/rare.jpg'
      },
      {
        id: `berserker-wf-${playerId}`,
        suit: Suit.COLORLESS,
        value: 0,
        type: CardType.WHITE_FLAG,
        ownerId: playerId,
        imagePath: '/assets/color-cards/berserker-cards/whiteflag.jpg'
      }
    ];

    // No random drawing. Deck is fixed to these 7 cards.
    // const extraCards = context.deck.splice(0, 2); // REMOVED

    const fullBerserkerDeck = [berserkerMain, ...supplementary];

    return {
      ...baseSetup, // Keep the normal hand for now (user will discard it manually)
      berserkerDeck: fullBerserkerDeck,
      beasts: [],
      mp: 0
    };
  }

  // Helper to draw the special hand
  // Guarantees Main Card is in hand.
  drawBerserkerHand(currentDeck: Card[]): { hand: Card[], remaining: Card[] } {
    // Determine Main Card
    // Match by ID prefix specifically for the main card, or check if path includes the filename
    const mainCard = currentDeck.find(c => c.imagePath && c.imagePath.includes('berserker-init.png'));
    const others = currentDeck.filter(c => c !== mainCard);

    // Shuffle others
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);

    // Take 4 from others
    const selectedOthers = shuffledOthers.slice(0, 4);
    const remainingOthers = shuffledOthers.slice(4);

    if (mainCard) {
      return {
        hand: [mainCard, ...selectedOthers],
        remaining: remainingOthers
      };
    } else {
      // Fallback (should not happen setup correctly)
      return {
        hand: [shuffledOthers[0], ...shuffledOthers.slice(1, 5)],
        remaining: shuffledOthers.slice(5)
      };
    }
  }

  getCardPower(context: PowerContext): number {
    const { card, onesInSuits, isKakumei, isRevolt } = context;

    // Berserker cards are usually very strong (3000+)
    const isBerserkerCard = card.id.startsWith('berserker-');
    if (!isBerserkerCard) return super.getCardPower(context);

    // Base Strength
    let power = 3000;

    // RULE: Berserker cards must follow suit to be strong (unless they are the Colorless Main card)
    const isColorless = card.suit === Suit.COLORLESS;
    const isBerserkerMain = card.id.startsWith('berserker-main-');
    if (context.leadSuit && card.suit !== context.leadSuit && !isColorless) {
      power = card.value; // Revert to normal value (10), losing the 3000 buff.
    }

    // Special Exception: 1 vs Berserker in Standard.
    if (!(context.isKakumei || context.isRevolt)) {
      if (isBerserkerMain && context.onesInSuits.length > 0) {
        power = -1;
      } else if (card.value === 10 && context.onesInSuits.includes(card.suit)) {
        power = -1;
      }
    }

    // Standard Bonuses
    if (card.suit === Suit.BLACK) power += 1000;
    else if (context.leadSuit && card.suit === context.leadSuit) power += 500;

    return power;
  }

  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, performAction, player, abilityMode, selectedCards, round } = context;
    if (!isCurrentPlayer) return null;

    // RULE: In Round 3, spend a black crown to discard/draw from exclusive deck.
    const canUseRound3 = round === 3 && player.blackCrowns > 0 && !player.berserkerUsedRound3;
    const isRound3Discard = abilityMode === 'BERSERKER_ROUND3_DISCARD';

    if (canUseRound3 || isRound3Discard) {
      return (
        React.createElement("div", { className: "flex flex-col gap-2 items-center bg-white px-4 py-3 rounded-2xl shadow-xl border-2 border-red-600" },
          React.createElement("div", { className: "flex items-center gap-2 mb-1" },
            React.createElement("i", { className: "fa-solid fa-crown text-slate-800" }),
            React.createElement("span", { className: "text-[10px] font-black text-red-700 uppercase tracking-widest" }, "Furia de Batalla Final")
          ),
          !isRound3Discard ? (
            React.createElement("button", {
              onClick: () => performAction('BERSERKER_START_ROUND3'),
              className: "btn bg-red-600 text-white !py-1.5 !px-4 text-[10px] font-bold"
            }, "USAR CORONA NEGRA (ROBO EXTRA)")
          ) : (
            React.createElement("div", { className: "flex flex-col gap-2 items-center" },
              React.createElement("span", { className: "text-[9px] font-bold text-red-800" }, "DESCARTA 1 O 2 CARTAS (NO EL BERSERKER)"),
              React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", {
                  disabled: selectedCards.length < 1 || selectedCards.length > 2 || selectedCards.some(id => id.startsWith('berserker-main-')),
                  onClick: () => performAction('BERSERKER_EXECUTE_ROUND3'),
                  className: "btn bg-red-600 text-white !py-1.5 !px-4 text-[10px]"
                }, "CONFIRMAR")
              )
            )
          )
        )
      );
    }

    return null;
  }
}
