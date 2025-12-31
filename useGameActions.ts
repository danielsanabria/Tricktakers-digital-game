
import React, { useCallback } from 'react';
import { Player, Card, Suit, CharacterType, Item, Trap, CardType } from './game/core/types';
import { calculateAlchemyValue } from './game/core/gameLogic';
import { BEASTS, ITEMS } from './game/core/constants';

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
    setCurrentPlayerIdx: React.Dispatch<React.SetStateAction<number>>;
    trickStarterIdx: number;
    setIsKakumei: React.Dispatch<React.SetStateAction<boolean>>;
    addLog: (msg: string) => void;
    resolveTrick: (cards: Card[]) => void;
    currentPlayerIdx: number;
    isResolvingRef: React.MutableRefObject<boolean>;
    trick: number;
    setItemCardToShow: (url: string | null) => void;
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
    setCurrentPlayerIdx,
    trickStarterIdx,
    setIsKakumei,
    addLog,
    resolveTrick,
    currentPlayerIdx,
    isResolvingRef,
    trick,
    setItemCardToShow
}: GameActionsProps) => {

    const performAction = useCallback((actionName: string, payload?: any) => {
        if (actionName === 'GAMBLER_EXECUTE_SWAP') {
            if (selectedCards.length === 0) return;
            const currentDrawPile = [...drawPile];
            const count = selectedCards.length;
            const newCards = currentDrawPile.splice(0, count).map(c => ({ ...c, ownerId: 'p1' }));

            setDrawPile(currentDrawPile);
            setPlayers(prev => prev.map(p => {
                if (p.id === 'p1') {
                    const newHand = [...p.hand.filter(c => !selectedCards.includes(c.id)), ...newCards];
                    const remainingSwaps = (p.gambleSwaps || 0) - 1;

                    // If no swaps left, change mode immediately
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
            addLog(`El Rey descartó una carta para mantener su mano.`);
        }
        else if (actionName === 'TRIGGER_KAKUMEI') {
            setIsKakumei(prev => !prev);
            setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, revoltsLeft: (p.revoltsLeft || 0) - 1 } : p));
            addLog(`¡LA RESISTENCIA HA INICIADO UNA REVOLUCIÓN!`);
        }
        else if (actionName === 'TIME_TRAVEL_REWIND') {
            // Rewind logic: Return played cards to hands, reset trick.
            if (playedCards.length === 0) return;

            const cardsToReturn = [...playedCards];
            setPlayers(prev => prev.map(p => {
                const returned = cardsToReturn.find(c => c.ownerId === p.id);
                if (returned) {
                    return { ...p, hand: [...p.hand, returned] };
                }
                return p;
            }));
            setPlayedCards([]);
            setLeadSuit(null);
            setCurrentPlayerIdx(trickStarterIdx); // Back to starter
            addLog(`¡EL TIEMPO HA SIDO REBOBINADO!`);
            setAbilityMode('NONE');
        }
        else if (actionName === 'ALCHEMIST_PLAY') {
            if (selectedCards.length !== 3) return;
            // Combine cards
            const p = players[0];
            const actualCards = p.hand.filter(c => selectedCards.includes(c.id));
            const sumValue = calculateAlchemyValue(actualCards).value;

            // Create a "Combined Card" to put on table
            const combinedCard: Card = {
                id: `alchemy-${Date.now()}`,
                suit: Suit.COLORLESS, // Alchemist creates "gold/magic" usually, assume colorless or first card suit? Logic says Modulo sum.
                value: sumValue,
                type: CardType.NUMBER,
                ownerId: 'p1',
                combinedCards: actualCards
            };

            setPlayedCards(prev => [...prev, combinedCard]);

            // Alchemist Replenishment
            let newHand = p.hand.filter(c => !selectedCards.includes(c.id));
            if (trick < 5) {
                const currentDrawPile = [...drawPile];
                const drawn = currentDrawPile.splice(0, 3).map(c => ({ ...c, ownerId: 'p1' }));
                setDrawPile(currentDrawPile);
                newHand = [...newHand, ...drawn];
                addLog(`Alquimista repone 3 cartas.`);
            }

            setPlayers(prev => prev.map(pl => pl.id === 'p1' ? { ...pl, hand: newHand } : pl));
            setSelectedCards([]);
            addLog(`Alquimista transmuta 3 cartas en valor ${sumValue}.`);

            if (playedCards.length + 1 < players.length) {
                const nextIdx = (currentPlayerIdx + 1) % players.length;
                setCurrentPlayerIdx(nextIdx);
            } else {
                isResolvingRef.current = true;
                resolveTrick([...playedCards, combinedCard]);
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
                addLog("Ermitaño roba una carta extra. Debe descartar 1.");
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
        else if (actionName === 'TIME_TRAVEL_REWIND') {
            const p = players.find(pl => pl.id === 'p1');
            if (!p || (p.timeTravelTokens || 0) < 1) return;

            setPlayers(prev => prev.map(pl => {
                const ownedCards = playedCards.filter(c => c.ownerId === pl.id);
                if (pl.id === 'p1') {
                    return {
                        ...pl,
                        hand: [...pl.hand, ...ownedCards],
                        timeTravelTokens: pl.timeTravelTokens - 1
                    };
                }
                return {
                    ...pl,
                    hand: [...pl.hand, ...ownedCards]
                };
            }));
            setPlayedCards([]);
            setLeadSuit(null);
            // CurrentPlayerIdx should be the one who started the trick?
            // Actually, keep it as is, or reset to trick starter.
            // Let's reset to trick starter.
            // But I don't have trickStarterIdx in useGameActions easily unless I pass it.
            // Wait, I can see it in App.tsx. I might need to pass it or just let the current player continue if it was their turn.
            // Rule: "The current trick is restarted".
            addLog("¡REBOBINAR TIEMPO! Las cartas vuelven a los jugadores.");
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
                setAbilityMode('HERMIT_DISCARD');
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
            const player = players.find(p => p.id === 'p1');
            if (player) {
                setPlayers(prev => prev.map(p => {
                    if (p.id === player.id) {
                        const current = p.thiefChipValue || 0;
                        return { ...p, thiefChipValue: current === 0 ? 1 : 0 };
                    }
                    return p;
                }));
            }
        }
        else if (actionName === 'PHANTOM_TOGGLE_BETRAYAL') {
            const player = players.find(p => p.id === 'p1');
            if (player) {
                setPlayers(prev => prev.map(p => {
                    if (p.id === player.id) {
                        return { ...p, thiefBetrayalMode: !p.thiefBetrayalMode };
                    }
                    return p;
                }));
            }
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
                // Simplified: Partner gives random card
                if (partner.hand.length > 0) {
                    const partnerCardIndex = Math.floor(Math.random() * partner.hand.length);
                    const partnerCard = partner.hand[partnerCardIndex];

                    // Swap
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
            const card = playedCards[playedCards.length - 1]; // The card just played by this player

            let cost = 0;
            if (beast && card) {
                // Rule: Gratis if color or value match.
                // Special case: OKO (Black) costs 2 MP if no match.
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
                    // If we have 1 Red and 1 Blue, close setup
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

                // Replacement draw
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
            // Toggle mode. If already active, cancel it?
            setAbilityMode(prev => prev === 'RULER_IGNORE_RULES' ? 'NONE' : 'RULER_IGNORE_RULES');
            addLog("Ruler: Modo 'Ignorar Reglas' activado (o desactivado). Juega cualquier carta.");
        }
    }, [drawPile, selectedCards, players, playedCards, currentPlayerIdx, trickStarterIdx, isResolvingRef, trick, setItemCardToShow]);

    return { performAction };
};
