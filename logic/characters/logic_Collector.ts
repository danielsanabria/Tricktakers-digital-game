
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext } from '../../game/core/types';

export class CollectorLogic extends BaseCharacterLogic {
    renderActions(context: UIContext): React.ReactNode {
        const { isCurrentPlayer, selectedCards, abilityMode, setAbilityMode, performAction } = context;
        if (!isCurrentPlayer) return null;

        const isReserving = abilityMode === 'COLLECTOR_RESERVE';

        // Logic implies reserving INSTEAD of playing, or reserving AFTER playing? 
        // Manual: "Reserve a card... place it face up in front of you."
        // For simplicity in this engine, we treat it as a special action mode.

        return (
            React.createElement("div", { className: "flex gap-2" },
                React.createElement("button", {
                    onClick: () => setAbilityMode(isReserving ? 'NONE' : 'COLLECTOR_RESERVE'),
                    className: `btn ${isReserving ? 'btn-amber scale-105 shadow-lg' : 'btn-slate !bg-white !text-slate-500 hover:!border-amber-500'} !py-1.5 !px-4 text-[11px]`
                }, "RESERVAR CARTA"),

                isReserving && React.createElement("button", {
                    disabled: selectedCards.length !== 1,
                    onClick: () => performAction('COLLECTOR_RESERVE_CONFIRM'),
                    className: "btn btn-amber !py-1.5 !px-4 text-[11px] disabled:opacity-50"
                }, "CONFIRMAR")
            )
        );
    }
}
