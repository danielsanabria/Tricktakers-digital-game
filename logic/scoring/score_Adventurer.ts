import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class AdventurerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        // Get base score (Wins + Task Penalties)
        const baseResult = super.getScore(player, round, allPlayers);
        let finalScore = baseResult.score;
        const logs = [...baseResult.logs];

        let itemBonus = 0;
        player.items.forEach(it => {
            itemBonus += (it.unusedPoints || 0);
        });

        if (itemBonus !== 0) {
            finalScore += itemBonus;
            logs.push(`Aventurero: Items no usados (${itemBonus} pts).`);
        }

        return {
            score: finalScore,
            isInstantWin: baseResult.isInstantWin,
            logs
        };
    }
}
