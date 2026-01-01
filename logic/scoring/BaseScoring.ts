import { Player } from '../../game/core/types';
import { CHARACTERS } from '../../game/core/constants';
import { IScoringLogic, ScoringResult } from './scoring_Interface';

export class BaseScoring implements IScoringLogic {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const char = player.character ? CHARACTERS[player.character] : null;
        const score = char ? (char.pointsByWins[player.wins] || 0) : 0;
        const logs: string[] = [];

        // Basic logs if needed
        if (char && score !== 999) {
            logs.push(`${char.name}: Puntos por victorias (${player.wins} bazas): ${score} pts.`);
        }

        return {
            score,
            isInstantWin: score === 999,
            logs
        };
    }
}
