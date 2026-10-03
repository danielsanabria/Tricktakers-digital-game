
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { SetupContext, Player, Card, CardType, Suit, PowerContext, UIContext } from '../../game/core/types';

export class HermitLogic extends BaseCharacterLogic {

    setup(context: SetupContext): Partial<Player> {
        // En las reglas oficiales el Ermitaño no tiene preparación especial,
        // recibe su mano normal de 5 cartas y utiliza "Mano Diestra" para filtrar su mano.
        return super.setup(context);
    }

    getCardPower(context: PowerContext): number {
        const { card, trickContainsRare } = context;
        let power = super.getCardPower(context);

        // Habilidad del Ermitaño: La Bandera Blanca vence a la Rara (Hierarchy 4A)
        if (card.type === CardType.WHITE_FLAG && trickContainsRare && !(context.isKakumei || context.isRevolt)) {
            power = 5000;
        }

        return power;
    }

    onTrickWon(player: Player, cards: Card[], round: number): Partial<Player> {
        const hermitPlayedWhiteFlag = cards.some(c => c.ownerId === player.id && c.type === CardType.WHITE_FLAG);
        const trickHadRare = cards.some(c => c.type === CardType.RARE);
        let updates: Partial<Player> = {};

        if (hermitPlayedWhiteFlag && trickHadRare) {
            // Bonificación inmediata por "pesca" de carta Rara
            const bonus = round === 3 ? 100 : 30;
            updates.score = (player.score || 0) + bonus;
        }

        return updates;
    }
    renderActions(context: UIContext): React.ReactNode {
        const { isCurrentPlayer, performAction, abilityMode, player, selectedCards } = context;
        if (!isCurrentPlayer) return null;

        const hasUsedThisTrick = player.hermitUsedAbility;
        const isDiscarding = abilityMode === 'HERMIT_DISCARD' || !!(player as any).hermitDiscarding;

        if (hasUsedThisTrick && !isDiscarding) return null;

        return (
            React.createElement("div", { className: "flex flex-col items-center gap-2 bg-emerald-50 p-3 rounded-2xl border-2 border-emerald-400 shadow-xl" },
                React.createElement("div", { className: "flex items-center gap-2 mb-1" },
                    React.createElement("i", { className: "fa-solid fa-hand-sparkles text-emerald-600" }),
                    React.createElement("span", { className: "text-[10px] font-black text-emerald-700 uppercase tracking-widest" }, "Mano Diestra")
                ),

                !isDiscarding ? (
                    React.createElement("button", {
                        onClick: () => performAction('HERMIT_START_ABILITY'),
                        className: "btn btn-emerald"
                    }, "ROBAR CARTA EXTRA")
                ) : (
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("span", { className: "text-[9px] font-bold text-emerald-800 flex items-center bg-white px-3 py-1 rounded-lg border border-emerald-200" }, "DESCARTA 1 CARTA"),
                        React.createElement("button", {
                            disabled: selectedCards.length !== 1,
                            onClick: () => performAction('HERMIT_EXECUTE_DISCARD'),
                            className: "btn btn-emerald"
                        }, "CONFIRMAR")
                    )
                )
            )
        );
    }
}
