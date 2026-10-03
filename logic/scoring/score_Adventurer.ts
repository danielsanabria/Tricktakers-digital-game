import { Player, CharacterType } from '../../game/core/types';
import { CHARACTERS } from '../../game/core/constants';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class AdventurerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const logs: string[] = [];

        // 5 Victorias = Victoria Instantánea
        if (player.wins >= 5) {
            logs.push("¡Aventurero: 5 Victorias! Victoria Instantánea.");
            return { score: 999, isInstantWin: true, logs };
        }

        const char = CHARACTERS[CharacterType.ADVENTURER];
        const trickPoints = char.pointsByWins[player.wins] !== undefined ? char.pointsByWins[player.wins] : 0;
        logs.push(`Aventurero: Puntos por victorias (${player.wins} bazas): ${trickPoints} pts.`);

        let itemBonus = 0;
        if (player.items && player.items.length > 0) {
            player.items.forEach(it => {
                const pts = it.unusedPoints || 0;
                itemBonus += pts;
            });
            if (itemBonus !== 0) {
                logs.push(`Aventurero: Puntos por objetos no usados (${player.items.length} objetos): ${itemBonus >= 0 ? '+' : ''}${itemBonus} pts.`);
            }
        }

        let finalScore = trickPoints + itemBonus;

        // Comprobación de Tareas Reales del Gobernante
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
