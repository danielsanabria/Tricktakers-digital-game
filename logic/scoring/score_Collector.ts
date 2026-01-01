import { Player, Suit, Card, CardType } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';

export class CollectorScoring extends BaseScoring {
    getScore(player: Player): ScoringResult {
        const wonCards = player.collectedCards || [];
        if (wonCards.length === 0) return { score: 0, isInstantWin: false, logs: ["Coleccionista: No recolectó cartas."] };

        const logs: string[] = [];

        // Rule: Straight Flush of 9 = Instant Win (Gran Colección)
        const checkInstantWin = () => {
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
            return { score: 999, isInstantWin: true, logs: ["¡Coleccionista: GRAN COLECCIÓN! Victoria Instantánea."] };
        }

        let remainingCards = [...wonCards];
        let totalScore = 0;
        let combosFound = 0;

        const takeCards = (comboCards: Card[]) => {
            comboCards.forEach(cc => {
                const idx = remainingCards.findIndex(rc => rc.id === cc.id);
                if (idx !== -1) remainingCards.splice(idx, 1);
            });
            combosFound++;
        };

        const getRare = () => remainingCards.find(c => c.type === CardType.RARE);

        while (combosFound < 3) {
            let found = false;

            // 1. Straight Flush 5 (+100)
            for (const s of [Suit.RED, Suit.BLUE, Suit.GREEN, Suit.BLACK]) {
                const sc = remainingCards.filter(c => c.suit === s && c.type === CardType.NUMBER);
                const vals = Array.from(new Set(sc.map(c => c.value))).sort((a, b) => a - b);
                for (let i = 0; i <= vals.length - 5; i++) {
                    if (vals[i + 4] === vals[i] + 4) {
                        const combo = sc.filter(c => c.value >= vals[i] && c.value <= vals[i + 4]).slice(0, 5);
                        totalScore += 100; logs.push("Coleccionista: Combo Color-Escalera 5 (+100 pts)");
                        takeCards(combo); found = true; break;
                    }
                }
                if (found) break;
            }
            if (found) continue;

            // 2. 4 of a Kind (+80)
            for (let v = 1; v <= 10; v++) {
                const vc = remainingCards.filter(c => c.value === v && (c.type === CardType.NUMBER || c.id === 'BLACK-7'));
                if (vc.length >= 4) {
                    totalScore += 80; logs.push(`Coleccionista: Combo Póker de ${v} (+80 pts)`);
                    takeCards(vc.slice(0, 4)); found = true; break;
                } else if (vc.length === 3 && getRare()) {
                    totalScore += 80; logs.push(`Coleccionista: Combo Póker de ${v} (con Rara) (+80 pts)`);
                    takeCards([...vc, getRare()!]); found = true; break;
                }
            }
            if (found) continue;

            // 3. Straight Flush 3 (+50)
            for (const s of [Suit.RED, Suit.BLUE, Suit.GREEN, Suit.BLACK]) {
                const sc = remainingCards.filter(c => c.suit === s && c.type === CardType.NUMBER);
                const vals = Array.from(new Set(sc.map(c => c.value))).sort((a, b) => a - b);
                for (let i = 0; i <= vals.length - 3; i++) {
                    if (vals[i + 2] === vals[i] + 2) {
                        const combo = sc.filter(c => c.value >= vals[i] && c.value <= vals[i + 2]).slice(0, 3);
                        totalScore += 50; logs.push("Coleccionista: Combo Color-Escalera 3 (+50 pts)");
                        takeCards(combo); found = true; break;
                    }
                }
                if (found) break;
            }
            if (found) continue;

            // 4. 3 of a Kind (+30)
            for (let v = 1; v <= 10; v++) {
                const vc = remainingCards.filter(c => c.value === v && (c.type === CardType.NUMBER || v === 7));
                if (vc.length >= 3) {
                    totalScore += 30; logs.push(`Coleccionista: Combo Trío de ${v} (+30 pts)`);
                    takeCards(vc.slice(0, 3)); found = true; break;
                }
            }
            if (found) continue;

            // 5. Straight 3 (+20)
            const allVals = Array.from(new Set(remainingCards.filter(c => c.type === CardType.NUMBER).map(c => c.value))).sort((a, b) => a - b);
            for (let i = 0; i <= allVals.length - 3; i++) {
                if (allVals[i + 2] === allVals[i] + 2) {
                    const combo = [
                        remainingCards.find(c => c.value === allVals[i])!,
                        remainingCards.find(c => c.value === allVals[i + 1])!,
                        remainingCards.find(c => c.value === allVals[i + 2])!
                    ];
                    totalScore += 20; logs.push("Coleccionista: Combo Escalera 3 (+20 pts)");
                    takeCards(combo); found = true; break;
                }
            }
            if (found) continue;

            // 6. Flush 3 (+20)
            for (const s of [Suit.RED, Suit.BLUE, Suit.GREEN, Suit.BLACK]) {
                const sc = remainingCards.filter(c => c.suit === s && c.type === CardType.NUMBER);
                if (sc.length >= 3) {
                    totalScore += 20; logs.push(`Coleccionista: Combo Color ${s} (+20 pts)`);
                    takeCards(sc.slice(0, 3)); found = true; break;
                }
            }
            if (found) continue;

            break; // No more combos possible or found
        }

        // Penalty: -10 per 2 unused cards
        const unusedPenalty = Math.floor(remainingCards.length / 2) * 10;
        if (unusedPenalty > 0) {
            totalScore -= unusedPenalty;
            logs.push(`Coleccionista: Penalización por basura (${remainingCards.length} cartas) (-${unusedPenalty} pts)`);
        }

        return { score: totalScore, isInstantWin: false, logs };
    }
}
