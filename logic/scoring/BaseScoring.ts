import { Player } from '../../game/core/types';
import { CHARACTERS } from '../../game/core/constants';
import { IScoringLogic, ScoringResult } from './scoring_Interface';

export class BaseScoring implements IScoringLogic {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const char = player.character ? CHARACTERS[player.character] : null;
        let score = char ? (char.pointsByWins[player.wins] || 0) : 0;
        const logs: string[] = [];

        // Basic logs if needed
        if (char && score !== 999) {
            logs.push(`${char.name}: Puntos por victorias (${player.wins} bazas): ${score} pts.`);
        }

        // Check Tasks (assigned by Ruler)
        if (player.tasks && player.tasks.length > 0) {
            player.tasks.forEach(task => {
                if (!task.condition(player)) {
                    score -= 10;
                    logs.push(`Fallo de Tarea Real (${task.name}): -10 pts.`);
                } else {
                    logs.push(`Tarea Real Completada (${task.name}).`);
                }
            });
        }

        return {
            score,
            isInstantWin: score === 999,
            logs
        };
    }
}
