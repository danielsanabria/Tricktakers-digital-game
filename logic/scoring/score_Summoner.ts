import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class SummonerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const logs: string[] = [];
        let pts = 0;

        const pointsTable: Record<number, number> = {
            0: -20,
            1: 20,
            2: 40,
            3: 70,
            4: 100
        };

        if (player.wins >= 5) {
            return {
                score: 999,
                isInstantWin: true,
                logs: ["Convocador: 5 victorias -> ¡VICTORIA INSTANTÁNEA!"]
            };
        }

        pts = pointsTable[player.wins] ?? 0;
        logs.push(`Convocador: ${player.wins} victorias -> ${pts} pts.`);

        // Check Ruler tasks
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
