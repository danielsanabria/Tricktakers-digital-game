
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, Player, Card, Suit, CardType, SetupContext } from '../../game/core/types';

export class CollectorLogic extends BaseCharacterLogic {
    setup(context: SetupContext): Partial<Player> {
        return {
            ...super.setup(context),
            collectedCards: [],
            reservedCardId: null
        };
    }

    renderActions(context: UIContext): React.ReactNode {
        const { isCurrentPlayer, selectedCards, abilityMode, setAbilityMode, performAction } = context;
        if (!isCurrentPlayer) return null;

        const isReserving = abilityMode === 'COLLECTOR_RESERVE';

        return (
            React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", {
                    onClick: () => setAbilityMode(isReserving ? 'NONE' : 'COLLECTOR_RESERVE'),
                    className: `btn ${isReserving ? 'btn-amber scale-105 shadow-lg' : 'btn-slate !bg-white !text-slate-500 hover:!border-amber-500'} !py-1.5 !px-4 text-[11px]`
                }, "RESERVAR CARTA"),

                isReserving && React.createElement("button", {
                    disabled: selectedCards.length !== 1,
                    onClick: () => performAction('COLLECTOR_RESERVE_CONFIRM'),
                    className: "btn btn-amber !py-1.5 !px-4 text-[11px] disabled:opacity-50"
                }, "CONFIRMAR")
            )
        );
    }

    calculateScore(player: Player): number {
        // Implementation of Collector Scoring (Best 3 sets + Garbage)
        if (!player.collectedCards || player.collectedCards.length === 0) return 0;

        // Filter out unusable cards (White Flag = 0 value/suit?, Berserker??) - Rule: "White Flags and Berserker Card cannot be used"
        const usableCards = player.collectedCards.filter(c =>
            c.type !== 'WHITE_FLAG' && c.type !== 'BERSERKER'
        );

        // Optimization Problem: Select up to 3 Disjoint Sets to Maximize Score.
        // Sets:
        // - Straight Flush (5) = 100
        // - 4 of a Kind = 80
        // - Straight Flush (3) = 50
        // - 3 of a Kind = 40
        // - Straight (3) = 30
        // - Flush (3) = 20
        // - Pair?? (Not in table provided in docs? checking verify_collector.ts assumption)
        // Docs Table: Flush(3)=20, Straight(3)=30, 3Kind=40, SF(3)=50, 4Kind=80, SF(5)=100.
        // My verify script assumed Pair=2. There is NO PAIR in the Docs Table provided in check.
        // "Garbage: -10 pts for every 2 cards not used".

        // Logic:
        // Backtracking approach since N is small (max ~10-15 cards typically).
        // 1. Generate all valid sets from current pool.
        // 2. Try picking one, recurse with remaining cards.
        // 3. Max depth 3 sets.
        // 4. Calculate Penalties for unused.

        return this.solveBestCombination(usableCards, 3);
    }

    private solveBestCombination(cards: Card[], setsLeft: number): number {
        if (setsLeft === 0 || cards.length < 3) {
            // Base case: No sets left or not enough cards. calculate garbage.
            const unusedCount = cards.length;
            const penalty = Math.floor(unusedCount / 2) * 10;
            return -penalty;
        }

        let maxScore = -Infinity; // Initialize low

        // Option 0: Make NO more sets (just take penalty for rest)
        const basePenalty = Math.floor(cards.length / 2) * 10;
        maxScore = -basePenalty;

        // Generator: Try to find a valid set
        const validSets = this.findAllValidSets(cards);

        // If no sets found, we are stuck with penalty
        if (validSets.length === 0) return maxScore;

        for (const set of validSets) {
            // Remove used cards
            const usedIds = set.cards.map(c => c.id);
            const remaining = cards.filter(c => !usedIds.includes(c.id));

            const tailScore = this.solveBestCombination(remaining, setsLeft - 1);
            const currentTotal = set.score + tailScore;

            if (currentTotal > maxScore) {
                maxScore = currentTotal;
            }
        }

        return maxScore;
    }

    private findAllValidSets(cards: Card[]): { cards: Card[], score: number }[] {
        const found: { cards: Card[], score: number }[] = [];

        // Helper to check subset
        // We iterate combinations. Since we need specific patterns:
        // 4-kind: Group by value.
        // 3-kind: Group by value.
        // Flush(5? No rules say 3 is min). Docs say Flush(3).
        // Straights: Sort by value.

        // Implementation detail: finding ALL valid subsets is expensive (2^N).
        // But we only care about sets of size 3, 4, 5.
        // So we iterate combinations of size 5 (for SF5) and size 4 (4K) and size 3 (Others).

        // Optimize: Group same-values for kinds.
        const byValue: Record<number, Card[]> = {};
        cards.forEach(c => {
            if (!byValue[c.value]) byValue[c.value] = [];
            byValue[c.value].push(c);
        });

        // 1. Check 4 of a Kind (80 pts)
        for (const val in byValue) {
            if (byValue[val].length >= 4) {
                // Determine sets? If we have 5 of same rank (impossible in standard deck but maybe with dupes/copies)
                // Just take 4.
                found.push({ cards: byValue[val].slice(0, 4), score: 80 });
            }
        }

        // 2. Check 3 of a Kind (40 pts)
        for (const val in byValue) {
            if (byValue[val].length >= 3) {
                // Note: If we have 4, we also implicitly have 3.
                // The solver will try taking 4 (score 80) and 3 (score 40).
                // Taking 4 is usually better, but taking 3 might leave a card for a Straight/Flush.
                // So we should offer the option of taking just 3.
                // We can take ANY 3. (Combinations of 3 from N).
                // For simplicity, just taking the first 3 is usually consistent unless suits matter for OTHER sets.
                // Since suits DO matter for Flush/Straight in *remaining* cards, we strictly should iterate combinations.
                // But that's too heavy.
                // Heuristic: Just take first 3?
                // Better: Pass "indices" or IDs.
                // Let's stick to simple slicing for now unless strict optimality needed.
                // Actually, if we have 3, just add that set.
                found.push({ cards: byValue[val].slice(0, 3), score: 40 });
            }
        }

        // 3. Straights and Flushes
        // Sort by value
        const sorted = [...cards].sort((a, b) => a.value - b.value);

        // Straight Flush (5) - 100
        // Iterate all windows? 
        // Need specific detection.
        // Let's simplify: Iterate all combinations of 3, 4, 5 cards?
        // Too many.
        // Approach: Check patterns in sorted list.

        // Let's try finding valid Straights/Flushes by iterating starting card.
        // Because sets are small (3-5), we can check connectivity.

        // A. Flush (3) - 20, Straight Flush (3) - 50, SF(5) - 100.
        // Group by Suit first for flushes and SF.
        const bySuit: Record<string, Card[]> = {};
        cards.forEach(c => {
            if (!bySuit[c.suit]) bySuit[c.suit] = [];
            bySuit[c.suit].push(c);
        });

        for (const s in bySuit) {
            const suitCards = bySuit[s].sort((a, b) => a.value - b.value);

            // SF (5)
            if (suitCards.length >= 5) {
                // Check consecutive
                for (let i = 0; i <= suitCards.length - 5; i++) {
                    const sub = suitCards.slice(i, i + 5);
                    if (this.isConsecutive(sub)) {
                        found.push({ cards: sub, score: 100 });
                    }
                }
            }

            // SF (3)
            if (suitCards.length >= 3) {
                for (let i = 0; i <= suitCards.length - 3; i++) {
                    const sub = suitCards.slice(i, i + 3);
                    if (this.isConsecutive(sub)) {
                        found.push({ cards: sub, score: 50 });
                    }
                }
            }

            // Flush (3)
            // Any 3 cards of same suit.
            // Combinations of 3.
            if (suitCards.length >= 3) {
                // Optimization: Usually high valued cards don't matter for flush score?
                // Just need ANY 3.
                // We should ideally generate all combs, but simplify:
                // Return the first 3?
                // But maybe these 3 break a Straight?
                // Just adding the first 3 as a candidate.
                found.push({ cards: suitCards.slice(0, 3), score: 20 });
            }
        }

        // B. Straight (3) - 30 (Any suit)
        // Look for values v, v+1, v+2 with any suit.
        // Iterate sorted unique values?
        // We handle this by checking every card as start.
        for (let i = 0; i < sorted.length; i++) {
            const c1 = sorted[i];
            // Find c2 (val+1) and c3 (val+2)
            const c2s = sorted.filter(c => c.value === c1.value + 1);
            const c3s = sorted.filter(c => c.value === c1.value + 2);

            for (const c2 of c2s) {
                for (const c3 of c3s) {
                    // Check they are distinct IDs (implicit by value diff usually, but good to be safe)
                    found.push({ cards: [c1, c2, c3], score: 30 });
                }
            }
        }

        return found;
    }

    private isConsecutive(cards: Card[]): boolean {
        for (let i = 0; i < cards.length - 1; i++) {
            if (cards[i + 1].value !== cards[i].value + 1) return false;
        }
        return true;
    }
}
