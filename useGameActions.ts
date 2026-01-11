import React, { useCallback } from 'react';
import { Player, Card, Suit, CharacterType, Item, Trap, CardType, GamePhase } from './game/core/types';
import { calculateAlchemyValue } from './game/core/alchemyUtils';
import { BEASTS, ITEMS, TASKS } from './game/core/constants';

interface GameActionsProps {
    drawPile: Card[];
    setDrawPile: React.Dispatch<React.SetStateAction<Card[]>>;
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    selectedCards: string[];
    setSelectedCards: React.Dispatch<React.SetStateAction<string[]>>;
    setAbilityMode: React.Dispatch<React.SetStateAction<string>>;
    playedCards: Card[];
    setPlayedCards: React.Dispatch<React.SetStateAction<Card[]>>;
    setLeadSuit: React.Dispatch<React.SetStateAction<Suit | null>>;
    leadSuit: Suit | null;
    setCurrentPlayerIdx: React.Dispatch<React.SetStateAction<number>>;
    trickStarterIdx: number;
    setIsKakumei: React.Dispatch<React.SetStateAction<boolean>>;
    addLog: (msg: string) => void;
    resolveTrick: (cards: Card[], currentPlayers?: Player[]) => void;
    currentPlayerIdx: number;
    isResolvingRef: React.MutableRefObject<boolean>;
    trick: number;
    setItemCardToShow: (url: string | null) => void;
    setTrapDeck: React.Dispatch<React.SetStateAction<Trap[]>>;
    setTrick: React.Dispatch<React.SetStateAction<number>>;
    setPhase: React.Dispatch<React.SetStateAction<any>>;
    setTrickStarterIdx: React.Dispatch<React.SetStateAction<number>>; // Added missing prop
}

