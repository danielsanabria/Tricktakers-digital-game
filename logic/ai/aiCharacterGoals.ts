import { Player, CharacterType } from '../../game/core/types';

export enum TrickIntention {
    WANT_WIN = 'WANT_WIN',
    WANT_LOSE = 'WANT_LOSE',
    NEUTRAL = 'NEUTRAL'
}

/**
 * Returns whether the AI player should aim to win or lose this trick based on
 * character rules, win count, round number, and character strategy.
 */
export function getCharacterTrickIntention(player: Player, round: number, trick: number): TrickIntention {
    const char = player.character;
    const wins = player.wins || 0;

    switch (char) {
        // 1A. KING: Wants maximum wins (especially R3 x2 multiplier, 5 wins = Instant Win)
        case CharacterType.KING:
            return TrickIntention.WANT_WIN;

        // 1C. STRATEGIST: 0 wins = +50, 1 win = +30, 2 wins = -50 (terrible), 3 wins = +50, 4 wins = +80, 5 wins = Win Game
        case CharacterType.STRATEGIST:
            if (wins === 0 && trick >= 4) return TrickIntention.WANT_LOSE; // Lock 0 wins
            if (wins === 1 && trick >= 4) return TrickIntention.WANT_LOSE; // Lock 1 win
            if (wins === 2) return TrickIntention.WANT_WIN; // Desperately get 3rd win to avoid -50
            if (wins >= 3) return TrickIntention.WANT_WIN; // Push for 4 or 5
            return TrickIntention.NEUTRAL;

        // 2A. GAMBLER: Wants exactly its bid
        case CharacterType.GAMBLER:
            const bid = player.bid !== undefined ? player.bid : 2;
            if (wins < bid) return TrickIntention.WANT_WIN;
            if (wins >= bid) return TrickIntention.WANT_LOSE; // Do NOT overshoot
            return TrickIntention.NEUTRAL;

        // 2C. SUMMONER: 0 wins = -20 pts. 3 wins = +70, 4 = +100, 5 = Win.
        case CharacterType.SUMMONER:
            if (wins === 0) return TrickIntention.WANT_WIN; // Avoid -20
            return TrickIntention.WANT_WIN;

        // 2D. NINJA: 0 = +70, 1 = -20, 2 = +70 (Black Crown!), 3 = -20, 4 = +140, 5 = Win.
        case CharacterType.NINJA:
            if (wins === 0 && trick >= 4) return TrickIntention.WANT_LOSE; // Lock 0 wins (+70)
            if (wins === 1) return TrickIntention.WANT_WIN; // Must reach 2 wins to get +70 & Black Crown
            if (wins === 2 && trick >= 4) return TrickIntention.WANT_LOSE; // Lock 2 wins (+70)
            if (wins === 3) return TrickIntention.WANT_WIN; // Must reach 4 wins (+140) to avoid -20
            if (wins >= 4) return TrickIntention.WANT_WIN;
            return TrickIntention.NEUTRAL;

        // 3A. RESISTANCE: Bazas in R1/R2 don't score standard trick points; R3 gives +30/win.
        case CharacterType.RESISTANCE:
            if (round === 3) return TrickIntention.WANT_WIN;
            return TrickIntention.NEUTRAL;

        // 3B. ADVENTURER: 0:20, 1:10, 2:20, 3:40, 4:60, 5:999.
        case CharacterType.ADVENTURER:
            return TrickIntention.WANT_WIN;

        // 3C. ALCHEMIST: Form combos to win and collect crowns
        case CharacterType.ALCHEMIST:
            return TrickIntention.WANT_WIN;

        // 3D. SAMURAI: Exactly 4 wins = Instant Win! 5 wins = -100 penalty (Greed!).
        case CharacterType.SAMURAI:
            if (wins < 4) return TrickIntention.WANT_WIN;
            if (wins === 4) return TrickIntention.WANT_LOSE; // CRITICAL: Stop at 4!
            return TrickIntention.WANT_LOSE;

        // 4A. HERMIT: 0:50, 1:-10, 2:-30, 3:70, 4:100, 5:999.
        case CharacterType.HERMIT:
            if (wins === 0 && trick >= 4) return TrickIntention.WANT_LOSE; // Lock 0 wins (+50)
            if (wins === 1 || wins === 2) return TrickIntention.WANT_WIN; // Escape negative zone
            return TrickIntention.WANT_WIN;

        // 4B. COLLECTOR: Wins tricks to collect all cards, losses collect 1 card
        case CharacterType.COLLECTOR:
            return TrickIntention.NEUTRAL;

        // 4C. TIME TRAVELER: 0:30, 1:60, 2:90, 3:120, 4:180, 5:300.
        case CharacterType.TIME_TRAVELER:
            return TrickIntention.WANT_WIN;

        // 5A. BERSERKER: 0 wins = -30 in R1/R2 (better than 1 at -10 or 5 at -50) and Instant Win in R3!
        case CharacterType.BERSERKER:
            if (round === 3) return TrickIntention.WANT_LOSE; // INSTANT WIN with 0 wins in Round 3!
            if (wins === 0) return TrickIntention.WANT_LOSE;
            if (wins >= 4) return TrickIntention.WANT_LOSE; // Avoid 5th win (-50 penalty)
            return TrickIntention.WANT_LOSE;

        // 5B. RULER: 1 win = +20 bonus. 2+ wins with no RGB cards = Tyranny Instant Win.
        case CharacterType.RULER:
            if (wins === 0) return TrickIntention.WANT_WIN;
            if (wins === 1 && trick >= 4) return TrickIntention.WANT_LOSE; // Lock single win bonus
            return TrickIntention.NEUTRAL;

        // 5C. PHANTOM THIEF: 1 win = Black Crown (-20 pts). 2 wins = partner gets 50. 4 = 100, 5 = 999.
        case CharacterType.PHANTOM_THIEF:
            if (wins === 0) return TrickIntention.WANT_WIN;
            return TrickIntention.NEUTRAL;

        default:
            return TrickIntention.WANT_WIN;
    }
}
