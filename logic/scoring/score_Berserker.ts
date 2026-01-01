import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class BerserkerScoring extends BaseScoring {
    getScore(player: Player): ScoringResult {
        if (player.wins === 0) {
            return { score: 999, isInstantWin: true, logs: ["¡Berserker: 0 Victorias! Victoria Instantánea (Furia Desatada)."] };
        }
        return super.getScore(player, 0, []);
    }
}