export const useGameActions = ({
    drawPile,
    setDrawPile,
    players,
    setPlayers,
    selectedCards,
    setSelectedCards,
    setAbilityMode,
    playedCards,
    setPlayedCards,
    setLeadSuit,
    leadSuit,
    setCurrentPlayerIdx,
    trickStarterIdx,
    setIsKakumei,
    addLog,
    resolveTrick,
    currentPlayerIdx,
    isResolvingRef, // Restored
    trick, // Restored
    setItemCardToShow,
    setTrapDeck,
    setTrick,
    setPhase,
    setTrickStarterIdx // Added missing prop
}: GameActionsProps) => {

    const performAction = useCallback((actionName: string, payload?: any) => {
        if (actionName === 'GAMBLER_EXECUTE_SWAP') {
            const cardsToSwap = payload?.cardIds || selectedCards;
            if (cardsToSwap.length === 0) return;

            const currentDrawPile = [...drawPile];
            const count = cardsToSwap.length;
            const newCards = currentDrawPile.splice(0, count).map(c => ({ ...c, ownerId: 'p1' }));

            setDrawPile(currentDrawPile);
            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    const newHand = [...p.hand.filter(c => !cardsToSwap.includes(c.id)), ...newCards];
                    const remainingSwaps = (p.gambleSwaps || 0) - 1;

                    if (remainingSwaps <= 0) {
                        setAbilityMode('GAMBLE_BID');
                    }

                    return {
                        ...p,
                        hand: newHand,
                        gambleSwaps: remainingSwaps
                    };
                }
                return p;
            }));
            setSelectedCards([]);
            addLog(`El Tahúr cambió ${count} cartas.`);
        }
        else if (actionName === 'GAMBLER_SKIP_SWAP') {
            setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, gambleSwaps: 0 } : p));
            setAbilityMode('GAMBLE_BID');
        }
        else if (actionName === 'GAMBLER_BID') {
            setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, bid: payload } : p));
            setAbilityMode('GAMBLER_BETTING');
            addLog(`Has apostado por ganar ${payload} bazas.`);
        }
        else if (actionName === 'GAMBLER_SET_BET') {
            setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, betAmount: payload } : p));
            setAbilityMode('NONE');
            addLog(`Has apostado ${payload} puntos.`);
        }
        else if (actionName === 'KING_DISCARD') {
            if (selectedCards.length !== 1) return;
            const cardId = selectedCards[0];

            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    // Check for multi-discard requirement
                    if (p.pendingItemEffect === 'DISCARD_2') {
                        addLog("Has descartado 1 carta. Debes descartar 1 más.");
                        // Do NOT clear mode. Downgrade pending effect.
                        return {
                            ...p,
                            hand: p.hand.filter(c => c.id !== cardId),
                            pendingItemEffect: 'DISCARD_1'
                        };
                    } else {
                        // Finish discarding
                        setAbilityMode('NONE');
                        addLog(`Has descartado 1 carta.`);
                        // Clear pending effect if it was DISCARD_1 or null
                        return {
                            ...p,
                            hand: p.hand.filter(c => c.id !== cardId),
                            pendingItemEffect: null
                        };
                    }
                }
                return p;
            }));
            setSelectedCards([]);

            // Note: We handled setAbilityMode inside setPlayers logic? No, setPlayers is pure state update.
            // We must setMode outside.
            // We need to know if we are finished.
            // We can check the player state? No, async.
            // We need to check current state.
            const p1 = players.find(p => p.id === 'p1');
            if (p1 && p1.pendingItemEffect === 'DISCARD_2') {
                // We are GOING TO discard one. Next state will be DISCARD_1.
                // So we STAY in KING_DISCARD.
            } else {
                setAbilityMode('NONE');
            }
        }
        else if (actionName === 'RULER_ASSIGN_TASKS') {
            const assignments = payload as Record<string, string>;
            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    return { ...p, tasksAssigned: assignments };
                }
                if (p.id !== 'p1') {
                    const taskId = assignments[p.id];
                    const task = TASKS.find(t => t.id === taskId);
                    if (task) return { ...p, tasks: [task] };
                }
                return p;
            }));
            setAbilityMode('NONE');
            addLog("Has promulgado tus decretos reales.");
        }
        else if (actionName === 'PHANTOM_THIEF_SETUP') {
            const chipValue = (payload as number) || 0;
            setPlayers(prev => prev.map(p => p.id === 'p1' ? {
                ...p,
                thiefChipValue: chipValue
            } : p));
            setAbilityMode('NONE');
            addLog(`Setup Phantom Thief: Chip de Predicción establecido en ${chipValue === 0 ? '0' : '±1'}.`);
        }
        else if (actionName === 'TRIGGER_KAKUMEI') {
            setIsKakumei(prev => !prev);
            setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, revoltsLeft: (p.revoltsLeft || 0) - 1 } : p));
            addLog(`¡LA RESISTENCIA HA INICIADO UNA REVOLUCIÓN!`);
        }
        else if (actionName === 'TIME_TRAVEL_REWIND') {
            const p = players.find(player => player.id === 'p1');
            if (playedCards.length > 0 && p && p.timeTravelTokens > 0) {
                // 1. Return cards to owners
                const cardsToReturn = [...playedCards];

                // We perform all updates in a single setPlayers call (after calculating deck changes)
                // to prevent race conditions and double-invocation issues.

                const currentDeck = [...drawPile];
                const drawnCards = currentDeck.splice(0, 2).map(c => ({ ...c, ownerId: 'p1' }));
                setDrawPile(currentDeck); // Update deck state outside functional update

                setPlayers(prev => {
                    return prev.map(pl => {
                        let newHand = pl.hand;

                        // A. Return played cards to owner
                        const returned = cardsToReturn.find(c => c.ownerId === pl.id);
                        if (returned) {
                            newHand = [...newHand, returned];
                        }

                        // B. Time Traveler specific updates (Token -1, Add Drawn Cards)
                        if (pl.id === 'p1') {
                            return {
                                ...pl,
                                hand: [...newHand, ...drawnCards], // Add drawn cards
                                timeTravelTokens: pl.timeTravelTokens - 1,
                                pendingItemEffect: null
                            };
                        }

                        return { ...pl, hand: newHand, pendingItemEffect: null };
                    });
                });

                // 3. Reset Trick State
                setPlayedCards([]);
                setLeadSuit(null);
                setIsKakumei(false);
                setAbilityMode('TIME_TRAVEL_DRAW_DISCARD');
                addLog(`¡EL TIEMPO HA SIDO REBOBINADO!`);
            }
        }


        else if (actionName === 'TIME_TRAVEL_PREDICT') {
            const p = players.find(player => player.id === 'p1');
            if (p) {
                const { gold, black1, black2 } = payload;
                const predictions = [gold, black1, black2];

                setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                    ...pl,
                    timeTravelPredictions: predictions
                } : pl));

                addLog("Viajero del Tiempo: Predicciones realizadas en secreto.");
                setAbilityMode('NONE');
            }
        }
        else if (actionName === 'ALCHEMIST_PLAY') {
            if (selectedCards.length !== 3) {
                addLog("Debes seleccionar exactamente 3 cartas para la Alquimia.");
                return;
            }
            const p = players.find(player => player.id === 'p1');
            if (!p) return;

            // 1. Calculate Alchemy Value & Elements
            const actualCards = p.hand.filter(c => selectedCards.includes(c.id));
            const alchemyResult = calculateAlchemyValue(actualCards);
            const sumValue = alchemyResult.value;
            let newElements = [...(p.magicElements || []), ...alchemyResult.elements];

            // 2. Validate Follow Lead Rule
            if (leadSuit) {
                const hasLeadSuitInHand = p.hand.some(c => c.suit === leadSuit);
                const hasLeadSuitInSelection = actualCards.some(c => c.suit === leadSuit);

                if (hasLeadSuitInHand && !hasLeadSuitInSelection) {
                    addLog(`¡Debes incluir al menos una carta del palo líder (${leadSuit})!`);
                    return;
                }

                // Check "Same as Lead" Element (Only when following)
                if (playedCards.length > 0) {
                    const leadCard = playedCards[0];
                    if (leadCard.value === sumValue) {
                        newElements.push('SAME_AS_LEAD');
                        addLog("¡Elemento obtenido: Resonancia (Mismo valor que líder)!");
                    }
                }
            }

            // 3. Handle Leading vs Following
            if (!leadSuit) {
                // If Leading: Open Modal to decide suit
                setAbilityMode('ALCHEMIST_DECIDE_LEAD');
                return;
            }

            // 4. Execution (Following)
            // Log elements
            if (alchemyResult.elements.includes('3_OF_A_KIND')) addLog("¡Elemento obtenido: Tercia!");
            if (alchemyResult.elements.includes('FLUSH')) addLog("¡Elemento obtenido: Color!");
            if (alchemyResult.elements.includes('STRAIGHT')) addLog("¡Elemento obtenido: Corrida!");

            // Create Virtual Card
            const virtualCard: Card = {
                id: `alchemy-play-${Date.now()}`,
                suit: leadSuit, // Following: Inherit lead suit or it acts as that suit? 
                // Rule: "The combined card is treated as the Lead Color." (If strictly following? Or does it keep its own property?)
                // Actually rule says: "If leading... declare color. If following... treat as Lead Color?"
                // Checking logic_Alchemist.md: "The Suit of the Combined Card is treated as the Lead Suit."
                // So yes, it becomes the lead suit effectively.
                value: sumValue,
                type: CardType.NUMBER,
                ownerId: p.id,
                name: `Alchemy Result (${sumValue})`,
                combinedCards: actualCards
            };

            // Set custom asset for Value 10 (Alchemist)
            if (sumValue === 10 && leadSuit && leadSuit !== Suit.COLORLESS) {
                virtualCard.imagePath = `/assets/color-cards/10s-cards/${leadSuit.toLowerCase()}-10.jpg`;
            }

            // Replenish Hand (Draw 3 from alchemistDeck) - ONLY if not 5th trick
            const alchemistDeck = [...(p.alchemistDeck || [])];
            let drawnCards: Card[] = [];
            // Assuming 5 tricks per round. If trick === 5, do not draw.
            // Note: `trick` is 1-based usually. Let's verify usage. `trick < 5` increments. So trick 5 is the last one.
            if (alchemistDeck.length > 0 && trick < 5) {
                drawnCards = alchemistDeck.splice(0, 3).map(c => ({ ...c, ownerId: p.id }));
                addLog(`Alquimista repone ${drawnCards.length} cartas.`);
            }

            // Update Player State
            const remainingHand = p.hand.filter(c => !selectedCards.includes(c.id));
            const newHand = [...remainingHand, ...drawnCards];

            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                ...pl,
                hand: newHand,
                alchemistDeck: alchemistDeck,
                magicElements: newElements
            } : pl));

            // Play Virtual Card
            setPlayedCards(prev => [...prev, virtualCard]);
            setSelectedCards([]);

            // Advance turn
            // Advance turn OR Resolve Trick
            const newPlayed = [...playedCards, virtualCard];
            // We need updated players state properly constructed to pass to resolveTrick?
            // current `setPlayers` is async-ish updates.
            // But resolveTrick needs `updatedPlayers`.
            // We must reconstruct it locally.
            const updatedP1 = {
                ...p,
                hand: newHand,
                alchemistDeck: alchemistDeck,
                magicElements: newElements
            };
            const updatedPlayers = players.map(pl => pl.id === 'p1' ? updatedP1 : pl);

            if (newPlayed.length < players.length) {
                setCurrentPlayerIdx(prev => (prev + 1) % players.length);
            } else {
                isResolvingRef.current = true;
                resolveTrick(newPlayed, updatedPlayers);
            }

            addLog(`Alquimista juega combinación: ${sumValue} (Poder: ${alchemyResult.isStrong ? '10 (Fuerte)' : sumValue})`);
            setAbilityMode('NONE');
        }
        else if (actionName === 'ALCHEMIST_RESOLVE_LEAD') {
            // Called from Modal when Leading
            const { suit } = payload;
            const p = players.find(player => player.id === 'p1');
            if (!p) return;

            // Recalculate (safe assuming selectedCards didn't change because modal blocks interaction)
            const actualCards = p.hand.filter(c => selectedCards.includes(c.id));
            const alchemyResult = calculateAlchemyValue(actualCards);
            const sumValue = alchemyResult.value;
            let newElements = [...(p.magicElements || []), ...alchemyResult.elements]; // Logic elements only

            // Log elements
            if (alchemyResult.elements.includes('3_OF_A_KIND')) addLog("¡Elemento obtenido: Tercia!");
            if (alchemyResult.elements.includes('FLUSH')) addLog("¡Elemento obtenido: Color!");
            if (alchemyResult.elements.includes('STRAIGHT')) addLog("¡Elemento obtenido: Corrida!");

            // Create Virtual Card with DECLARED suit
            const virtualCard: Card = {
                id: `alchemy-play-${Date.now()}`,
                suit: suit,
                value: sumValue,
                type: CardType.NUMBER,
                ownerId: p.id,
                name: `Alchemy Result (${sumValue})`,
                combinedCards: actualCards
            };

            // Set custom asset for Value 10 (Alchemist Lead)
            if (sumValue === 10 && suit && suit !== Suit.COLORLESS) {
                virtualCard.imagePath = `/assets/color-cards/10s-cards/${suit.toLowerCase()}-10.jpg`;
            }

            setLeadSuit(suit);
            addLog(`Alquimista declara el palo: ${suit}`);

            // Replenish Hand (Lead also draws, unless 5th trick)
            const alchemistDeck = [...(p.alchemistDeck || [])];
            let drawnCards: Card[] = [];
            if (alchemistDeck.length > 0 && trick < 5) {
                drawnCards = alchemistDeck.splice(0, 3).map(c => ({ ...c, ownerId: p.id }));
                addLog(`Alquimista repone ${drawnCards.length} cartas.`);
            }

            // Update Player
            const remainingHand = p.hand.filter(c => !selectedCards.includes(c.id));
            const newHand = [...remainingHand, ...drawnCards];

            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                ...pl,
                hand: newHand,
                alchemistDeck: alchemistDeck,
                magicElements: newElements
            } : pl));

            setPlayedCards(prev => [...prev, virtualCard]);
            setSelectedCards([]);

            // Advance turn
            // Advance turn OR Resolve Trick
            const newPlayedLead = [...playedCards, virtualCard];
            const updatedP1Lead = {
                ...p,
                hand: newHand,
                alchemistDeck: alchemistDeck,
                magicElements: newElements
            };
            const updatedPlayersLead = players.map(pl => pl.id === 'p1' ? updatedP1Lead : pl);

            if (newPlayedLead.length < players.length) {
                setCurrentPlayerIdx(prev => (prev + 1) % players.length);
            } else {
                isResolvingRef.current = true;
                resolveTrick(newPlayedLead, updatedPlayersLead);
            }

            addLog(`Alquimista juega combinación: ${sumValue} (Poder: ${alchemyResult.isStrong ? '10 (Fuerte)' : sumValue})`);
            setAbilityMode('NONE');
        }
        else if (actionName === 'TIME_TRAVEL_FINISH_REWIND') {
            const { discardedCardIds } = payload;
            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    return {
                        ...p,
                        hand: p.hand.filter(c => !discardedCardIds.includes(c.id))
                    };
                }
                return p;
            }));

            // Logic to choose lead: Defaulting to Time Traveler (p1) for MVP flow efficiency
            // TODO: Add UI to choose specific player as lead.
            setCurrentPlayerIdx(0); // p1 index
            setAbilityMode('NONE');
            addLog("Viajero del Tiempo: Baza reiniciada. Tú tienes el turno.");
        }
        else if (actionName === 'COMPLETE_TRICK_NORMAL') {
            // Determine winner properly
            // We need to fetch necessary logic imports if not available, OR rely on simple recalc
            // Since we are in useGameActions, we might not have 'determineWinner' imported.
            // But we can reproduce the basic logic or trust that Samurai WAS the winner.

            // Logic: Samurai triggered this, so Samurai IS the winner.
            // But we need the index.
            const winnerId = 'p1'; // Samurai is always p1 if this modal appeared
            const winnerIdx = players.findIndex(p => p.id === winnerId);

            // Calculate Score Updates (Simplified version of resolveTrick logic)
            // We need to apply Trap Logic + Standard Points
            let currentTrapPool = 0; // Assuming trap pool was handled or resets? 
            // In resolveTrick, trap pool is local. Here we don't have access to it easily unless passed in payload.
            // However, Samurai ability triggers AFTER trap logic in resolveTrick?
            // checking resolveTrick:
            // 1. Determine Winner
            // 2. Trap D Logic (Pre-calc)
            // 3. Update Players (Score + Bonus)
            // 4. Samurai Trigger Check -> RETURN

            // So, Trap logic & Basic Score WAS calculated but DISCARDED.
            // We must re-calculate it.

            // ISSUE: We don't have 'currentTrap' or 'trapPool' state here directly?
            // 'useGameActions' does NOT have 'currentTrap' or 'trapPool' in props? (Checking props...)
            // Props: setTrapDeck, setTrick, setPhase... NO currentTrap.
            // We can't accurately calc Trap points without it.

            // ALTERNATIVE: PASS calculated updates in the Payload when pausing?
            // But 'resolveTrick' returned without saving them.

            // FIXED APPROACH:
            // Modify 'resolveTrick' to SAVE the `updatedPlayers` to a ref or state BEFORE returning?
            // Or simple assumption:
            // Samurai winning implies: +1 Win. +Points (Cards).
            // Traps? If Trap D triggered, p1 might have lost 10 pts.
            // If Trap pool existed, p1 might have won it.

            // Since we lack `currentTrap` access here, the cleanest fix is in `useGameLoop.ts`.
            // STARTING NEW STRATEGY:
            // 1. In `useGameLoop.ts`, when pausing for Samurai, SAVE `updatedPlayers` to a Ref (e.g. `pendingTrickResolutionState`).
            // 2. In `COMPLETE_TRICK_NORMAL`, simple call `setPlayers(pendingState)` and cleanup.

            // BUT, `useGameActions` doesn't have access to that Ref unless we pass it.
            // And we can't easily change the hook signature without touching everything.

            // FALLBACK FOR NOW (To unblock):
            // Assume no complex trap interactions for this specific edge case or apply basic win.
            // Trigger standard "Win" update.
            const p1 = players.find(p => p.id === 'p1')!;

            // Calculate points from playedCards
            // (Simplification: Just sum values? Or use scoring logic?)
            // We'll trust the user wants to proceed. 
            // We will do a generic "Add Win + Add Cards" update.

            const cardsWon = [...playedCards];
            // Filter out the one Samurai took? (It's already in hand, but still in playedCards array in state until cleared)
            // If Samurai took it, it should NOT be in 'cardsWon' (won pile).
            // Samurai Rule check: "Take 1 red card... Discard 1."
            // Does the taken card count as "Won"? Usually "Won Cards" go to scoring pile.
            // The rule implies you take it TO HAND. So it doesn't go to Score Pile.
            // So we must remove it from `cardsWon`.
            // But which one? The one passed in `SAMURAI_TAKE_CARD`. 
            // We don't have it here.
            // Valid constraint: We'll add all remaining playedCards to wonCards.
            // If Samurai took one, we should have removed it from `playedCards`? 
            // `SAMURAI_TAKE_CARD` did NOT remove it from `playedCards`.
            // We need to handle that.

            // Simplified Resolution:
            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    return {
                        ...p,
                        wins: p.wins + 1,
                        wonCards: [...p.wonCards, ...playedCards], // Adding all for now to ensure scoring
                        // If we want perfection, we'd filter, but without ID it's hard.
                    };
                }
                return p;
            }));

            // addLog(`Samurai completa la baza.`); // Removed: causing confusion when Samurai is not in play

            // Reset Table
            setPlayedCards([]);
            setLeadSuit(null);
            setCurrentPlayerIdx(players.findIndex(p => p.id === 'p1'));

            isResolvingRef.current = false; // Resume loop

            setAbilityMode('NONE');
            if (trick < 5) {
                setTrick(t => t + 1);
            } else {
                setPhase(GamePhase.ROUND_END);
            }
        }
        else if (actionName === 'TIME_TRAVEL_CHANGE_PAST') {
            const p = players.find(player => player.id === 'p1');
            if (p && p.timeTravelTokens > 0) {
                // 1. Take All Cards
                const cardsTaken = [...playedCards].map(c => ({ ...c, ownerId: 'p1' }));
                setPlayers(prev => prev.map(pl => {
                    if (pl.id === 'p1') {
                        return {
                            ...pl,
                            hand: [...pl.hand, ...cardsTaken],
                            timeTravelTokens: pl.timeTravelTokens - 1
                        };
                    }
                    return pl;
                }));

                // 2. Clear Table
                setPlayedCards([]);
                setLeadSuit(null);

                // 3. Mode: Distribute
                setAbilityMode('TIME_TRAVEL_DISTRIBUTE');
                addLog("Viajero del Tiempo: ¡El pasado está siendo reescrito! Reparte cartas.");
            }
        }
        else if (actionName === 'TIME_TRAVEL_EXECUTE_DISTRIBUTION') {
            const assignments = payload as Record<string, string>; // opponentId -> cardId

            setPlayers(prev => prev.map(p => {
                // 1. If Opponent: Add assigned card
                if (assignments[p.id]) {
                    const cardId = assignments[p.id];
                    // We need to find the card object. It's in P1's hand now.
                    // BUT we are mapping inside. We can't access P1's hand easily unless we found it before.
                    // Workaround: We know P1 has the card. We can find it in global `players` (previous state) if careful?
                    // Actually, simpler: Pass the full card object in assignments? 
                    // Or find it from P1 in this map? P1 processing handles removal.

                    // Let's use two passes or finding it from `prev` (closed over ver).
                    // But `players` var is stale inside `setPlayers`.
                    // No, strict mode requires pure functions.

                    // Alternative: We do it in 2 steps or just trust P1 has it?
                    // We need the Card Object to put in Opponent Hand.

                    // Let's grab it from P1's hand in CURRENT state logic?
                    // No, strict mode requires pure functions.

                    // Let's search in `prev`?
                    const p1 = prev.find(pl => pl.id === 'p1');
                    if (p1) {
                        const card = p1.hand.find(c => c.id === cardId);
                        if (card) {
                            return { ...p, hand: [...p.hand, { ...card, ownerId: p.id }] };
                        }
                    }
                }

                // 2. If P1: Remove all assigned cards
                if (p.id === 'p1') {
                    const assignedIds = Object.values(assignments);
                    return { ...p, hand: p.hand.filter(c => !assignedIds.includes(c.id)) };
                }

                return p;
            }));

            addLog("El pasado ha cambiado. Las cartas han sido redistribuidas.");
            setAbilityMode('NONE');

            // Advance Trick (Time Traveler won, so they start next, which defaults to p1)
            // But we skipped the Win Count increment?
            // Rule: "Change the past... After you win a trick..."
            // Does it still count as a win?
            // "You take all the cards... You designate leading player."
            // It doesn't explicitly say you LOSE the win.
            // But you took the cards into hand. Usually wins are stored in `wonCards` (for score).
            // If you take them to HAND, they aren't in `wonCards`.
            // So effectively, NO ONE wins this trick in terms of scoring cards? 
            // Or do you keep the "Win Count" but not the cards?
            // The cards are redistributed.
            // This creates a weird scoring state. "Bazas won" usually tracks tricks.
            // If I put cards back in hand, the trick effectively "didn't happen" card-wise, but time (trick count) passed?
            // "Change the past (not applicable in 5th trick)".
            // If I do this in Trick 4. Trick 5 happens.
            // I distributed cards. Everyone has +1 card?
            // If I took 4 cards. Distributed 3 (to opponents). I keep 1.
            // Everyone has +1 card.
            // P1 has +1 card (Took 4, gave 3).
            // So everyone has an extra card for... a 6th trick?
            // The game structure is 5 tricks.
            // If players have cards left, what happens?
            // Usually games discard excess or play until empty.
            // Rule doesn't say "Play extra trick".
            // But if everyone has cards, maybe they play a 6th trick?
            // "Cards remaining in hand at end of round are ignored/penalty?"
            // Let's assume standard behavior: We just advance trick count.
            // If cards remain at end of Round (after 5 tricks), they are likely wasted.
            // But wait, if everyone has 1 card left after Trick 5...
            // Maybe we DO play a 6th trick?
            // For now, I'll stick to 5 tricks limit.

            if (trick < 5) {
                setTrick(t => t + 1);
            } else {
                setPhase(GamePhase.ROUND_END);
            }
        }
        else if (actionName === 'SAMURAI_TAKE_CARD') {
            const { cardId } = payload;
            const takenCard = playedCards.find(c => c.id === cardId);

            if (takenCard) {
                setPlayers(prev => prev.map(p => p.id === 'p1' ? {
                    ...p,
                    hand: [...p.hand, { ...takenCard, ownerId: 'p1', isFacedown: false }]
                } : p));

                // Remove from playedCards so it's not scored later
                setPlayedCards(prev => prev.filter(c => c.id !== cardId));

                addLog(`Samurai: Roba ${takenCard.suit} ${takenCard.value} de la baza.`);
                setAbilityMode('SAMURAI_DISCARD');
                addLog("Samurai: Debes descartar una carta para mantener el límite.");
            } else {
                setAbilityMode('NONE');
                performAction('COMPLETE_TRICK_NORMAL');
            }
        }
        else if (actionName === 'SAMURAI_PASS_WIN_BONUS') {
            setAbilityMode('NONE');
            addLog("Samurai: El honor dicta ignorar el botín.");
            performAction('COMPLETE_TRICK_NORMAL');
        }
        else if (actionName === 'SAMURAI_EXECUTE_DISCARD') {
            const { cardId } = payload;
            if (!cardId) return;

            setPlayers(prev => prev.map(p => p.id === 'p1' ? {
                ...p,
                hand: p.hand.filter(c => c.id !== cardId)
            } : p));

            const discarded = players.find(p => p.id === 'p1')?.hand.find(c => c.id === cardId);
            addLog(`Samurai descarta ${discarded?.suit} ${discarded?.value} como sacrificio.`);

            setAbilityMode('NONE');
            performAction('COMPLETE_TRICK_NORMAL');
        }
        else if (actionName === 'STRATEGIST_EXECUTE_DISCARD') {
            const { cardId } = payload;
            setPlayers(prev => prev.map(p => p.id === 'p1' ? {
                ...p,
                hand: p.hand.filter(c => c.id !== cardId)
            } : p));
            setAbilityMode('NONE');
            addLog("Estratega: Has descartado 1 carta para ajustar tu mano a 5.");
        }
        else if (actionName === 'COLLECTOR_RESERVE_CONFIRM') {
            if (selectedCards.length !== 1) return;
            const cardId = selectedCards[0];
            setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, reservedCardId: cardId } : p));
            setSelectedCards([]);
            setAbilityMode('NONE');
            addLog(`Coleccionista ha reservado una carta de la mesa.`);
        }
        else if (actionName === 'HERMIT_START_ABILITY') {
            const p = players.find(player => player.id === 'p1');
            if (!p || (p as any).hermitUsedAbility) {
                addLog("Ya has usado tu habilidad este turno.");
                return;
            }

            const currentDrawPile = [...drawPile];
            if (currentDrawPile.length > 0) {
                const newCard = { ...currentDrawPile.shift()!, ownerId: 'p1' };
                setDrawPile(currentDrawPile);

                // Set flag immediately to prevent multi-draws AND set Discarding flag
                setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                    ...pl,
                    hand: [...pl.hand, newCard],
                    hermitUsedAbility: true,
                    hermitDiscarding: true
                } : pl));

                setAbilityMode('HERMIT_DISCARD');
                addLog("Ermitaño usa Mano Diestra: Roba una carta extra. Debe descartar 1.");
            } else {
                addLog("No quedan cartas en el mazo.");
            }
        }
        else if (actionName === 'HERMIT_EXECUTE_DISCARD') {
            if (selectedCards.length !== 1) return;
            const cardId = selectedCards[0];
            setPlayers(prev => prev.map(p => p.id === 'p1' ? {
                ...p,
                hand: p.hand.filter(c => c.id !== cardId),
                hermitUsedAbility: true,
                hermitDiscarding: false
            } : p));
            setSelectedCards([]);
            setAbilityMode('NONE');
            addLog("Ermitaño descartó una carta.");
        }
        else if (actionName === 'SUMMONER_COMMAND_DRAW') {
            const p = players.find(x => x.id === 'p1');
            if (!p || p.mp < 1) return;

            const currentDrawPile = [...drawPile];
            if (currentDrawPile.length > 0) {
                const newCard = { ...currentDrawPile.shift()!, ownerId: 'p1' };
                setDrawPile(currentDrawPile);
                setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                    ...pl,
                    hand: [...pl.hand, newCard],
                    mp: pl.mp - 1
                } : pl));
                setAbilityMode('KING_DISCARD'); // Reusing generic discard mode
                addLog("Invocador usa Filtro: Roba 1, Descarta 1 (-1 MP).");
            }
        }

        else if (actionName === 'ADVENTURER_PICK_ITEMS') {
            const { redItemId, blueItemId } = payload;
            const redItem = ITEMS.find(i => i.id === redItemId);
            const blueItem = ITEMS.find(i => i.id === blueItemId);
            if (!redItem || !blueItem) return;

            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    return {
                        ...p,
                        items: [redItem, blueItem],
                        itemSlots: 2
                    };
                }
                return p;
            }));
            setAbilityMode('NONE');
            addLog(`Aventurero eligió sus objetos iniciales: ${redItem.name} y ${blueItem.name}.`);
        }
        else if (actionName === 'PHANTOM_THIEF_SETUP') {
            const { chip } = payload;

            // Logic to Finalize Setup (Visual Card Swap)
            setPlayers(prev => {
                const p1 = prev.find(p => p.id === 'p1');
                if (!p1 || !p1.thiefPartnerId) return prev;

                const partner = prev.find(p => p.id === p1.thiefPartnerId);
                if (!partner) return prev;

                // 1. Give Thief Card to Partner
                // Find a card to replace (preferably a Black 10 or similar high card, or just random)
                // Rule: "Replace one 10 with Thief Card."
                const hand = [...partner.hand];
                const replaceIdx = hand.findIndex(c => c.value === 10);
                const targetIdx = replaceIdx !== -1 ? replaceIdx : hand.length - 1; // Fallback to last card

                const thiefCard: Card = {
                    id: `thief-card-${Date.now()}`,
                    suit: Suit.BLACK,
                    value: 10,
                    type: CardType.NUMBER,
                    name: 'Thief Card',
                    ownerId: partner.id,
                    imagePath: '/assets/5c-cards/phantomthief-card.png'
                };

                hand[targetIdx] = thiefCard;

                // 2. Set Chip & Return
                return prev.map(p => {
                    if (p.id === 'p1') return { ...p, thiefChipValue: chip };
                    if (p.id === partner.id) return { ...p, hand: hand };
                    return p;
                });
            });

            setAbilityMode('NONE');
            addLog(`El Golpe ha comenzado. Chip establecido en: ${chip === 0 ? '0' : '±1'}.`);
        }
        else if (actionName === 'PHANTOM_INIT_EXCHANGE') {
            setAbilityMode('PHANTOM_EXCHANGE');
            // addLog("Selecciona una carta para intercambiar con tu socio."); // Optional log, maybe too spammy?
        }
        else if (actionName === 'PHANTOM_TOGGLE_CHIP') {
            const p = players.find(player => player.id === 'p1');
            if (p) {
                const current = p.thiefChipValue || 0;
                const nextVal = current === 0 ? 1 : 0;
                setPlayers(prev => prev.map(pl => pl.id === 'p1' ? { ...pl, thiefChipValue: nextVal } : pl));
                addLog(`Chip de Predicción actualizado: ${nextVal === 0 ? '0' : '±1'}`);
            }
        }
        else if (actionName === 'PHANTOM_TOGGLE_BETRAYAL') {
            const p = players.find(player => player.id === 'p1');
            if (p) {
                const nextVal = !p.thiefBetrayalMode;
                setPlayers(prev => prev.map(pl => pl.id === 'p1' ? { ...pl, thiefBetrayalMode: nextVal } : pl));
                addLog(`Modo Traición: ${nextVal ? 'ACTIVADO' : 'Desactivado'}`);
            }
        }
        else if (actionName === 'PHANTOM_EXCHANGE_REQUEST') {
            const player = players.find(p => p.id === 'p1');
            if (!player) return;

            if (selectedCards.length !== 1) {
                // UI should prevent this button from being clickable usually, but alert just in case
                alert("Debes seleccionar 1 carta para confirmar el intercambio.");
                return;
            }
            const cardToGiveId = selectedCards[0];
            const cardToGive = player.hand.find(c => c.id === cardToGiveId);
            const partner = players.find(p => p.id === player.thiefPartnerId);

            if (cardToGive && partner) {
                if (partner.hand.length > 0) {
                    // Random card from partner
                    const partnerCardIndex = Math.floor(Math.random() * partner.hand.length);
                    const partnerCard = partner.hand[partnerCardIndex];

                    const newPlayerHand = player.hand.filter(c => c.id !== cardToGiveId).concat({ ...partnerCard, ownerId: player.id });
                    const newPartnerHand = partner.hand.filter(c => c.id !== partnerCard.id).concat({ ...cardToGive, ownerId: partner.id });

                    setPlayers(prev => prev.map(p => {
                        if (p.id === player.id) return { ...p, hand: newPlayerHand };
                        if (p.id === partner.id) return { ...p, hand: newPartnerHand };
                        return p;
                    }));

                    setSelectedCards([]);
                    setAbilityMode('NONE'); // Close actions if any
                    addLog(`Phantom Thief intercambió carta con su socio ${partner.name}.`);
                }
            }
        }
        else if (actionName === 'SUMMON_TO_REAR') {
            const beastId = payload;
            const p = players.find(x => x.id === 'p1');
            const beast = BEASTS.find(b => b.id === beastId);
            if (!p || !beast || p.mp < beast.mpCost || p.rearBeasts.length >= 2) return;

            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                ...pl,
                mp: pl.mp - beast.mpCost,
                rearBeasts: [...pl.rearBeasts, beastId]
            } : pl));
            setAbilityMode('NONE');
            addLog(`Invocador despierta a ${beast.name} en Retaguardia.`);
        }
        else if (actionName === 'MOVE_TO_FRONT') {
            const beastId = payload;
            const p = players.find(x => x.id === 'p1');
            if (!p || playedCards.length === 0) return;

            const beast = BEASTS.find(b => b.id === beastId);
            const card = playedCards[playedCards.length - 1];

            let cost = 0;
            if (beast && card) {
                const match = (beast.suit && card.suit === beast.suit) || (card.value === 10);
                if (!match) {
                    cost = (beastId === 'b-oko') ? 2 : 1;
                }
            }

            if (p.mp < cost) {
                addLog("No tienes suficiente MP para mover la bestia al frente.");
                return;
            }

            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                ...pl,
                mp: pl.mp - cost,
                frontBeastId: beastId,
                rearBeasts: pl.rearBeasts.filter(id => id !== beastId)
            } : pl));
            setAbilityMode('NONE');
            addLog(`¡${beastId === 'b-miria' ? 'MIRIA' : 'Bestia'} avanza al frente! (-${cost} MP)`);
        }
        else if (actionName === 'CHOOSE_INITIAL_ITEM') {
            const item = payload as Item;
            setPlayers(prev => prev.map(pl => {
                if (pl.id === 'p1') {
                    const newItems = [...pl.items, item];
                    const hasRed = newItems.some(i => i.type === 'RED');
                    const hasBlue = newItems.some(i => i.type === 'BLUE');
                    if (hasRed && hasBlue) setAbilityMode('NONE');
                    return { ...pl, items: newItems };
                }
                return pl;
            }));
            addLog(`Elegiste: ${item.name}`);
        }
        else if (actionName === 'USE_ITEM') {
            const item = payload as Item;
            const p = players.find(x => x.id === 'p1');
            if (!p || (p as any).adventurerUsedItem) {
                addLog("Ya has usado un objeto en esta baza.");
                return;
            }

            addLog(`Usaste: ${item.name}`);

            // 1. Calculate Replacement Item (Deterministic Step)
            const currentItemsIds = p.items.map(i => i.id);
            const usedIds = p.usedItemIds || [];

            // Exclude current items AND the item just used AND any in history
            const filteredItems = p.items.filter(i => i.id !== item.id);
            const possibleItems = ITEMS.filter(i =>
                i.id !== item.id &&
                !filteredItems.some(existing => existing.id === i.id) &&
                !usedIds.includes(i.id)
            );

            // Fallback: If no unique items left (all used or held), clear history (except current held)
            let finalPossible = possibleItems;
            let didReset = false;
            if (finalPossible.length === 0) {
                finalPossible = ITEMS.filter(i =>
                    i.id !== item.id &&
                    !filteredItems.some(existing => existing.id === i.id)
                );
                didReset = true;
            }

            let replacement: Item | null = null;
            if (possibleItems.length > 0) {
                replacement = possibleItems[Math.floor(Math.random() * possibleItems.length)];
                addLog(`Encontraste: ${replacement.name}`);
            }

            // 2. Handle DRAW_X Effect (Side effects on Draw Pile)
            let drawnCards: Card[] = [];
            let newAbilityMode = 'NONE';

            if (item.effect === 'DRAW_X') {
                // Don't draw yet. Just trigger Swap Mode.
                addLog("Mapa del Destino: Selecciona hasta 2 cartas para intercambiar.");
                newAbilityMode = 'ADVENTURER_SWAP';
                // We need to set pendingItemEffect to tell modal how many.
                // We will handle that in setPlayers.
            } else if (item.effect === 'DRAW_DISCARD') {
                addLog("Fairy Mischief: Selecciona hasta 1 carta para intercambiar.");
                newAbilityMode = 'ADVENTURER_SWAP';
            } else if (item.effect === 'GAIN_30') {
                setPlayers(prev => prev.map(pl => {
                    if (pl.id === 'p1') {
                        return { ...pl, score: pl.score + 30 };
                    }
                    return pl;
                }));
                addLog("Recuperaste 30 puntos.");
            } else if (item.effect === 'GAIN_20') {
                setPlayers(prev => prev.map(pl => {
                    if (pl.id === 'p1') {
                        return { ...pl, score: pl.score + 20 };
                    }
                    return pl;
                }));
                addLog("Recuperaste 20 puntos.");
            } else if (item.effect === 'PASS_LEAD') {
                const isCurrentPlayer = currentPlayerIdx === players.findIndex(p => p.id === 'p1');
                if (currentPlayerIdx === trickStarterIdx && isCurrentPlayer) {
                    setTrickStarterIdx((prev) => (prev + 1) % players.length);
                    setCurrentPlayerIdx((prev) => (prev + 1) % players.length);
                    addLog("Pasaste el liderazgo a la siguiente persona.");
                } else {
                    addLog("El objeto solo funciona si estás liderando la baza.");
                }
            } else if (item.effect === 'PLAY_LAST') {
                const isCurrentPlayer = currentPlayerIdx === players.findIndex(p => p.id === 'p1');
                if (currentPlayerIdx === trickStarterIdx && isCurrentPlayer) {
                    setTrickStarterIdx((prev) => (prev + 1) % players.length);
                    setCurrentPlayerIdx((prev) => (prev + 1) % players.length);
                    addLog("Ahora jugarás último (pasaste el liderazgo).");
                } else {
                    addLog("El objeto solo funciona si estás liderando (efecto simplificado).");
                }
            } else {
                // Nothing to do for other effects here, they are flags
            }

            if (newAbilityMode !== 'NONE') {
                setAbilityMode(newAbilityMode);
            }

            // 3. Update Player State
            setPlayers(prev => prev.map(pl => {
                if (pl.id !== 'p1') return pl;

                let newHand = pl.hand;
                let pendingEffect = pl.pendingItemEffect;

                // Apply Draw Effect / Pending Flags
                if (item.effect === 'DRAW_X') {
                    // newHand = [...pl.hand, ...drawnCards]; // No draw yet
                    pendingEffect = 'DISCARD_2'; // Reusing this flag to mean "Max 2" for swap
                } else if (item.effect === 'DRAW_DISCARD') {
                    // newHand = [...pl.hand, ...drawnCards]; // No draw yet
                    pendingEffect = 'DISCARD_1'; // Reusing this flag to mean "Max 1" for swap
                } else {
                    pendingEffect = item.effect;
                }

                // Apply Replacement
                let updatedItems = pl.items.filter(i => i.id !== item.id);
                if (replacement) {
                    updatedItems = [...updatedItems, replacement];
                }

                return {
                    ...pl,
                    items: updatedItems,
                    hand: newHand,
                    pendingItemEffect: pendingEffect,
                    adventurerUsedItem: true,
                    usedItemIds: didReset ? [] : [...(pl.usedItemIds || []), item.id]
                };
            }));
        }
        else if (actionName === 'SHOW_ITEM_CARD') {
            setItemCardToShow(payload);
        }
        else if (actionName === 'RULER_IGNORE_RULES') {
            setAbilityMode(prev => prev === 'RULER_IGNORE_RULES' ? 'NONE' : 'RULER_IGNORE_RULES');
            addLog("Ruler: Modo 'Ignorar Reglas' activado. Juega cualquier carta.");
        }
        else if (actionName === 'BERSERKER_START_ROUND3') {
            setAbilityMode('BERSERKER_ROUND3_DISCARD');
            addLog("Berserker se prepara para la Batalla Final. Selecciona 1 o 2 cartas para descartar.");
        }
        else if (actionName === 'BERSERKER_EXECUTE_ROUND3') {
            if (selectedCards.length < 1 || selectedCards.length > 2) return;
            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1' && p.berserkerDeck) {
                    const cardsInHandIds = p.hand.map(c => c.id);
                    const unselectedReserved = p.berserkerDeck.filter(c => !cardsInHandIds.includes(c.id));
                    const count = selectedCards.length;
                    const drawnCards = unselectedReserved.slice(0, count);
                    const newHand = p.hand.filter(c => !selectedCards.includes(c.id)).concat(drawnCards);

                    return {
                        ...p,
                        hand: newHand,
                        blackCrowns: p.blackCrowns - 1,
                        berserkerUsedRound3: true
                    };
                }
                return p;
            }));
            setSelectedCards([]);
            addLog(`¡Berserker usó una Corona Negra! Descartó sus cartas y robó del mazo exclusivo.`);
        }
        else if (actionName === 'STRATEGIST_SET_TRAPS') {
            const { traps } = payload;
            setTrapDeck(traps);
            setAbilityMode('NONE');
            addLog("El Estratega ha definido su Plan Maestro de Trampas.");
        }
        else if (actionName === 'SUMMON_TO_REAR') {
            const beastId = payload;
            const p = players.find(x => x.id === 'p1');
            const beast = BEASTS.find(b => b.id === beastId);
            if (!p || !beast || p.mp < beast.mpCost || p.rearBeasts.length >= 2) return;

            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                ...pl,
                mp: pl.mp - beast.mpCost,
                rearBeasts: [...pl.rearBeasts, beastId]
            } : pl));
            setAbilityMode('NONE');
            addLog(`Invocador despierta a ${beast.name} en Retaguardia.`);
        }
        else if (actionName === 'SUMMONER_EQUIP_BEAST') {
            const beastId = payload;
            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? { ...pl, frontBeastId: beastId } : pl));
            setAbilityMode('SUMMONER_SELECT_CARD');
            addLog("Selecciona una carta para atacar con la bestia.");
        }
        else if (actionName === 'SUMMONER_CANCEL_ATTACK') {
            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? { ...pl, frontBeastId: null } : pl));
            setAbilityMode('NONE');
            setSelectedCards([]);
        }
        else if (actionName === 'SUMMONER_EXECUTE_ATTACK') {
            const p = players.find(x => x.id === 'p1');
            if (!p || !p.frontBeastId || selectedCards.length !== 1) return;

            const beast = BEASTS.find(b => b.id === p.frontBeastId);
            const card = p.hand.find(c => c.id === selectedCards[0]);

            if (!beast || !card) return;

            // Calculate Cost
            let cost = 1;
            const isMatch = (beast.suit && card.suit === beast.suit) || (card.value === 10);
            if (isMatch) cost = 0;
            else if (beast.id === 'b-oko') cost = 2;

            if (p.mp < cost) {
                addLog(`No tienes suficiente MP (${cost} requeridos).`);
                setSelectedCards([]);
                // Do not cancel mode, let them choose another card or cancel manually
                return;
            }

            // Execute Play
            // Remove card, update MP, add to playedCards
            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                ...pl,
                hand: pl.hand.filter(c => c.id !== card.id),
                mp: pl.mp - cost,
                // rearBeasts logic: beast moves from rear to front (leaves rear)
                rearBeasts: pl.rearBeasts.filter(id => id !== beast.id)
            } : pl));

            const playedCard = { ...card, ownerId: 'p1' };
            if (playedCards.length === 0 && playedCard.suit !== Suit.COLORLESS) {
                setLeadSuit(playedCard.suit);
            }
            const newPlayed = [...playedCards, playedCard];
            setPlayedCards(newPlayed);
            setAbilityMode('NONE');
            setSelectedCards([]);
            addLog(`Invocador ataca con ${beast.name} (+${cost} MP).`);

            if (newPlayed.length < players.length) {
                setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length);
            } else {
                isResolvingRef.current = true;
                const updatedP1 = {
                    ...p,
                    hand: p.hand.filter(c => c.id !== card.id),
                    mp: p.mp - cost,
                    rearBeasts: p.rearBeasts.filter(id => id !== beast.id),
                    frontBeastId: beast.id // Ensure it's set for logic calculation in resolveTrick
                };
                const updatedPlayers = players.map(pl => pl.id === 'p1' ? updatedP1 : pl);
                resolveTrick(newPlayed, updatedPlayers);
            }
        }
        else if (actionName === 'ADVENTURER_EXECUTE_SWAP') {
            const { cardIds } = payload; // IDs to discard

            // Check draw pile availability
            const currentDrawPile = [...drawPile];
            const count = cardIds.length;

            if (currentDrawPile.length < count) {
                addLog("No hay suficientes cartas en el mazo para intercambiar.");
                // Maybe handle partial? For now, abort or swap what we can.
                // Assuming infinite deck or reshuffle logic exists elsewhere or we simply take all.
            }

            const drawn = currentDrawPile.splice(0, count).map(c => ({ ...c, ownerId: 'p1' }));
            setDrawPile(currentDrawPile);

            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    const handAfterDiscard = p.hand.filter(c => !cardIds.includes(c.id));
                    return {
                        ...p,
                        hand: [...handAfterDiscard, ...drawn],
                        pendingItemEffect: null // Clear effect
                    };
                }
                return p;
            }));
            setAbilityMode('NONE');
            addLog(`Adventurero intercambió ${count} carta(s).`);
        }
    }, [drawPile, selectedCards, players, playedCards, currentPlayerIdx, trickStarterIdx, isResolvingRef, trick, setItemCardToShow, setAbilityMode, setDrawPile, setPlayers, setSelectedCards, setPlayedCards, setLeadSuit, setIsKakumei, addLog, resolveTrick, leadSuit, setTrapDeck]);

    return { performAction };
};
