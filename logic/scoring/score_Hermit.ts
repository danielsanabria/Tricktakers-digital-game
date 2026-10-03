import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class HermitScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const hermitMap: Record<number, number> = { 0: 50, 1: -10, 2: -30, 3: 70, 4: 100, 5: 999 };
        let pts = hermitMap[player.wins] !== undefined ? hermitMap[player.wins] : 0;
        const logs: string[] = [];

        if (pts === 999 || player.wins >= 5) {
            logs.push("¡Ermitaño: 5 Victorias! Victoria Instantánea.");
            return { score: 999, isInstantWin: true, logs };
        }

        logs.push(`Ermitaño: Puntos por victorias (${player.wins} bazas): ${pts} pts.`);

        let finalScore = pts;

        // Comprobación de Tareas Reales del Gobernante
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
