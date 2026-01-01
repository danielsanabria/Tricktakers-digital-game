import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class HermitScoring extends BaseScoring {
    getScore(player: Player): ScoringResult {
        const hermitMap: Record<number, number> = { 0: 50, 1: -10, 2: -30, 3: 70, 4: 100, 5: 999 };
        const pts = hermitMap[player.wins] || 0;
        const logs: string[] = [];

        if (pts === 999) {
            logs.push("¡Ermitaño: 5 Victorias! Victoria Instantánea.");
        } else {
            logs.push(`Ermitaño: Puntos por victorias (${player.wins} bazas): ${pts} pts.`);
        }

        return {
            score: pts,
            isInstantWin: pts === 999,
            logs
        };
    }
}
