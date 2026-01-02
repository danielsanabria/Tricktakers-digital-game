
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
        return null;
    }
}
