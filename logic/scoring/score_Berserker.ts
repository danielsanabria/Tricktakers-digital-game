import { Player } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class BerserkerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const logs: string[] = [];

        // Regla Oficial: Berserker SOLO gana la partida instantáneamente si tiene 0 victorias EN LA RONDA 3
        if (player.wins === 0) {
            if (round === 3) {
                logs.push("¡Berserker: 0 Victorias en la Ronda Final! Victoria Instantánea (Furia Desatada).");
                return { score: 999, isInstantWin: true, logs };
            } else {
                logs.push("Berserker: 0 victorias en Ronda intermedia -> -30 pts.");
            }
        }

        const berserkerTable: Record<number, number> = {
            0: -30,
            1: -10,
            2: 30,
            3: 50,
            4: 80,
            5: -50
        };

        const trickScore = berserkerTable[player.wins] !== undefined ? berserkerTable[player.wins] : 0;
        if (player.wins > 0) {
            logs.push(`Berserker: Puntos por victorias (${player.wins} bazas): ${trickScore} pts.`);
        }

        let finalScore = trickScore;

        // Comprobación de Tareas Reales impuestas por el Gobernante
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
