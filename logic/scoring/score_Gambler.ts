import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class GamblerScoring extends BaseScoring {
    getScore(player: Player): ScoringResult {
        const success = player.bid === player.wins;
        const bonus = (player.betAmount || 0);
        const logs: string[] = [];
        let pts = 0;

        if (success) {
            pts = bonus;
            logs.push(`Tahúr: ¡Apuesta acertada! (+${bonus} pts)`);
        } else {
            pts = -bonus;
            logs.push(`Tahúr: Falló apuesta. (-${bonus} pts)`);
        }

        return {
            score: pts,
            isInstantWin: false,
            logs
        };
    }
}
