import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class SamuraiScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        let pts = 0;
        const logs: string[] = [];

        if (player.wins === 4) {
            return {
                score: 999,
                isInstantWin: true,
                logs: ["Samurái: ¡Hazaña del Samurái (4 victorias)! Victoria Instantánea."]
            };
        } else if (player.wins === 5) {
            pts = -100;
            logs.push("Samurái: ¡Penalización por CODICIA (5 victorias)! -100 pts.");
        } else {
            const result = super.getScore(player, round, allPlayers);
            pts = result.score;
            logs.push(...result.logs);
        }

        // Apply Ruler tasks check if assigned
        if (player.tasks && player.tasks.length > 0) {
            player.tasks.forEach(task => {
                const diffPoints = task.difficulty === 'HARD' ? 20 : 10;
                if (!task.condition(player)) {
                    pts -= diffPoints;
                    logs.push(`Fallo de Tarea Real (${task.name}): -${diffPoints} pts.`);
                } else {
                    logs.push(`Tarea Real Completada (${task.name}).`);
                }
            });
        }

        return {
            score: pts,
            isInstantWin: false,
            logs
        };
    }
}
