import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class AlchemistScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const logs: string[] = [];

        // Philosopher's Stone: 2 Gold Crowns = Instant Win
        if ((player.crowns?.gold || 0) >= 2) {
            return {
                score: 999,
                isInstantWin: true,
                logs: ["Alquimista: ¡PIEDRA FILOSOFAL! (2 Coronas Doradas). Victoria Instantánea."]
            };
        }

        // Clean & clear scoring: wins / elements count mapping (0: 0, 1: 20, 2: 40, 3: 60, 4: 80, 5: 120)
        const alchemistPoints = [0, 20, 40, 60, 80, 120];
        const winsIndex = Math.min(player.wins, 5);
        let pts = alchemistPoints[winsIndex] || 0;
        logs.push(`Alquimista: ${player.wins} bazas ganadas -> ${pts} pts.`);

        // Extra element bonus (if elements collected during alchemy)
        const elementBonus = (player.magicElements?.length || 0) * 5;
        if (elementBonus > 0) {
            pts += elementBonus;
            logs.push(`Alquimista: Bonus de elementos alquímicos (+${elementBonus} pts).`);
        }

        // Ruler tasks evaluation
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
