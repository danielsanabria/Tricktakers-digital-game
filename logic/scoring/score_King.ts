import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class KingScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const result = super.getScore(player, round, allPlayers);
        if (round === 3) {
            const originalScore = result.score;
            result.score *= 2;
            result.logs.push(`El Rey duplica sus puntos en la Ronda Final: ${originalScore} x 2 = ${result.score}`);
        }
        return result;
    }
}
