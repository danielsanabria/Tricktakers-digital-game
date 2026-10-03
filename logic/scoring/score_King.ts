import { Player, CharacterType } from '../../game/core/types';
import { CHARACTERS } from '../../game/core/constants';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class KingScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const char = CHARACTERS[CharacterType.KING];
        let trickPoints = char.pointsByWins[player.wins] || 0;
        const logs: string[] = [];

        // 5 Victorias = Victoria Instantánea
        if (trickPoints === 999 || player.wins >= 5) {
            logs.push("¡El Rey: 5 Victorias! Victoria Instantánea.");
            return { score: 999, isInstantWin: true, logs };
        }

        // Ronda 3: Duplica los puntos obtenidos por bazas del personaje
        if (round === 3) {
            const doubled = trickPoints * 2;
            logs.push(`El Rey duplica sus puntos por victorias en la Ronda Final: ${trickPoints} x 2 = ${doubled} pts.`);
            trickPoints = doubled;
        } else {
            logs.push(`El Rey: Puntos por victorias (${player.wins} bazas): ${trickPoints} pts.`);
        }

        let finalScore = trickPoints;

        // Comprobación de Tareas Reales impuestas por el Gobernante
        if (player.tasks && player.tasks.length > 0) {
            player.tasks.forEach(task => {
                const diffPoints = task.difficulty === 'HARD' ? 20 : 10;
                if (!task.condition(player)) {
                    finalScore -= diffPoints;
                    logs.push(`Fallo de Tarea Real (${task.name}): -${diffPoints} pts.`);
                } else {
                    finalScore += diffPoints;
                    logs.push(`Tarea Real Completada (${task.name}): +${diffPoints} pts.`);
                }
            });
        }

        return {
            score: finalScore,
            isInstantWin: false,
            logs
        };
    }
}
