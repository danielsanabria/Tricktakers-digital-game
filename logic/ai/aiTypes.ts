import { Player, Card, Suit, AIDifficulty } from '../../game/core/types';

export interface AIContext {
    player: Player;
    leadSuit: Suit | null;
    playedCards: Card[];
    trick: number;
    round: number;
    allPlayers: Player[];
    difficulty: AIDifficulty;
    isRevolt?: boolean;
    isKakumei?: boolean;
}
