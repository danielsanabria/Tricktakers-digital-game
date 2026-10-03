import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class GamblerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const logs: string[] = [];

        // Condición 1: Ganar 5 bazas = Victoria Instantánea
        if (player.wins >= 5) {
            logs.push("¡Tahúr: 5 Victorias! Victoria Instantánea.");
            return { score: 999, isInstantWin: true, logs };
        }

        // Condición 2: Pujar 4 y ganar 4 bazas = Victoria Instantánea
        if (player.bid === 4 && player.wins === 4) {
            logs.push("¡Tahúr: Predicción perfecta de 4 bazas! Victoria Instantánea.");
            return { score: 999, isInstantWin: true, logs };
        }

        let trickScore = 0;
        const betAmount = player.betAmount || 0;
        let betGain = 0;

        // Tabla oficial de acierto de puja
        const bidPointsTable: Record<number, number> = {
            0: 30,
            1: 60,
            2: 90,
            3: 150
        };

        if (player.bid !== undefined && player.bid === player.wins) {
            trickScore = bidPointsTable[player.bid] || 0;
            betGain = betAmount; // Gana el monto apostado del suministro
            logs.push(`Tahúr: ¡Predicción acertada (${player.bid} bazas)! +${trickScore} pts.`);
            if (betAmount > 0) {
                logs.push(`Tahúr: Apuesta ganada (+${betAmount} pts).`);
            }
        } else {
            trickScore = 0;
            betGain = -betAmount; // Pierde lo apostado
            const bidText = player.bid !== undefined ? `${player.bid}` : 'Sin puja';
            logs.push(`Tahúr: Predicción fallida (Puja: ${bidText}, Victorias: ${player.wins}). 0 pts.`);
            if (betAmount > 0) {
                logs.push(`Tahúr: Apuesta perdida (-${betAmount} pts).`);
            }
        }

        let finalScore = trickScore + betGain;

        // Penalizaciones o recompensas de Tareas del Gobernante
        if (player.tasks && player.tasks.length > 0) {
            player.tasks.forEach(task => {
                const diffPoints = task.difficulty === 'HARD' ? 20 : 10;
                if (!task.condition(player)) {
                    finalScore -= diffPoints;
                    logs.push(`Fallo de Tarea Real (${task.name}): -${diffPoints} pts.`);
                } else {
                    finalScore += diffPoints;
                    logs.push(`Tarea Real Completada (${task.name}): +${diffPoints} pts.`);
                }
            });
        }

        return {
            score: finalScore,
            isInstantWin: false,
            logs
        };
    }
}
