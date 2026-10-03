import { Player, Suit, Card, CardType } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class CollectorScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const wonCards = (player.collectedCards && player.collectedCards.length > 0)
            ? player.collectedCards
            : (player.wonCards || []);

        if (wonCards.length === 0) {
            return { score: 0, isInstantWin: false, logs: ["Coleccionista: No recolectó cartas."] };
        }

        const logs: string[] = [];

        // 1. Comprobar Gran Colección (Escalera de Color de 9 cartas) -> Victoria Instantánea
        const checkInstantWin = (): boolean => {
            const suits = [Suit.RED, Suit.BLUE, Suit.GREEN, Suit.BLACK];
            for (const s of suits) {
                const suitCards = wonCards.filter(c => c.suit === s && c.type === CardType.NUMBER);
                if (suitCards.length < 9) continue;
                const values = Array.from(new Set(suitCards.map(c => c.value))).sort((a, b) => a - b);
                let streak = 1;
                for (let i = 1; i < values.length; i++) {
                    if (values[i] === values[i - 1] + 1) streak++;
                    else streak = 1;
                    if (streak >= 9) return true;
                }
            }
            return false;
        };

        if (checkInstantWin()) {
            return { score: 999, isInstantWin: true, logs: ["¡Coleccionista: GRAN COLECCIÓN DE 9 CARTAS! Victoria Instantánea."] };
        }

        // Cartas utilizables (se excluyen Banderas Blancas y cartas del Berserker)
        const usableCards = wonCards.filter(c => c.type !== CardType.WHITE_FLAG && c.type !== CardType.BERSERKER);

        // Búsqueda óptima de hasta 3 combinaciones (Mejor puntuación total)
        const { score: bestComboScore, logs: comboLogs, remainingCount } = this.findBestCombinations(usableCards);

        logs.push(...comboLogs);

        // Penalización por basura: -10 pts por cada 2 cartas no usadas
        const garbagePenalty = Math.floor(remainingCount / 2) * 10;
        if (garbagePenalty > 0) {
            logs.push(`Coleccionista: Penalización por cartas no usadas (${remainingCount} cartas sobrantes): -${garbagePenalty} pts.`);
        }

        let finalScore = bestComboScore - garbagePenalty;

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

    private findBestCombinations(cards: Card[]): { score: number, logs: string[], remainingCount: number } {
        let maxScore = -Infinity;
        let bestLogs: string[] = [];
        let bestRemaining = cards.length;

        const solve = (currentPool: Card[], combosCount: number, currentScore: number, currentLogs: string[]) => {
            const penalty = Math.floor(currentPool.length / 2) * 10;
            const total = currentScore - penalty;

            if (total > maxScore) {
                maxScore = total;
                bestLogs = [...currentLogs];
                bestRemaining = currentPool.length;
            }

            if (combosCount >= 3 || currentPool.length < 3) return;

            const possibleCombos = this.getPossibleCombos(currentPool);
            for (const combo of possibleCombos) {
                const usedIds = combo.cards.map(c => c.id);
                const nextPool = currentPool.filter(c => !usedIds.includes(c.id));
                solve(nextPool, combosCount + 1, currentScore + combo.score, [...currentLogs, combo.log]);
            }
        };

        solve(cards, 0, 0, []);

        return {
            score: maxScore === -Infinity ? 0 : (maxScore + Math.floor(bestRemaining / 2) * 10),
            logs: bestLogs,
            remainingCount: bestRemaining
        };
    }

    private getPossibleCombos(cards: Card[]): { cards: Card[], score: number, log: string }[] {
        const result: { cards: Card[], score: number, log: string }[] = [];
        const numberCards = cards.filter(c => c.type === CardType.NUMBER);
        const rares = cards.filter(c => c.type === CardType.RARE);

        const suits = [Suit.RED, Suit.BLUE, Suit.GREEN, Suit.BLACK];

        // 1. Straight Flush 5 (+100 pts)
        suits.forEach(s => {
            const sc = numberCards.filter(c => c.suit === s);
            const vals = Array.from(new Set(sc.map(c => c.value))).sort((a, b) => a - b);
            for (let i = 0; i <= vals.length - 5; i++) {
                if (vals[i + 4] === vals[i] + 4) {
                    const comboCards = sc.filter(c => c.value >= vals[i] && c.value <= vals[i + 4]).slice(0, 5);
                    result.push({ cards: comboCards, score: 100, log: `Coleccionista: Combo Color-Escalera 5 (${s}) (+100 pts)` });
                }
            }
        });

        // 2. 4 of a Kind (+80 pts)
        for (let v = 1; v <= 10; v++) {
            const vc = numberCards.filter(c => c.value === v);
            if (vc.length >= 4) {
                result.push({ cards: vc.slice(0, 4), score: 80, log: `Coleccionista: Combo Póker de ${v} (+80 pts)` });
            } else if (vc.length === 3 && rares.length > 0) {
                result.push({ cards: [...vc.slice(0, 3), rares[0]], score: 80, log: `Coleccionista: Combo Póker de ${v} (con Comodín Rara) (+80 pts)` });
            }
        }

        // 3. Straight Flush 3 (+50 pts)
        suits.forEach(s => {
            const sc = numberCards.filter(c => c.suit === s);
            const vals = Array.from(new Set(sc.map(c => c.value))).sort((a, b) => a - b);
            for (let i = 0; i <= vals.length - 3; i++) {
                if (vals[i + 2] === vals[i] + 2) {
                    const comboCards = sc.filter(c => c.value >= vals[i] && c.value <= vals[i + 2]).slice(0, 3);
                    result.push({ cards: comboCards, score: 50, log: `Coleccionista: Combo Color-Escalera 3 (${s}) (+50 pts)` });
                }
            }
        });

        // 4. 3 of a Kind (+40 pts)
        for (let v = 1; v <= 10; v++) {
            const vc = numberCards.filter(c => c.value === v);
            if (vc.length >= 3) {
                result.push({ cards: vc.slice(0, 3), score: 40, log: `Coleccionista: Combo Trío de ${v} (+40 pts)` });
            } else if (vc.length === 2 && rares.length > 0) {
                result.push({ cards: [...vc.slice(0, 2), rares[0]], score: 40, log: `Coleccionista: Combo Trío de ${v} (con Comodín Rara) (+40 pts)` });
            }
        }

        // 5. Straight 3 (+30 pts)
        const allVals = Array.from(new Set(numberCards.map(c => c.value))).sort((a, b) => a - b);
        for (let i = 0; i <= allVals.length - 3; i++) {
            if (allVals[i + 2] === allVals[i] + 2) {
                const c1 = numberCards.find(c => c.value === allVals[i])!;
                const c2 = numberCards.find(c => c.value === allVals[i + 1])!;
                const c3 = numberCards.find(c => c.value === allVals[i + 2])!;
                result.push({ cards: [c1, c2, c3], score: 30, log: `Coleccionista: Combo Escalera 3 (${allVals[i]}-${allVals[i + 2]}) (+30 pts)` });
            }
        }

        // 6. Flush 3 (+20 pts)
        suits.forEach(s => {
            const sc = numberCards.filter(c => c.suit === s);
            if (sc.length >= 3) {
                result.push({ cards: sc.slice(0, 3), score: 20, log: `Coleccionista: Combo Color ${s} (+20 pts)` });
            } else if (sc.length === 2 && rares.length > 0) {
                result.push({ cards: [...sc.slice(0, 2), rares[0]], score: 20, log: `Coleccionista: Combo Color ${s} (con Comodín Rara) (+20 pts)` });
            }
        });

        return result;
    }
}
