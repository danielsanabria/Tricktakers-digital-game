import { Player, CharacterType } from '../../game/core/types';
import { BaseScoring } from './BaseScoring';
import { ScoringResult } from './scoring_Interface';
import { PhantomThiefLogic } from '../characters/logic_PhantomThief';

export class PhantomThiefScoring extends BaseScoring {
    getScore(player: Player, round: number, allPlayers: Player[]): ScoringResult {
        const logs: string[] = [];
        let pts = 0;

        // Standard scoring for Phantom Thief is usually 0 unless special conditions?
        // Rule says: 0 wins = Black Crown, but -20 pts.
        // 2 wins = +50 pts to partner.
        if (player.wins === 0) {
            pts = -20;
            logs.push("Phantom Thief: 0 victorias. Gana corona negra pero pierde 20 puntos.");
        } else if (player.wins === 2) {
            // Partner gets 50 pts (handled in App logic but we can log it here)
            logs.push("Phantom Thief: 2 victorias. El socio recibe 50 puntos.");
        }

        return {
            score: pts,
            isInstantWin: false,
            logs
        };
    }

    // Custom method to handle partner bonus if needed, though App.tsx usually iterates all players.
    // We'll stick to the partner bonus being applied when the Phantom Thief's getScore is called?
    // No, better in App.tsx loop to keep it clean.
}
