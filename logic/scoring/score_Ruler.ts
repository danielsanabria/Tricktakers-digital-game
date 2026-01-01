import { Player, CharacterType, Suit } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class RulerScoring extends BaseScoring {
    getScore(player: Player): ScoringResult {
        let pts = 0;
        const logs: string[] = [];

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

        if (player.tasks && player.tasks.length > 0 && player.tasks.every(t => t.condition(player))) {
            pts += 10;
            logs.push("Gobernante: Todas sus tareas completadas (+10 pts).");
        }

        // Win condition: Tyranny (2+ wins, no R/B/G)
        // Actually the 441 return in App.tsx had score: pts === 999 ...
        // Let's implement the Tyranny check here.
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
