import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class AdventurerScoring extends BaseScoring {
    getScore(player: Player): ScoringResult {
        let itemBonus = 0;
        player.items.forEach(it => {
            itemBonus += (it.unusedPoints || 0);
        });

        return {
            score: itemBonus,
            isInstantWin: false,
            logs: itemBonus !== 0 ? [`Aventurero: Items no usados (${itemBonus} pts).`] : []
        };
    }
}
