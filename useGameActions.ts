import React, { useCallback } from 'react';
import { Player, Card, Suit, CharacterType, Item, Trap, CardType } from './game/core/types';
import { calculateAlchemyValue } from './game/core/gameLogic';
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
            setCurrentPlayerIdx(trickStarterIdx);
            addLog(`¡EL TIEMPO HA SIDO REBOBINADO!`);
            setAbilityMode('NONE');
        }
        else if (actionName === 'ALCHEMIST_PLAY') {
            if (selectedCards.length !== 3) return;
            const p = players[0];
            const actualCards = p.hand.filter(c => selectedCards.includes(c.id));
            const alchemy = calculateAlchemyValue(actualCards);
            const sumValue = alchemy.value;

            const newElements = [...alchemy.elements];
            if (leadSuit && playedCards.length > 0) {
                const leadCard = playedCards[0];
                if (leadCard.value === sumValue) {
                    newElements.push('SAME_AS_LEAD');
                }
            }

            const combinedCard: Card = {
                id: `alchemy-${Date.now()}`,
                suit: leadSuit || Suit.COLORLESS,
                value: sumValue,
                type: CardType.NUMBER,
                ownerId: 'p1',
                combinedCards: actualCards
            };

            setPlayedCards(prev => [...prev, combinedCard]);

            let newHand = p.hand.filter(c => !selectedCards.includes(c.id));
            if (trick < 5) {
                const currentDrawPile = [...drawPile];
                const drawn = currentDrawPile.splice(0, 3).map(c => ({ ...c, ownerId: 'p1' }));
                setDrawPile(currentDrawPile);
                newHand = [...newHand, ...drawn];
                addLog(`Alquimista repone 3 cartas.`);
            }

            const updatedPlayersAlchemist = players.map(pl => pl.id === 'p1' ? {
                ...pl,
                hand: newHand,
                magicElements: [...(pl.magicElements || []), ...newElements]
            } : pl);

            setPlayers(updatedPlayersAlchemist);
            setSelectedCards([]);

            if (newElements.length > 0) {
                addLog(`¡Alquimista obtuvo ${newElements.length} elemento(s)! (${newElements.join(', ')})`);
            }
            addLog(`Alquimista transmuta 3 cartas en valor ${sumValue}.`);

            if (playedCards.length + 1 < players.length) {
                const nextIdx = (currentPlayerIdx + 1) % players.length;
                setCurrentPlayerIdx(nextIdx);
            } else {
                isResolvingRef.current = true;
                resolveTrick([...playedCards, combinedCard], updatedPlayersAlchemist);
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
            setAbilityMode('NONE');
            addLog("¡Berserker usó una Corona Negra! Descartó sus cartas y robó del mazo exclusivo.");
        }
    }, [drawPile, selectedCards, players, playedCards, currentPlayerIdx, trickStarterIdx, isResolvingRef, trick, setItemCardToShow, setAbilityMode, setDrawPile, setPlayers, setSelectedCards, setPlayedCards, setLeadSuit, setIsKakumei, addLog, resolveTrick, leadSuit]);

    return { performAction };
};
