
import React from 'react';
import { BaseCharacterLogic } from './logic_Interface';
import { SetupContext, Player, PowerContext, UIContext, CardType, Card, Suit } from '../types';
import { BEASTS } from '../constants';

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
                let virtualCard = { ...card };

                if (beast.id === 'b-el') {
                    virtualCard.type = CardType.WHITE_FLAG;
                    virtualCard.suit = Suit.COLORLESS;
                    virtualCard.value = 0;
                } else if (beast.id === 'b-miria') {
                    virtualCard.type = CardType.BERSERKER;
                    virtualCard.value = 10;
                } else if (beast.suit) {
                    virtualCard.suit = beast.suit;
                    virtualCard.value = 10;
                    virtualCard.type = CardType.NUMBER;
                }

                // Invocamos el calculador base con la carta "transformada"
                const newContext = { ...context, card: virtualCard };
                let power = super.getCardPower(newContext);

                // Lógica específica de El (Vence a Rara)
                if (beast.id === 'b-el' && context.trickContainsRare) return 5000;
                // Lógica de Miria (Fuerza Berserker)
                if (beast.id === 'b-miria') return 3000;

                return power;
            }
        }

        return super.getCardPower(context);
    }

    onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
        // Al final del turno, El genera +1 MP si está en retaguardia
        let mpGain = 1;
        if (player.rearBeasts.includes('b-el')) mpGain += 1;

        const newWins = (player.wins || 0) + 1;
        let updates: Partial<Player> = {
            mp: Math.min(player.mp + mpGain, 10),
            frontBeastId: null, // La bestia del frente vuelve a la caja (o se agota)
            wins: newWins
        };

        if (newWins === 5) {
            updates.score = 999;
        }

        return updates;
    }

    renderActions(context: UIContext): React.ReactNode {
        const { abilityMode, setAbilityMode, player, performAction, isCurrentPlayer } = context;
        if (!isCurrentPlayer) return null;

        const isSummonMode = abilityMode === 'SUMMONER_REAR';
        const isFrontMode = abilityMode === 'SUMMONER_FRONT';

        return (
            React.createElement("div", { className: "flex gap-2" },
                // Botón para invocar a Retaguardia
                React.createElement("div", { className: "relative" },
                    React.createElement("button", {
                        onClick: () => setAbilityMode(isSummonMode ? 'NONE' : 'SUMMONER_REAR'),
                        className: `px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${isSummonMode ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-indigo-200 text-indigo-500'}`
                    },
                        React.createElement("i", { className: "fa-solid fa-ghost" }),
                        `RETAGUARDIA (${player.rearBeasts.length}/2)`
                    ),
                    isSummonMode && (
                        React.createElement("div", { className: "absolute bottom-full mb-4 bg-white p-3 rounded-2xl shadow-2xl border border-indigo-100 grid grid-cols-2 gap-2 w-80 z-50" },
                            BEASTS.map(b => {
                                const isOwned = player.rearBeasts.includes(b.id);
                                return React.createElement("div", {
                                    key: b.id,
                                    onClick: () => !isOwned && performAction('SUMMON_TO_REAR', b.id),
                                    className: `p-2 border-2 rounded-xl cursor-pointer transition-all ${isOwned ? 'bg-indigo-50 border-indigo-500 opacity-50' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`
                                },
                                    React.createElement("p", { className: "font-black text-[10px] text-indigo-900" }, b.name),
                                    React.createElement("p", { className: "text-[8px] text-slate-500 leading-tight" }, b.description),
                                    !isOwned && React.createElement("span", { className: "text-[9px] font-black text-indigo-600" }, `Coste: ${b.mpCost} MP`)
                                );
                            })
                        )
                    )
                ),

                // Botón para mover al Frente (si ya jugó carta)
                player.rearBeasts.length > 0 && React.createElement("div", { className: "relative" },
                    React.createElement("button", {
                        onClick: () => setAbilityMode(isFrontMode ? 'NONE' : 'SUMMONER_FRONT'),
                        className: `px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${isFrontMode ? 'bg-rose-600 text-white' : 'bg-white border-2 border-rose-200 text-rose-500'}`
                    },
                        React.createElement("i", { className: "fa-solid fa-sword" }),
                        "MOVER AL FRENTE"
                    ),
                    isFrontMode && (
                        React.createElement("div", { className: "absolute bottom-full mb-4 bg-white p-3 rounded-2xl shadow-2xl border border-rose-100 grid grid-cols-2 gap-2 w-64 z-50" },
                            player.rearBeasts.map(beastId => {
                                const b = BEASTS.find(x => x.id === beastId)!;
                                return React.createElement("button", {
                                    key: b.id,
                                    onClick: () => performAction('MOVE_TO_FRONT', b.id),
                                    className: "p-2 bg-slate-50 border-2 border-slate-100 rounded-xl hover:border-rose-400 font-black text-[10px] text-slate-700"
                                }, b.name);
                            })
                        )
                    )
                ),

                // Habilidad de Comando: Filtrar Mano
                React.createElement("button", {
                    onClick: () => performAction('SUMMONER_COMMAND_DRAW'),
                    className: "px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-black text-xs text-slate-500 hover:border-teal-400"
                }, "FILTRAR MANO (1 MP)")
            )
        );
    }
}
