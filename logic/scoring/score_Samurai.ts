import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class SamuraiScoring extends BaseScoring {
    getScore(player: Player): ScoringResult {
        let pts = 0;
        const logs: string[] = [];

        if (player.wins === 4) {
            pts = 999;
            logs.push("Samurái: ¡Hazaña del Samurái (4 victorias)! Victoria Instantánea.");
        } else if (player.wins === 5) {
            pts = -100;
            logs.push("Samurái: ¡Penalización por CODICIA (5 victorias)! -100 pts.");
        } else {
            // Standard points for other win counts
            const result = super.getScore(player, 0, []); // round/allPlayers unused for standard
            pts = result.score;
            logs.push(...result.logs);
        }

        return {
            score: pts,
            isInstantWin: pts === 999,
            logs
        };
    }
}
