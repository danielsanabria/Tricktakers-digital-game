
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, UIContext, Card } from '../../game/core/types';

export class GamblerLogic extends BaseCharacterLogic {
    onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
        // Gambler Win Conditions:
        // 1. Bid 4 and Won 4
        // 2. Won 5 (Automatic)
        if (player.wins >= 5 || (player.bid === 4 && player.wins === 4)) {
            return { score: 999 }; // Trigger Instant Win
        }
        return {};
    }

    setup(context: SetupContext): Partial<Player> {
        const { deck, playerId, players, hand: providedHand } = context;
        const currentPlayer = players.find(p => p.id === playerId);

        // El Tahúr recibe +20 puntos inmediatamente al ser elegido
        const hand = providedHand || deck.splice(0, 5).map(c => ({ ...c, ownerId: playerId }));

        return {
            hand,
            score: (currentPlayer?.score || 0) + 20,
            gambleSwaps: 2,
            bid: undefined,
            betAmount: 0
        };
    }

    renderActions(context: UIContext): React.ReactNode {
        const { isCurrentPlayer, performAction, abilityMode, selectedCards, player } = context;
        if (!isCurrentPlayer || !player) return null;

        // 1. Swap Phase
        if (abilityMode === 'GAMBLER_SWAP') {
            const swapCount = selectedCards.length;
            // Limit 2 swaps? Or based on `gambleSwaps`?
            // Helper logic: context.player.gambleSwaps tells remaining swaps.
            // Assuming we allow multi-select up to remaining limit.
            const remaining = player.gambleSwaps || 0;

            return React.createElement("div", { className: "fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-900/90 p-4 rounded-xl border border-emerald-500 shadow-xl text-white z-50 animate-fade-in" },
                React.createElement("h3", { className: "font-bold text-center text-emerald-300" }, "Fase de Descarte"),
                React.createElement("p", { className: "text-xs text-center mb-2" }, `Selecciona cartas para cambiar (Restantes: ${remaining}).`),

                React.createElement("div", { className: "flex gap-2 justify-center" },
                    React.createElement("button", {
                        className: `btn ${swapCount > 0 && swapCount <= remaining ? 'btn-emerald' : 'bg-slate-700 text-gray-500'}`,
                        disabled: swapCount === 0 || swapCount > remaining,
                        onClick: () => performAction('GAMBLER_EXECUTE_SWAP')
                    }, "CAMBIAR CARTAS"),

                    React.createElement("button", {
                        className: "btn bg-slate-600 hover:bg-slate-500 text-white",
                        onClick: () => performAction('GAMBLER_SKIP_SWAP')
                    }, "OMITIR")
                )
            );
        }

        // 2. Bidding Phase
        if (abilityMode === 'GAMBLE_BID') {
            const bids = [0, 1, 2, 3, 4, 5];
            return React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" },
                React.createElement("div", { className: "bg-gradient-to-br from-emerald-900 to-slate-900 p-8 rounded-2xl border-2 border-emerald-500 shadow-2xl max-w-lg w-full" },
                    React.createElement("h2", { className: "text-2xl font-black text-center text-white mb-2" }, "APUESTA DE VICTORIAS"),
                    React.createElement("p", { className: "text-emerald-300 text-center mb-6" }, "¿Cuántas bazas crees que vas a ganar?"),

                    React.createElement("div", { className: "grid grid-cols-3 gap-3 mb-6" },
                        bids.map(bid => React.createElement("button", {
                            key: bid,
                            onClick: () => performAction('GAMBLER_BID', bid),
                            className: "p-4 bg-slate-800 hover:bg-emerald-600 rounded-xl border border-emerald-500/30 transition-all transform hover:scale-105"
                        },
                            React.createElement("span", { className: "text-xl font-bold text-white block" }, bid),
                            React.createElement("span", { className: "text-[10px] text-emerald-200 uppercase" }, bid === 1 ? "Baza" : "Bazas")
                        ))
                    ),
                    React.createElement("div", { className: "text-center text-xs text-gray-400 italic" }, "Acertar tu predicción otorga grandes bonificaciones.")
                )
            );
        }

        // 3. Betting (Points) Phase - If implemented separately or implied?
        // useGameActions has GAMBLER_SET_BET.
        // If abilityMode is GAMBLER_BETTING (Line 94 useGameActions sets this).
        if (abilityMode === 'GAMBLER_BETTING') {
            // Logic to select Points Bet? Or simplified to "All In" / "Safe"?
            // Let's assume input number or buttons.
            return React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70" },
                React.createElement("div", { className: "bg-slate-800 p-6 rounded-xl border border-yellow-500" },
                    React.createElement("h3", { className: "text-white font-bold mb-4" }, "Apuesta de Puntos"),
                    React.createElement("div", { className: "flex gap-2" },
                        [10, 20, 30, 50, 100].map(amt =>
                            React.createElement("button", {
                                key: amt,
                                onClick: () => performAction('GAMBLER_SET_BET', amt),
                                className: "btn btn-amber"
                            }, `${amt} pts`)
                        )
                    )
                )
            );
        }

        return null;
    }
}
