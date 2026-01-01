import { Player } from '../../game/core/types';

export interface ScoringResult {
    score: number;
    isInstantWin: boolean;
    logs: string[];
}

export interface IScoringLogic {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult;
}
