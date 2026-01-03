import React from 'react';
import { Player, CharacterType, Card, Suit, CardType } from '../../game/core/types';
import { getCharacterLogic } from '../../logic/logic_Registry';
import { AdventurerSetupModal } from './AdventurerSetupModal';
import { BerserkerSetupModal } from './BerserkerSetupModal';
import { KingSetupModal } from './KingSetupModal';
import { RulerSetupModal } from './RulerSetupModal';
import { PhantomThiefSetupModal } from './PhantomThiefSetupModal';
import { StrategistModal } from './StrategistModal';
import { GamblerSetupModal } from './GamblerSetupModal';
import { StrategistTrapModal } from './StrategistTrapModal';
import { StrategistReviewModal } from './StrategistReviewModal';
import { TimeTravelerSetupModal } from './TimeTravelerSetupModal';
import { TimeTravelerDiscardModal } from './TimeTravelerDiscardModal';
import { TimeTravelerWinModal } from './TimeTravelerWinModal';
import { TimeTravelerDistributeModal } from './TimeTravelerDistributeModal';

interface ModalsContainerProps {
    abilityMode: string;
    setAbilityMode: (mode: string) => void;
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    performAction: (actionName: string, payload?: any) => void;
    strategistPendingChoice: { type: 'BLACK7' | 'RARE', pointsObj: number } | null;
    onStrategistChoice: (pts: number) => void;
    setStrategistInheritedCard: (card: Card | null) => void;
    setPhase: (phase: any) => void;
    setStrategistPendingChoice: (choice: any) => void;
    phase: any; // GamePhase
    addLog: (msg: string) => void;
    viewingTraps: boolean;
    setViewingTraps: (viewing: boolean) => void;
    trapDeck: any[];
    trick: number;
}

