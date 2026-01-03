import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, PowerContext, UIContext, CardType, Card, Suit } from '../../game/core/types';
import { BEASTS } from '../../game/core/constants';

export class SummonerLogic extends BaseCharacterLogic {
    setup(context: SetupContext): Partial<Player> {
        return {
            ...super.setup(context),
            mp: 5, // Start with 5 MP (per rules)
            beasts: BEASTS.map(b => ({ ...b, active: false })),
            rearBeasts: [],
            frontBeastId: null,
            magicElements: []
        };
    }

    onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
        // Gain 1 MP per trick won standard
        // +1 MP if EL (Phoenix) is in Rearguard (Passive)
        let mpGain = 1;
        if (player.rearBeasts.includes('b-el')) {
            mpGain += 1; // "EL: Rear: +1 MP/turn"
        }
        return { mp: Math.min((player.mp || 0) + mpGain, 10) };
    }

    getCardPower(context: PowerContext): number {
        const { card, player } = context;
        // If a beast is in FRONT (activeBeastId), it overrides the card power/type
        const activeBeastId = player.frontBeastId;

        if (activeBeastId && card.type !== 'SUMMONED_BEAST') { // Ensure we don't double apply if card is already virtual
            const beast = BEASTS.find(b => b.id === activeBeastId);
            if (beast) {
                // 1. EL (Phoenix) - Front: White Flag
                if (beast.id === 'b-el') {
                    // White Flag Logic: Power 0 usually. But Beats Rare?
                    if (context.trickContainsRare) return 5000;
                    return 0;
                }

                // 2. MIRIA (Dragon) - Front: Berserker
                if (beast.id === 'b-miria') {
                    // Berserker: Beats standard (3000), but loses to 1?
                    if (context.onesInSuits.length > 0 && !context.isRevolt && !context.isKakumei) {
                        return -1;
                    }
                    return 3000;
                }

                // 3. OKO (Black 10)
                if (beast.id === 'b-oko') {
                    const virtualCard = { ...card, suit: Suit.BLACK, value: 10, type: CardType.NUMBER };
                    return super.getCardPower({ ...context, card: virtualCard });
                }

                // 4. COLORS (Maru/Guru/Nemu) - Rank 10 of specific suit
                if (beast.suit) {
                    const virtualCard = { ...card, suit: beast.suit, value: 10, type: CardType.NUMBER };
                    return super.getCardPower({ ...context, card: virtualCard });
                }
            }
        }

        return super.getCardPower(context);
    }

    renderActions(context: UIContext): React.ReactNode {
        const { abilityMode, setAbilityMode, player, performAction, isCurrentPlayer } = context;
        if (!isCurrentPlayer) return null;

        const isSummonMode = abilityMode === 'SUMMONER_REAR';
        const isFrontMode = abilityMode === 'SUMMONER_FRONT';
        const isAttackMode = abilityMode === 'SUMMONER_SELECT_CARD';

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
                        performAction('SUMMONER_CANCEL_ATTACK');
                    },
                    className: "btn btn-slate !bg-white !text-slate-500 !py-1.5 !px-3 text-[10px]"
                }, "CANCELAR")
            );
        }

        return (
            React.createElement("div", { className: "flex gap-2" },
                // Summon Button
                React.createElement("div", { className: "relative" },
                    React.createElement("button", {
                        onClick: () => setAbilityMode(isSummonMode ? 'NONE' : 'SUMMONER_REAR'),
                        className: `btn ${isSummonMode ? 'btn-purple scale-105 shadow-lg' : 'btn-slate !bg-white !text-slate-500 hover:!border-purple-500'} !py-1.5 !px-3 text-[10px]`
                    },
                        React.createElement("i", { className: "fa-solid fa-ghost" }),
                        `RETAGUARDIA (${player.rearBeasts.length}/2)`
                    ),

                    isSummonMode && (
                        React.createElement("div", { className: "absolute bottom-full mb-4 bg-white p-2 rounded-xl shadow-xl w-64 z-50 grid grid-cols-1 gap-1 animate-in slide-in-from-bottom-2 duration-300" },
                            BEASTS.map(b => {
                                const canAfford = player.mp >= b.mpCost;
                                const isOwned = player.rearBeasts.includes(b.id);
                                return React.createElement("button", {
                                    key: b.id,
                                    disabled: !canAfford || isOwned,
                                    onClick: () => performAction('SUMMON_TO_REAR', b.id),
                                    className: `text-left px-2 py-1 text-[10px] rounded border ${isOwned ? 'bg-gray-100 text-gray-400' : canAfford ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-white border-red-100 text-red-300 cursor-not-allowed'}`
                                }, `${b.name} (${b.mpCost} MP)`);
                            })
                        )
                    )
                ),

                // Front Button
                player.rearBeasts.length > 0 && React.createElement("div", { className: "relative" },
                    React.createElement("button", {
                        onClick: () => setAbilityMode(isFrontMode ? 'NONE' : 'SUMMONER_FRONT'),
                        className: `btn ${isFrontMode ? 'btn-rose scale-105 shadow-lg' : 'btn-slate !bg-white !text-slate-500 hover:!border-rose-500'} !py-1.5 !px-3 text-[10px]`
                    },
                        React.createElement("i", { className: "fa-solid fa-sword" }),
                        player.frontBeastId ? "BESTIA LISTA" : "MOVER AL FRENTE"
                    ),

                    isFrontMode && (
                        React.createElement("div", { className: "absolute bottom-full mb-4 bg-white p-2 rounded-xl shadow-xl w-48 z-50 flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-300" },
                            player.rearBeasts.map(bid => {
                                const b = BEASTS.find(x => x.id === bid)!;
                                return React.createElement("button", {
                                    key: bid,
                                    onClick: () => performAction('SUMMONER_EQUIP_BEAST', bid),
                                    className: `text-left px-2 py-1 text-[10px] hover:bg-rose-50 rounded text-rose-700 font-bold border border-transparent hover:border-rose-200`
                                }, `Equipar ${b.name}`);
                            })
                        )
                    )
                ),

                // Draw Ability (Command)
                React.createElement("button", {
                    onClick: () => performAction('SUMMONER_COMMAND_DRAW'),
                    className: "btn btn-slate !bg-white !text-slate-500 hover:!border-teal-400 !py-1.5 !px-3 text-[10px]"
                }, "FILTRAR (1 MP)")
            )
        );
    }
}
