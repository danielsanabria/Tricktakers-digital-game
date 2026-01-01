import { Player, CharacterType } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class ResistanceScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        let effWins = player.wins;
        const logs: string[] = [];

        if (player.wins === 1 && player.wonRevolutionTrick) {
            logs.push("Resistencia: Tu única victoria fue en Revolución -> Cuenta como 0 victorias.");
            effWins = 0;
        }

        const result = super.getScore({ ...player, wins: effWins }, round, allPlayers);
        result.logs = [...logs, ...result.logs];
        return result;
    }
}
