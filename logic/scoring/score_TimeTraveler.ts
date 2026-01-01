import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';
import { CharacterType } from '../../game/core/types';

export class TimeTravelerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const logs: string[] = [];
        let predictionBonus = 0;
        const predictions = player.timeTravelPredictions || [];

        const maxWins = Math.max(...allPlayers.map(p => p.wins));
        const roundGoldWinner = allPlayers.find(p => p.wins === maxWins && maxWins > 0);

        // Resistance special logic for Black Crown check
        const isResistanceBlack = (p: Player) => p.character === CharacterType.RESISTANCE && p.wins === 1 && p.wonRevolutionTrick;
        const roundBlackWinners = allPlayers.filter(p => p.wins === 0 || isResistanceBlack(p));

        if (predictions[0] && roundGoldWinner && predictions[0] === roundGoldWinner.id) {
            predictionBonus += 50;
            logs.push("Viajero del Tiempo: ¡Predicción de Corona Dorada ACERTADA! (+50 pts)");
        }
        if (predictions[1] && roundBlackWinners.some(bw => bw.id === predictions[1])) {
            predictionBonus += 50;
            logs.push("Viajero del Tiempo: ¡Predicción de Corona Negra 1 ACERTADA! (+50 pts)");
        }
        if (predictions[2] && roundBlackWinners.some(bw => bw.id === predictions[2])) {
            predictionBonus += 50;
            logs.push("Viajero del Tiempo: ¡Predicción de Corona Negra 2 ACERTADA! (+50 pts)");
        }

        if (round === 3 && predictionBonus === 150) {
            return { score: 999, isInstantWin: true, logs: ["¡VIAJERO DEL TIEMPO: PREDICCIÓN PERFECTA! Victoria Instantánea."] };
        }

        return {
            score: predictionBonus,
            isInstantWin: false,
            logs
        };
    }
}
