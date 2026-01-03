import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, PowerContext, UIContext, CardType, Card, Suit } from '../../game/core/types';
import { BEASTS } from '../../game/core/constants';

export class SummonerLogic extends BaseCharacterLogic {
    setup(context: SetupContext): Partial<Player> {
        const { deck, playerId } = context;
        const hand = deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));
        return {
            hand,
            mp: 5,
            beasts: BEASTS.map(b => ({ ...b, active: false })),
            rearBeasts: [],
            frontBeastId: null
        };
    }

    getCardPower(context: PowerContext): number {
        const { card, player } = context;
        const activeBeastId = player.frontBeastId;

        // Si hay una bestia en el frente, sus atributos sobrescriben la carta
        if (activeBeastId) {
            const beast = BEASTS.find(b => b.id === activeBeastId);
            if (beast) {
                // Miria (Front): Berserker Logic
                // Stronger than Rare (3000 vs 2000), but loses to ANY 1.
                if (beast.id === 'b-miria') {
                    // Check if any "1" is in play.
                    // context.onesInSuits contains suits with '1'.
                    if (context.onesInSuits.length > 0 && !(context.isKakumei || context.isRevolt)) {
                        return -1; // Lose to 1
                    }
                    return 3000;
                }

                // El (Front): White Flag Logic (0 Power) BUT beats Rare.
                if (beast.id === 'b-el') {
                    if (context.trickContainsRare) return 5000; // Beats Rare
                    return 0; // White Flag standard power
                }

                // Generic Color Beasts: Value 10
                if (beast.suit) {
                    let virtualCard = { ...card, suit: beast.suit, value: 10, type: CardType.NUMBER };
                    // Use Base Logic for standard calculations (Suit bonuses, etc.)
                    const newContext = { ...context, card: virtualCard };
                    return super.getCardPower(newContext);
                }
            }
        }

        return super.getCardPower(context);
    }

    onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
        // Al final del turno, El genera +1 MP si está en retaguardia
        let mpGain = 1;
        if (player.rearBeasts.includes('b-el')) mpGain += 1;

        return {
            mp: Math.min(player.mp + mpGain, 10),
            frontBeastId: null, // La bestia del frente vuelve a la caja (o se agota, en este caso se resetea)
        };
    }

    renderActions(context: UIContext): React.ReactNode {
        const { abilityMode, setAbilityMode, player, performAction, isCurrentPlayer } = context;
        if (!isCurrentPlayer) return null;

        const isSummonMode = abilityMode === 'SUMMONER_REAR';
        const isFrontMode = abilityMode === 'SUMMONER_FRONT';
        const isAttackMode = abilityMode === 'SUMMONER_SELECT_CARD';

        // Si estamos en modo selección de carta para ataque, mostrar instrucciones o botón cancelar/confirmar especial?
        // La UI principal (PlayerHandArea) debería mostrar cartas seleccionables.
        // Aquí mostramos "Confirmar Ataque" si hay carta seleccionada.
        if (isAttackMode) {
            const hasCard = context.selectedCards.length === 1;
            return React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", {
                    onClick: () => hasCard ? performAction('SUMMONER_EXECUTE_ATTACK') : null,
                    className: `btn ${hasCard ? 'btn-rose animate-pulse' : 'btn-slate opacity-50'} !py-1.5 !px-3 text-[10px]`
                }, "CONFIRMAR ATAQUE"),
                React.createElement("button", {
                    onClick: () => {
                        setAbilityMode('NONE');
                        performAction('SUMMONER_CANCEL_ATTACK'); // To clear frontBeastId if needed, though state is local in hook? No, stored in player.
                    },
                    className: "btn btn-slate !bg-white !text-slate-500 !py-1.5 !px-3 text-[10px]"
                }, "CANCELAR")
            );
        }

        return (
            React.createElement("div", { className: "flex gap-2" },
                // Botón para invocar a Retaguardia
                React.createElement("div", { className: "relative" },
                    React.createElement("button", {
                        onClick: () => setAbilityMode(isSummonMode ? 'NONE' : 'SUMMONER_REAR'),
                        className: `btn ${isSummonMode ? 'btn-purple scale-105 shadow-lg' : 'btn-slate !bg-white !text-slate-500 hover:!border-purple-500'} !py-1.5 !px-3 text-[10px]`
                    },
                        React.createElement("i", { className: "fa-solid fa-ghost" }),
                        `RETAGUARDIA (${player.rearBeasts.length}/2)`
                    ),
                    isSummonMode && (
                        React.createElement("div", { className: "absolute bottom-full mb-4 bg-white p-3 rounded-2xl shadow-2xl border border-indigo-100 grid grid-cols-2 gap-2 w-80 z-50 animate-in slide-in-from-bottom-2 duration-300" },
                            BEASTS.map(b => {
                                const isOwned = player.rearBeasts.includes(b.id);
                                const canAfford = player.mp >= b.mpCost;
                                return React.createElement("div", {
                                    key: b.id,
                                    onClick: () => {
                                        if (!isOwned && canAfford) performAction('SUMMON_TO_REAR', b.id);
                                    },
                                    className: `p-2 border-2 rounded-xl transition-all ${isOwned ? 'bg-indigo-50 border-indigo-500 opacity-50' : canAfford ? 'bg-slate-50 border-slate-100 cursor-pointer hover:border-indigo-200 hover:scale-[1.02]' : 'bg-slate-100 grayscale opacity-80 cursor-not-allowed'}`
                                },
                                    React.createElement("p", { className: "font-black text-[10px] text-indigo-900" }, b.name),
                                    React.createElement("p", { className: "text-[8px] text-slate-500 leading-tight" }, b.description),
                                    !isOwned && React.createElement("span", { className: `text-[9px] font-black ${canAfford ? 'text-indigo-600' : 'text-red-500'}` }, `Coste: ${b.mpCost} MP`)
                                );
                            })
                        )
                    )
                ),

                // Botón para mover al Frente (si hay bestias en retaguardia)
                player.rearBeasts.length > 0 && React.createElement("div", { className: "relative" },
                    React.createElement("button", {
                        onClick: () => setAbilityMode(isFrontMode ? 'NONE' : 'SUMMONER_FRONT'),
                        className: `btn ${isFrontMode ? 'btn-rose scale-105 shadow-lg' : 'btn-slate !bg-white !text-slate-500 hover:!border-rose-500'} !py-1.5 !px-3 text-[10px]`
                    },
                        React.createElement("i", { className: "fa-solid fa-sword" }),
                        player.frontBeastId ? "BESTIA LISTA" : "MOVER AL FRENTE"
                    ),
                    isFrontMode && (
                        React.createElement("div", { className: "absolute bottom-full mb-4 bg-white p-3 rounded-2xl shadow-2xl border border-rose-100 grid grid-cols-2 gap-2 w-64 z-50 animate-in slide-in-from-bottom-2 duration-300" },
                            React.createElement("p", { className: "col-span-2 text-[10px] text-slate-400 font-bold mb-1" }, "Selecciona una bestia para atacar con la siguiente carta:"),
                            player.rearBeasts.map(beastId => {
                                const b = BEASTS.find(x => x.id === beastId)!;
                                return React.createElement("button", {
                                    key: b.id,
                                    onClick: () => performAction('SUMMONER_EQUIP_BEAST', b.id),
                                    className: `p-2 bg-slate-50 border-2 ${player.frontBeastId === b.id ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-rose-400'} rounded-xl font-black text-[10px] text-slate-700 hover:scale-[1.02] transition-transform`
                                }, b.name);
                            })
                        )
                    )
                ),

                // Habilidad de Comando: Filtrar Mano
                React.createElement("button", {
                    onClick: () => performAction('SUMMONER_COMMAND_DRAW'),
                    className: "btn btn-slate !bg-white !text-slate-500 hover:!border-teal-400 !py-1.5 !px-3 text-[10px]"
                }, "FILTRAR MANO (1 MP)")
            )
        );
    }
}
