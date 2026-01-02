import { Player, CharacterType, Suit } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class RulerScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const baseResult = super.getScore(player, round, allPlayers);
        let pts = baseResult.score;
        const logs = [...baseResult.logs];

        // Ruler bonuses
        const hasBlack = player.wonCards.some(c => c.suit === Suit.BLACK);
        if (hasBlack) {
            pts += 10;
            logs.push("Gobernante: Capturó carta negra (+10 pts).");
        }
        if (player.wins === 1) {
            pts += 20;
            logs.push("Gobernante: Exactamente 1 victoria (+20 pts).");
        }

        // Task Bonus: Check opponents
        const opponents = allPlayers.filter(p => p.id !== player.id);
        const opponentsWithTasks = opponents.filter(p => p.tasks && p.tasks.length > 0);

        if (opponentsWithTasks.length > 0) {
            const allTasksCompleted = opponentsWithTasks.every(p => p.tasks.every(t => t.condition(p)));
            if (allTasksCompleted) {
                // Bonus based on player count or difficulty? 
                // Docs: Normal +10, Hard +20, 3-5 players +30.
                // Let's assume +20 as a baseline or based on opponent count
                const bonus = opponents.length >= 3 ? 30 : 20; // 3 opponents = 4 players total
                pts += bonus;
                logs.push(`Gobernante: ¡Súbditos obedientes! Todas las tareas completadas (+${bonus} pts).`);
            }
        }

        // Win condition: Tyranny (2+ wins, no R/B/G)
        // Check for instant win
        if (player.wins >= 2) {
            const hasColorCards = player.wonCards.some(c =>
                c.suit === Suit.RED || c.suit === Suit.BLUE || c.suit === Suit.GREEN
            );
            if (!hasColorCards) {
                return { score: 999, isInstantWin: true, logs: ["¡Gobernante: TIRANÍA! (2+ Victorias sin cartas de color). Victoria Instantánea."] };
            }
        }

        return { score: pts, isInstantWin: false, logs };
    }
}
