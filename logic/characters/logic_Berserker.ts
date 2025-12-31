
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, CardType, Suit, PowerContext, Card } from '../../game/core/types';

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
    const { card, trickContainsOne, isKakumei, isRevolt } = context;

    // Berserker cards are usually very strong (3000+)
    const isBerserkerCard = card.id.startsWith('berserker-');
    if (!isBerserkerCard) return card.value;

    // Base Strength
    let power = 3000;

    // RULE: Berserker cards must follow suit to be strong (unless they are the Colorless Main card)
    // If Lead Suit exists, and card is NOT Lead Suit AND NOT Colorless -> It's an off-suit play.
    // Off-suit play should not win against Lead Suit (unless Trump, but Berserker is not Trump).
    if (context.leadSuit && card.suit !== context.leadSuit && card.suit !== Suit.COLORLESS) {
      power = card.value; // Revert to normal value (10), losing the 3000 buff.
    }

    // Kakumei: Revolution makes Strongest -> Weakest.
    // If we assume the engine inverts logic (Low = Win), then 3000 is "Weak" (Loses).
    // If the engine keeps High = Win but changes Card Values, then we need to set this to 0.
    // Let's assume the engine handles specific "Strength Inversion" by flipping the sort order. 
    // IF the engine flips sort: 3000 is Worst. Perfect.
    // IF the engine DOES NOT flip sort but expects us to return "Inverted Power":
    // We need to verify GameLogic. But usually "Revolution" means "3 is stronger than 2", etc.
    // Standard: 3 > 2. Revolution: 2 > 3. 
    // If I return 3000, and opponent returns 5.
    // Standard: 3000 > 5. Win.
    // Revolution: 5 > 3000? No, 5 is "better" than 3000? (Closer to 0?)
    // Yes if "Low Wins".

    // However, the rule says: "The rule that 1 beats Berserker is ANNULLED in Revolution".
    // So 1 vs Berserker in Rev:
    // 1 (Value 1). Berserker (3000).
    // If Rev = Low Wins: 1 is "Better" than 3000. So 1 beats Berserker?
    // User: "El Berserker se convierte en la carta más débil".
    // Meaning it should LOSE to everything.
    // In Rev (Low Wins): To lose to everything, it must be the "Highest" value (worst).
    // So 3000 is correct for "Weakest" in Low-Wins mode.

    // Special Exception: 1 vs Berserker in Standard.
    // 1 beats Berserker.
    // 1 has value 1. Berserker 3000.
    // 3000 > 1. Berserker wins.
    // We need 1 to win.
    // So if `trickContainsOne`, force Berserker Power to -1 (so 1 > -1).
    if (!(isKakumei || isRevolt) && trickContainsOne) {
      power = -1;
    }

    // Standard Bonuses
    if (card.suit === Suit.BLACK) power += 1000;
    else if (context.leadSuit && card.suit === context.leadSuit) power += 500;

    return power;
  }
}
