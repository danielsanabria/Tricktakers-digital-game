import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class AlchemistScoring extends BaseScoring {
    getScore(player: Player): ScoringResult {
        const elementsCount = player.magicElements?.length || 0;
        const alchemistPoints = [0, 20, 40, 60, 80, 120];
        const pts = alchemistPoints[Math.min(elementsCount, 5)] || 0;

        return {
            score: pts,
            isInstantWin: false,
            logs: [`Alquimista: Obtuvo ${elementsCount} elementos (${pts} pts).`]
        };
    }
}
