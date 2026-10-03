import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class PhantomThiefScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const logs: string[] = [];
        let pts = 0;

        if (player.wins >= 5) {
            return {
                score: 999,
                isInstantWin: true,
                logs: ["Ladrón Fantasma: 5 victorias -> ¡VICTORIA INSTANTÁNEA!"]
            };
        }

        if (player.wins === 0) {
            pts = 0;
            logs.push("Ladrón Fantasma: 0 victorias (0 pts).");
        } else if (player.wins === 1) {
            pts = -20;
            logs.push("Ladrón Fantasma: 1 victoria (-20 pts, elegible para Corona Negra).");
        } else if (player.wins === 2) {
            pts = 0;
            logs.push("Ladrón Fantasma: 2 victorias (el socio recibe 50 pts).");
        } else if (player.wins === 3) {
            pts = -50;
            logs.push("Ladrón Fantasma: 3 victorias (-50 pts).");
        } else if (player.wins === 4) {
            pts = 100;
            logs.push("Ladrón Fantasma: 4 victorias (+100 pts).");
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
