import { Player, CharacterType } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class TimeTravelerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const baseResult = super.getScore(player, round, allPlayers);
        let pts = baseResult.score;
        const logs = [...baseResult.logs];

        let predictionBonus = 0;
        const predictions = player.timeTravelPredictions || [];

        const maxWins = Math.max(...allPlayers.map(p => p.wins));
        const roundGoldWinner = allPlayers.find(p => p.wins === maxWins && maxWins > 0);

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

        // Prophecy Fulfilled (Round 3): Perfect predictions (all 3 correct) = Instant Win
        if (round === 3 && predictionBonus === 150) {
            return { score: 999, isInstantWin: true, logs: ["¡VIAJERO DEL TIEMPO: PREDICCIÓN PERFECTA EN RONDA 3! Victoria Instantánea."] };
        }

        pts += predictionBonus;

        // Apply Ruler tasks check if assigned
        if (player.tasks && player.tasks.length > 0) {
            player.tasks.forEach(task => {
                const diffPoints = task.difficulty === 'HARD' ? 20 : 10;
                if (!task.condition(player)) {
                    pts -= diffPoints;
                    logs.push(`Fallo de Tarea Real (${task.name}): -${diffPoints} pts.`);
                } else {
                    logs.push(`Tarea Real Completada (${task.name}).`);
                }
            });
        }

        return {
            score: pts,
            isInstantWin: false,
            logs
        };
    }
}
