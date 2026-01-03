import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class StrategistScoring extends BaseScoring {
    getScore(player: Player): ScoringResult {
        const logs: string[] = [];
        let pts = 0;

        // Strategist: End of Round Choice (0 or 1 wins)
        // If it's the player, App.tsx handles the modal. 
        // If it's AI, we just award points here.
        if (player.id !== 'p1') {
            if (player.wins === 0) {
                pts = 50;
                logs.push("Estratega (AI): 0 victorias -> +50 pts.");
            } else if (player.wins === 1) {
                pts = 30;
                logs.push("Estratega (AI): 1 victoria -> +30 pts.");
            } else if (player.wins === 2) {
                pts = -50;
                logs.push("Estratega (AI): 2 victorias -> -50 pts.");
            } else if (player.wins === 3) {
                pts = 50;
                logs.push("Estratega (AI): 3 victorias -> +50 pts.");
            } else if (player.wins === 4) {
                pts = 80;
                logs.push("Estratega (AI): 4 victorias -> +80 pts.");
            } else if (player.wins >= 5) {
                pts = 999;
                logs.push("Estratega (AI): 5 victorias -> ¡VICTORIA INSTANTÁNEA!");
            }
        } else {
            // For p1 (User)
            if (player.wins === 0 || player.wins === 1) {
                // Choice handled by Modal
                logs.push(`Estratega: ${player.wins} victorias. Debes elegir tu recompensa.`);
            } else if (player.wins === 2) {
                pts = -50;
                logs.push("Estratega: 2 victorias -> -50 pts.");
            } else if (player.wins === 3) {
                pts = 50;
                logs.push("Estratega: 3 victorias -> +50 pts.");
            } else if (player.wins === 4) {
                pts = 80;
                logs.push("Estratega: 4 victorias -> +80 pts.");
            } else if (player.wins >= 5) {
                pts = 999;
                logs.push("Estratega: 5 victorias -> ¡VICTORIA INSTANTÁNEA!");
            }
        }

        return {
            score: pts,
            isInstantWin: false,
            logs
        };
    }
}
