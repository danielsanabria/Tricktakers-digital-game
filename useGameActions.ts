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
    setPhase: React.Dispatch<React.SetStateAction<any>>; // Using any for GamePhase enum to avoid import cycles
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
    isResolvingRef,
    trick,
    setItemCardToShow,
    setTrapDeck,
    setTrick,
    setPhase
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
            setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, hand: p.hand.filter(c => c.id !== cardId) } : p));
            setSelectedCards([]);
            setAbilityMode('NONE');
            addLog(`Has descartado 1 carta.`);
        }
        else if (actionName === 'RULER_ASSIGN_TASKS') {
            const assignments = payload as Record<string, string>;
            setPlayers(prev => prev.map(p => {
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
            const selectedSuits = payload as Suit[];
            setPlayers(prev => prev.map(p => p.id === 'p1' ? {
                ...p,
                thiefTargetIds: selectedSuits.map(s => s.toString())
            } : p));
            setAbilityMode('NONE');
            addLog(`Has enviado avisos para los colores: ${selectedSuits.join(', ')}.`);
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

            // 2. Check "Same as Lead" Element
            if (leadSuit && playedCards.length > 0) {
                const leadCard = playedCards[0];
                if (leadCard.value === sumValue) {
                    newElements.push('SAME_AS_LEAD');
                    addLog("¡Elemento obtenido: Resonancia (Mismo valor que líder)!");
                }
            }

            // Log elements
            if (alchemyResult.elements.includes('3_OF_A_KIND')) addLog("¡Elemento obtenido: Tercia!");
            if (alchemyResult.elements.includes('FLUSH')) addLog("¡Elemento obtenido: Color!");
            if (alchemyResult.elements.includes('STRAIGHT')) addLog("¡Elemento obtenido: Corrida!");

            // 3. Create Virtual Card
            const virtualCard: Card = {
                id: `alchemy-play-${Date.now()}`,
                suit: leadSuit || Suit.COLORLESS,
                value: sumValue,
                type: CardType.NUMBER,
                ownerId: p.id,
                name: `Alchemy Result (${sumValue})`,
                combinedCards: actualCards
            };

            // Handle Lead Suit
            if (!leadSuit) {
                virtualCard.suit = actualCards[0].suit;
                setLeadSuit(virtualCard.suit);
                addLog(`Alquimista declara el palo: ${virtualCard.suit}`);
            } else {
                virtualCard.suit = leadSuit;
            }

            // 4. Replenish Hand (Draw 3 from alchemistDeck)
            const alchemistDeck = [...(p.alchemistDeck || [])];
            let drawnCards: Card[] = [];
            if (alchemistDeck.length > 0) {
                drawnCards = alchemistDeck.splice(0, 3).map(c => ({ ...c, ownerId: p.id }));
                addLog(`Alquimista repone ${drawnCards.length} cartas.`);
            }

            // 5. Update Player State
            const remainingHand = p.hand.filter(c => !selectedCards.includes(c.id));
            const newHand = [...remainingHand, ...drawnCards];

            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? {
                ...pl,
                hand: newHand,
                alchemistDeck: alchemistDeck,
                magicElements: newElements
            } : pl));

            // 6. Play Virtual Card
            setPlayedCards(prev => [...prev, virtualCard]);
            setSelectedCards([]);

            // Advance turn if trick not complete
            if (playedCards.length + 1 < players.length) {
                setCurrentPlayerIdx(prev => (prev + 1) % players.length);
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
            // Resume standard completion
            // We need to determine winner again or trust state?
            // trickStarterIdx is currently the PREVIOUS starter.
            // We need to calculate winner of `playedCards`.
            // But `playedCards` might be needed.
            // Actually, useGameLoop Logic was: Winner determined -> UI Shown -> Click Normal -> Finish.

            // We can reuse the logic:
            // Determine winner again:
            let winnerIdx = trickStarterIdx;
            let bestCard = playedCards[0];

            for (let i = 1; i < playedCards.length; i++) {
                const card = playedCards[i];
                const currentIdx = (trickStarterIdx + i) % players.length;

                // Standard Comparison (Simplify for Action)
                // Note: We might want a refactored `getTrickWinner` helper to avoid duplication
                if (card.suit === bestCard.suit) {
                    if (card.value > bestCard.value) {
                        bestCard = card;
                        winnerIdx = currentIdx;
                    }
                } else if (card.suit === leadSuit) {
                    // If current allows follow
                } else if (leadSuit && card.suit !== leadSuit && bestCard.suit === leadSuit) {
                    // Not trump logic yet?
                }
                // Actually, resolving full winner logic here is risky duplication.
                // Better approach: `useGameLoop` stored the `winnerIdx`? No.
                // Just recalc with basic logic for now or store it?
                // Recalc is safer.
            }

            // Standard Completion for Time Traveler Win (User Chose "Continue Normal")
            const p1Index = players.findIndex(p => p.id === 'p1');

            // Update Wins
            setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, wins: p.wins + 1 } : p));
            addLog(`Ganador de la baza: ${players[p1Index].name}`);

            // Reset Table
            setPlayedCards([]);
            setLeadSuit(null);
            setCurrentPlayerIdx(p1Index);

            // Advance Game State
            setAbilityMode('NONE');
            if (trick < 5) {
                setTrick(t => t + 1);
            } else {
                setPhase(GamePhase.ROUND_END);
                // Better to rely on string or passed enum value if possible.
                // Assuming 4 is ROUND_END based on enum likelyhood, but checking imports...
                // We imported types, but GamePhase might not be exported from types.ts?
                // It is usually in types.ts.
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
        else if (actionName === 'COLLECTOR_RESERVE_CONFIRM') {
            if (selectedCards.length !== 1) return;
            const cardId = selectedCards[0];
            setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, reservedCardId: cardId } : p));
            setSelectedCards([]);
            setAbilityMode('NONE');
            addLog(`Coleccionista ha reservado una carta de la mesa.`);
        }
        else if (actionName === 'HERMIT_START_ABILITY') {
            const currentDrawPile = [...drawPile];
            if (currentDrawPile.length > 0) {
                const newCard = { ...currentDrawPile.shift()!, ownerId: 'p1' };
                setDrawPile(currentDrawPile);
                setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, hand: [...p.hand, newCard] } : p));
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
                hermitUsedAbility: true
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
        else if (actionName === 'PHANTOM_TOGGLE_CHIP') {
            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    const current = p.thiefChipValue || 0;
                    return { ...p, thiefChipValue: current === 0 ? 1 : 0 };
                }
                return p;
            }));
        }
        else if (actionName === 'PHANTOM_TOGGLE_BETRAYAL') {
            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    return { ...p, thiefBetrayalMode: !p.thiefBetrayalMode };
                }
                return p;
            }));
        }
        else if (actionName === 'PHANTOM_EXCHANGE_REQUEST') {
            const player = players.find(p => p.id === 'p1');
            if (!player) return;

            if (selectedCards.length !== 1) {
                alert("Selecciona 1 carta para ofrecer.");
                return;
            }
            const cardToGiveId = selectedCards[0];
            const cardToGive = player.hand.find(c => c.id === cardToGiveId);
            const partner = players.find(p => p.id === player.thiefPartnerId);

            if (cardToGive && partner) {
                if (partner.hand.length > 0) {
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

            setPlayers(prev => prev.map(pl => {
                if (pl.id !== 'p1') return pl;

                const filteredItems = pl.items.filter(i => i.id !== item.id);
                let newHand = pl.hand;
                let pendingEffect = pl.pendingItemEffect;

                if (item.effect === 'DRAW_X') {
                    const currentDrawPile = [...drawPile];
                    const drawn = currentDrawPile.splice(0, 2).map(c => ({ ...c, ownerId: 'p1' }));
                    setDrawPile(currentDrawPile);
                    newHand = [...pl.hand, ...drawn];
                    setAbilityMode('KING_DISCARD');
                    addLog("Robaste 2 cartas. Descarta 2.");
                } else {
                    pendingEffect = item.effect;
                }

                const possibleItems = ITEMS.filter(i => i.id !== item.id && !filteredItems.map(x => x.id).includes(i.id));
                let updatedItems = filteredItems;
                if (possibleItems.length > 0) {
                    const replacement = possibleItems[Math.floor(Math.random() * possibleItems.length)];
                    updatedItems = [...filteredItems, replacement];
                    addLog(`Encontraste: ${replacement.name}`);
                }

                return {
                    ...pl,
                    items: updatedItems,
                    hand: newHand,
                    pendingItemEffect: pendingEffect,
                    adventurerUsedItem: true
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
    }, [drawPile, selectedCards, players, playedCards, currentPlayerIdx, trickStarterIdx, isResolvingRef, trick, setItemCardToShow, setAbilityMode, setDrawPile, setPlayers, setSelectedCards, setPlayedCards, setLeadSuit, setIsKakumei, addLog, resolveTrick, leadSuit, setTrapDeck]);

    return { performAction };
};
