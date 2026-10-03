import { Player, CharacterType, Suit } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class RulerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const baseResult = super.getScore(player, round, allPlayers);
        let pts = baseResult.score;
        const logs = [...baseResult.logs];

        // Win condition: Tyranny (2+ wins, no Red/Blue/Green in won cards)
        if (player.wins >= 2) {
            const hasColorCards = player.wonCards.some(c =>
                c.suit === Suit.RED || c.suit === Suit.BLUE || c.suit === Suit.GREEN
            );
            if (!hasColorCards) {
                return {
                    score: 999,
                    isInstantWin: true,
                    logs: ["¡Gobernante: TIRANÍA! (2+ victorias sin cartas de color R/B/G). Victoria Instantánea."]
                };
            }
        }

        // Ruler bonuses
        const hasBlack = player.wonCards.some(c => c.suit === Suit.BLACK);
        if (hasBlack) {
            pts += 10;
            logs.push("Gobernante: Capturó al menos una carta negra (+10 pts).");
        }
        if (player.wins === 1) {
            pts += 20;
            logs.push("Gobernante: Exactamente 1 victoria (+20 pts).");
        }

        // Task Bonus: Check tasks completed by opponents
        const opponents = allPlayers.filter(p => p.id !== player.id);
        const opponentsWithTasks = opponents.filter(p => p.tasks && p.tasks.length > 0);

        if (opponentsWithTasks.length > 0) {
            let totalTasks = 0;
            let completedTasks = 0;

            for (const opp of opponentsWithTasks) {
                for (const task of opp.tasks) {
                    totalTasks++;
                    const isCompleted = task.condition ? task.condition(opp) : false;
                    if (isCompleted) {
                        completedTasks++;
                        const taskBonus = (task.difficulty === 'HARD' || task.difficulty === 'DIFFICULT') ? 20 : 10;
                        pts += taskBonus;
                        logs.push(`Gobernante: Súbdito (${opp.name || opp.id}) completó "${task.name}" (+${taskBonus} pts).`);
                    }
                }
            }

            if (totalTasks > 0 && completedTasks === totalTasks) {
                pts += 10;
                logs.push("Gobernante: ¡Súbditos obedientes! Todas las tareas completadas (+10 pts bonus).");
            }
        }

        return { score: pts, isInstantWin: false, logs };
    }
}