export const ModalsContainer: React.FC<ModalsContainerProps> = ({
    abilityMode,
    setAbilityMode,
    players,
    setPlayers,
    performAction,
    strategistPendingChoice,
    onStrategistChoice,
    setStrategistInheritedCard,
    setPhase,
    setStrategistPendingChoice,
    phase,
    addLog,
    viewingTraps,
    setViewingTraps,
    trapDeck,
    trick
}) => {
    console.log('ModalsContainer rendering with abilityMode:', abilityMode);
    return (
        <>
            {/* Strategist Review Modal */}
            {viewingTraps && (
                <StrategistReviewModal
                    traps={trapDeck}
                    onClose={() => setViewingTraps(false)}
                    currentTrick={trick}
                />
            )}

            {/* Strategist Choice Modal */}
            <StrategistModal
                choice={strategistPendingChoice}
                onChoosePoints={onStrategistChoice}
                onChooseCard={(type) => {
                    const cardToInherit: Card = {
                        id: `inherited-${type}-${Date.now()}`,
                        suit: type === 'BLACK7' ? Suit.BLACK : Suit.COLORLESS,
                        value: type === 'BLACK7' ? 7 : 11,
                        type: type === 'BLACK7' ? CardType.NUMBER : CardType.RARE,
                        ownerId: 'p1'
                    };
                    setStrategistInheritedCard(cardToInherit);
                    addLog(`Estratega eligió llevarse la carta ${type === 'BLACK7' ? '7 Negro' : 'Rara'} a la siguiente ronda.`);
                    setStrategistPendingChoice(null);
                    // We assume phase represents GamePhase.ROUND_SUMMARY constant value
                    setPhase('ROUND_SUMMARY' as any);
                }}
            />

            {/* Strategist Trap Setup Modal */}
            {abilityMode === 'STRATEGIST_SETUP' && (
                <StrategistTrapModal
                    onConfirm={(traps) => performAction('STRATEGIST_SET_TRAPS', { traps })}
                />
            )}

            {/* Adventurer Setup Modal */}
            {abilityMode === 'ADVENTURER_SETUP' && (
                <AdventurerSetupModal
                    onConfirm={(red, blue) => {
                        performAction('ADVENTURER_PICK_ITEMS', { redItemId: red, blueItemId: blue });
                    }}
                />
            )}

            {/* Berserker Setup Modal */}
            {abilityMode === 'BERSERKER_SETUP' && (
                <BerserkerSetupModal
                    onConfirm={() => {
                        setPlayers(prev => {
                            const p1 = prev.find(p => p.id === 'p1')!;
                            const logic = getCharacterLogic(CharacterType.BERSERKER) as any;

                            if (logic.drawBerserkerHand && p1.berserkerDeck) {
                                const { hand, remaining } = logic.drawBerserkerHand(p1.berserkerDeck);
                                return prev.map(p => p.id === 'p1' ? {
                                    ...p,
                                    hand,
                                    berserkerDeck: remaining
                                } : p);
                            }
                            return prev;
                        });

                        setAbilityMode('NONE');
                        addLog("¡Berserker ha descartado su mano y desenvainado su mazo exclusivo!");
                    }}
                />
            )}

            {/* King Setup Modal */}
            {abilityMode === 'KING_SETUP' && players.find(p => p.id === 'p1') && (
                <KingSetupModal
                    player={players.find(p => p.id === 'p1')!}
                    onDiscard={(card) => {
                        setPlayers(prev => {
                            const p1 = prev.find(p => p.id === 'p1')!;
                            const newHand = p1.hand.filter(c => c.id !== card.id);
                            return prev.map(p => p.id === 'p1' ? { ...p, hand: newHand } : p);
                        });
                        setAbilityMode('NONE');
                        addLog(`Rey ha descartado ${card.suit} ${card.value}.`);
                    }}
                />
            )}

            {/* Ruler Setup Modal */}
            {abilityMode === 'RULER_SETUP' && (
                <RulerSetupModal
                    otherPlayers={players.filter(p => p.id !== 'p1')}
                    onConfirm={(assignments) => performAction('RULER_ASSIGN_TASKS', assignments)}
                />
            )}

            {/* Gambler Setup Modal */}
            {(abilityMode === 'GAMBLER_SWAP' || abilityMode === 'GAMBLE_BID' || abilityMode === 'GAMBLER_BETTING') && (
                <GamblerSetupModal
                    player={players.find(p => p.id === 'p1')!}
                    mode={abilityMode === 'GAMBLER_SWAP' ? 'SWAP' : abilityMode === 'GAMBLE_BID' ? 'BID' : 'BET'}
                    round={1}
                    onSwap={(cardIds) => performAction('GAMBLER_EXECUTE_SWAP', { cardIds })}
                    onSkipSwap={() => performAction('GAMBLER_SKIP_SWAP')}
                    onBid={(bid) => performAction('GAMBLER_BID', bid)}
                    onBet={(bet) => performAction('GAMBLER_SET_BET', bet)}
                />
            )}

            {/* Phantom Thief Setup Modal */}
            {abilityMode === 'PHANTOM_THIEF_SETUP' && (
                <PhantomThiefSetupModal
                    onConfirm={(suits) => performAction('PHANTOM_THIEF_SETUP', suits)}
                />
            )}

            {/* Time Traveler Setup Modal */}
            {abilityMode === 'TIME_TRAVELER_SETUP' && (
                <TimeTravelerSetupModal
                    players={players}
                    onConfirm={(gold, black1, black2) => performAction('TIME_TRAVEL_PREDICT', { gold, black1, black2 })}
                />
            )}

            {/* Time Traveler Discard Modal */}
            {abilityMode === 'TIME_TRAVEL_DRAW_DISCARD' && (
                <TimeTravelerDiscardModal
                    player={players.find(p => p.id === 'p1')!}
                    onConfirm={(ids) => performAction('TIME_TRAVEL_FINISH_REWIND', { discardedCardIds: ids })}
                />
            )}

            {/* Time Traveler Win Choice Modal */}
            {abilityMode === 'TIME_TRAVEL_WIN_CHOICE' && (
                <TimeTravelerWinModal
                    onConfirm={() => performAction('TIME_TRAVEL_CHANGE_PAST')}
                    onSkip={() => performAction('COMPLETE_TRICK_NORMAL')}
                />
            )}

            {/* Time Traveler Distribute Modal */}
            {abilityMode === 'TIME_TRAVEL_DISTRIBUTE' && (
                <TimeTravelerDistributeModal
                    player={players.find(p => p.id === 'p1')!}
                    opponents={players.filter(p => p.id !== 'p1')}
                    onConfirm={(assignments) => performAction('TIME_TRAVEL_EXECUTE_DISTRIBUTION', assignments)}
                />
            )}
        </>
    );
};
