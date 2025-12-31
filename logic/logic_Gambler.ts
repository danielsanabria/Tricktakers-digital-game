
import React from 'react';
import { BaseCharacterLogic } from './logic_Interface';
import { SetupContext, Player, UIContext, Card } from '../types';

export class GamblerLogic extends BaseCharacterLogic {
    onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
        const newWins = (player.wins || 0) + 1;
        // Gambler Win Conditions:
        // 1. Bid 4 and Won 4
        // 2. Won 5 (Automatic)
        if (newWins === 5 || (player.bid === 4 && newWins === 4)) {
            return { score: 999, wins: newWins }; // Trigger Instant Win
        }
        return { wins: newWins };
    }

    setup(context: SetupContext): Partial<Player> {
        const { deck, playerId, players } = context;
        const currentPlayer = players.find(p => p.id === playerId);

        // El Tahúr recibe +20 puntos inmediatamente al ser elegido
        const hand = deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));

        return {
            hand,
            score: (currentPlayer?.score || 0) + 20,
            gambleSwaps: 2,
            bid: undefined,
            betAmount: 0
        };
    }

    renderActions(context: UIContext): React.ReactNode {
        const { isCurrentPlayer, performAction, player, abilityMode, setAbilityMode, selectedCards, round } = context;
        if (!isCurrentPlayer) return null;

        // Paso 1: Filtrado de mano (2 oportunidades)
        if (player.gambleSwaps !== undefined && player.gambleSwaps > 0 && player.bid === undefined) {
            return (
                React.createElement("div", { className: "flex flex-col gap-2 items-center bg-white px-4 py-3 rounded-2xl shadow-xl border-2 border-amber-400" },
                    React.createElement("span", { className: "text-[10px] font-black text-amber-600 uppercase" }, `Filtrado de Mano (${player.gambleSwaps} veces)`),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("button", {
                            disabled: selectedCards.length === 0,
                            onClick: () => performAction('GAMBLER_EXECUTE_SWAP'),
                            className: "px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-xs disabled:opacity-50 hover:bg-amber-600 transition-colors"
                        }, "CAMBIAR SELECCIONADAS"),
                        React.createElement("button", {
                            onClick: () => performAction('GAMBLER_SKIP_SWAP'),
                            className: "px-4 py-2 bg-slate-200 text-slate-600 rounded-xl font-black text-xs"
                        }, "ESTOY LISTO")
                    )
                )
            );
        }

        // Paso 2: La Apuesta de Bazas (Bid)
        if (player.bid === undefined) {
            return (
                React.createElement("div", { className: "flex flex-col gap-2 items-center bg-white px-4 py-3 rounded-2xl shadow-xl border-2 border-amber-400" },
                    React.createElement("span", { className: "text-[10px] font-black text-amber-600 uppercase" }, "Declara tus victorias (0-5)"),
                    React.createElement("div", { className: "flex gap-1.5" },
                        [0, 1, 2, 3, 4, 5].map(num =>
                            React.createElement("button", {
                                key: num,
                                onClick: () => performAction('GAMBLER_BID', num),
                                className: "w-8 h-8 rounded-xl bg-slate-100 hover:bg-amber-400 hover:text-white text-xs font-black transition-all"
                            }, num.toString())
                        )
                    )
                )
            );
        }

        // Paso 3: La Apuesta de Puntos (Bet)
        if (player.betAmount === 0 || abilityMode === 'GAMBLER_BETTING') {
            const maxBet = round === 3 ? 100 : 50;
            const betValues = [10, 20, 30, 40, 50, 100].filter(v => v <= maxBet);

            return (
                React.createElement("div", { className: "flex flex-col gap-2 items-center bg-white px-4 py-3 rounded-2xl shadow-xl border-2 border-amber-400" },
                    React.createElement("span", { className: "text-[10px] font-black text-amber-600 uppercase" }, `Apuesta puntos (Máx ${maxBet})`),
                    React.createElement("div", { className: "flex gap-1.5" },
                        [0, ...betValues].map(val =>
                            React.createElement("button", {
                                key: val,
                                onClick: () => performAction('GAMBLER_SET_BET', val),
                                className: "px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-[10px] font-black transition-all"
                            }, val === 0 ? "PASAR" : `${val} PTS`)
                        )
                    )
                )
            );
        }

        return null;
    }
}
