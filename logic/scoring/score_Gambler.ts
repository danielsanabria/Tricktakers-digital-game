import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class GamblerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        // Base Score (Wins + Task Penalties)
        const baseResult = super.getScore(player, round, allPlayers);
        let pts = baseResult.score;
        const logs = [...baseResult.logs];

        // Bid Logic
        if (player.bid !== undefined) {
            const diff = Math.abs(player.wins - player.bid);
            if (diff === 0) {
                pts += 20;
                logs.push(`Tahúr: Predicción exacta de victorias (+20 pts).`);
            } else {
                const penalty = diff * 10;
                pts -= penalty;
                logs.push(`Tahúr: Fallo de predicción (${diff} de diferencia). -${penalty} pts.`);
            }
        }

        // Bet Logic
        const betAmount = player.betAmount || 0;
        if (betAmount > 0) {
            if (player.bid === player.wins) {
                pts += betAmount;
                logs.push(`Tahúr: Apuesta ganada (+${betAmount} pts).`);
            } else {
                pts -= betAmount;
                logs.push(`Tahúr: Apuesta perdida (-${betAmount} pts).`);
            }
        }

        return {
            score: pts,
            isInstantWin: baseResult.isInstantWin,
            logs
        };
    }
}
