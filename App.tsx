import React, { useRef } from 'react';
import { GamePhase, GameMode } from './game/core/types';
import { CHARACTERS } from './game/core/constants';
import CharacterModal from './components/CharacterModal';
import { CharacterSelection } from './components/CharacterSelection';
import { LogsPanel } from './components/LogsPanel';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { RoundSummaryModal } from './components/modals/RoundSummaryModal';
import { HomeMenu } from './components/screens/HomeMenu';

// New Components
import { GameHeader } from './components/GameHeader';
import { GameTable } from './components/GameTable';
import { PlayerHandArea } from './components/PlayerHandArea';
import { ModalsContainer } from './components/modals/ModalsContainer';
import { RulebooksModal } from './components/modals/RulebooksModal';
import { ItemCardModal } from './components/modals/ItemCardModal';

// Hooks
import { useGameLoop } from './hooks/useGameLoop';
import { useAI } from './hooks/useAI';

const App = () => {
    // 1. Hooks - The Engine
    const game = useGameLoop();

    // 2. AI Logic
    useAI({
        phase: game.phase,
        currentPlayerIdx: game.currentPlayerIdx,
        players: game.players,
        isResolving: game.isResolvingRef.current,
        abilityMode: game.abilityMode,
        leadSuit: game.leadSuit,
        playedCards: game.playedCards,
        selectionIndex: game.selectionIndex,
        selectionOrder: game.selectionOrder,
        characterPool: game.characterPool,
        selectCharacter: game.selectCharacter,
        playCard: game.playCard
    });

    const isCurrentPlayer = game.currentPlayerIdx === 0 && game.phase === GamePhase.TRICK_PLAYING && !game.isResolvingRef.current;

    // Derived state for props
    const currentPlayer = game.players[0]; // Human is always p1

    return (
        <div className="w-full h-screen bg-gray-900 text-white overflow-hidden flex flex-col font-sans select-none relative">

            <GameHeader
                phase={game.phase}
                round={game.round}
                trick={game.trick}
                resetGame={game.resetGame}
                toggleLogs={() => game.setShowLogs(!game.showLogs)}
                showLogs={game.showLogs}
            />

            {game.phase === GamePhase.MODE_SELECTION && (
                <HomeMenu
                    onSelectMode={(mode) => game.initGame(mode)}
                    onOpenRules={() => game.setViewingRules(true)}
                />
            )}

            {game.phase === GamePhase.CHARACTER_SELECTION && (
                <div className="absolute inset-0 z-30 bg-slate-50 overflow-hidden pt-24">
                    <CharacterSelection
                        players={game.players}
                        characterPool={game.characterPool}
                        selectionOrder={game.selectionOrder}
                        selectionIndex={game.selectionIndex}
                        selectCharacter={game.selectCharacter}
                    />
                </div>
            )}

            {/* Game Table Area */}
            {game.phase !== GamePhase.MODE_SELECTION && game.phase !== GamePhase.CHARACTER_SELECTION && (
                <>
                    <GameTable
                        players={game.players}
                        currentPlayerIdx={game.currentPlayerIdx}
                        playedCards={game.playedCards}
                        selectedCards={game.selectedCards}
                        isKakumei={game.isKakumei}
                        leadSuit={game.leadSuit}
                        abilityMode={game.abilityMode}
                        setSelectedCards={game.setSelectedCards}
                        setViewingCharacter={game.setViewingCharacter}
                        setItemCardToShow={game.setItemCardToShow}
                    />

                    {/* Player Hand & Actions */}
                    <div className="w-full z-20 shrink-0">
                        <PlayerHandArea
                            player={currentPlayer}
                            isCurrentPlayer={isCurrentPlayer}
                            playCard={game.playCard}
                            abilityMode={game.abilityMode}
                            setAbilityMode={game.setAbilityMode}
                            selectedCards={game.selectedCards}
                            setSelectedCards={game.setSelectedCards}
                            performAction={game.performAction} // From useGameLoop -> useGameActions
                            round={game.round}

                            setViewingCharacter={game.setViewingCharacter}
                            setItemCardToShow={game.setItemCardToShow}
                            onReviewTraps={() => game.setViewingTraps(true)}
                            playedCards={game.playedCards}
                        />
                    </div>

                    {/* Modals Container for Character Setup */}
                    <ModalsContainer
                        abilityMode={game.abilityMode}
                        setAbilityMode={game.setAbilityMode}
                        players={game.players}
                        setPlayers={game.setPlayers}
                        performAction={game.performAction}
                        strategistPendingChoice={game.strategistPendingChoice}
                        onStrategistChoice={(choice) => {
                            if (choice) {
                                if (choice.type === 'BLACK7') {
                                    game.setStrategistInheritedCard({ id: 'str-b7', suit: 'BLACK', value: 7, type: 'NUMBER', ownerId: 'p1' } as any);
                                    game.addLog("Estratega elige: Heredar 7 Negro.");
                                } else {
                                    game.setStrategistInheritedCard({ id: 'str-rare', suit: 'COLORLESS', value: 0, type: 'RARE', ownerId: 'p1' } as any);
                                    game.addLog("Estratega elige: Heredar Carta Rara.");
                                }
                            } else {
                                game.addLog("Estratega no elige nada.");
                            }
                            game.setStrategistPendingChoice(null);
                            game.proceedFromSummary(); // Go to next phase
                        }}
                        strategistInheritedCard={game.strategistInheritedCard}
                        setStrategistInheritedCard={game.setStrategistInheritedCard}

                        addLog={game.addLog}
                        viewingTraps={game.viewingTraps}
                        setViewingTraps={game.setViewingTraps}
                        trapDeck={game.trapDeck}
                        trick={game.trick}
                        playedCards={game.playedCards}
                        selectedCards={game.selectedCards}
                    />

                    {/* Logs Panel */}
                    {game.showLogs && (
                        <LogsPanel logs={game.logs} onClose={() => game.setShowLogs(false)} />
                    )}
                </>
            )}

            {/* Global Modals */}
            {game.viewingRules && <RulebooksModal onClose={() => game.setViewingRules(false)} />}

            {game.roundResults && (
                <RoundSummaryModal
                    result={game.roundResults}
                    onNext={() => {
                        if (game.strategistPendingChoice) {
                            // Wait for Strategist
                        } else {
                            game.proceedFromSummary();
                        }
                    }}
                    isLastRound={game.round >= 3}
                />
            )}

            {game.phase === GamePhase.GAME_OVER && game.gameResult && (
                <GameOverScreen
                    result={game.gameResult}
                    players={game.players}
                    onReset={game.resetGame}
                />
            )}

            {/* Reusable Modals */}
            {game.viewingCharacter && (
                <CharacterModal
                    character={CHARACTERS[game.viewingCharacter]}
                    onClose={() => game.setViewingCharacter(null)}
                />
            )}

            {game.itemCardToShow && (
                <ItemCardModal
                    imageUrl={typeof game.itemCardToShow === 'string' ? game.itemCardToShow : game.itemCardToShow?.itemCardPath || null}
                    onClose={() => game.setItemCardToShow(null)}
                />
            )}

            {/* Footer / Rulebook Button - Hidden on Home Screen */}
            {game.phase !== GamePhase.MODE_SELECTION && (
                <div className="absolute bottom-4 left-4 z-50">
                    <button
                        onClick={() => game.setViewingRules(true)}
                        className="bg-gray-800/80 hover:bg-gray-700/80 text-white/50 hover:text-white px-3 py-1 rounded-full text-xs font-medium transition-colors backdrop-blur-sm border border-white/10"
                    >
                        Reglamentos
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
