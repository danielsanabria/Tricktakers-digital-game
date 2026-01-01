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
            }
        } else {
            // For p1, if they have 0 or 1 wins, they get points but only after they choose.
            // However, for the total calculation in App.tsx loop, we can just say 0 for now
            // and let the Modal handle the add score.
            if (player.wins === 0 || player.wins === 1) {
                logs.push(`Estratega: ${player.wins} victorias. Debes elegir tu recompensa.`);
            }
        }

        return {
            score: pts,
            isInstantWin: false,
            logs
        };
    }
}
