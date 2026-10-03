import { Player, CardType, Suit } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class ResistanceScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const logs: string[] = [];
        let totalScore = 0;

        // 1. Puntos por ganar la Baza de Revolución
        if (player.wonRevolutionTrick) {
            const card = player.revoltWinningCard;
            if (card) {
                if (card.suit === Suit.BLACK) {
                    logs.push("¡La Resistencia: Baza de Revolución ganada con CARTA NEGRA! Victoria Instantánea.");
                    return { score: 999, isInstantWin: true, logs };
                } else if (card.type === CardType.WHITE_FLAG) {
                    totalScore += 30;
                    logs.push("La Resistencia: Revolución ganada con Bandera Blanca (+30 pts).");
                } else if (card.value >= 1 && card.value <= 3) {
                    totalScore += 50;
                    logs.push(`La Resistencia: Revolución ganada con carta baja (${card.suit} ${card.value}) (+50 pts).`);
                } else if (card.value >= 4 && card.value <= 6) {
                    totalScore += 80;
                    logs.push(`La Resistencia: Revolución ganada con carta media (${card.suit} ${card.value}) (+80 pts).`);
                } else if (card.value >= 7 && card.value <= 9) {
                    totalScore += 100;
                    logs.push(`La Resistencia: Revolución ganada con carta alta (${card.suit} ${card.value}) (+100 pts).`);
                }
            } else {
                // Si por alguna razón ganó en revolución sin tarjeta registrada
                totalScore += 50;
                logs.push("La Resistencia: Victoria en baza de Revolución (+50 pts).");
            }
        }

        // 2. Habilidad de Ronda 3 (Battle Ready): +30 pts por cada baza ganada
        if (round === 3 && player.wins > 0) {
            const r3Bonus = player.wins * 30;
            totalScore += r3Bonus;
            logs.push(`La Resistencia (Ronda Final): +30 pts por cada victoria (${player.wins} bazas = +${r3Bonus} pts).`);
        }

        if (!player.wonRevolutionTrick && round !== 3) {
            logs.push(`La Resistencia: 0 pts en bazas convencionales (${player.wins} bazas ganadas).`);
        }

        // 3. Tareas Reales del Gobernante
        if (player.tasks && player.tasks.length > 0) {
            player.tasks.forEach(task => {
                const diffPoints = task.difficulty === 'HARD' ? 20 : 10;
                if (!task.condition(player)) {
                    totalScore -= diffPoints;
                    logs.push(`Fallo de Tarea Real (${task.name}): -${diffPoints} pts.`);
                } else {
                    totalScore += diffPoints;
                    logs.push(`Tarea Real Completada (${task.name}): +${diffPoints} pts.`);
                }
            });
        }

        return {
            score: totalScore,
            isInstantWin: false,
            logs
        };
    }
}
