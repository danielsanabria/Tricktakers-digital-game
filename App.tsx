import React, { useState, useRef } from 'react';
import { GamePhase, GameMode, Player } from './game/core/types';
import { CHARACTERS } from './game/core/constants';
import CharacterModal from './components/CharacterModal';
import { CharacterSelection } from './components/CharacterSelection';
import { LogsPanel } from './components/LogsPanel';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { RoundSummaryModal } from './components/modals/RoundSummaryModal';
import { HomeMenu } from './components/screens/HomeMenu';
import { LobbyScreen } from './components/screens/LobbyScreen';
import { JoinRoomModal } from './components/modals/JoinRoomModal';

// Components
import { GameHeader } from './components/GameHeader';
import { GameTable } from './components/GameTable';
import { PlayerHandArea } from './components/PlayerHandArea';
import { ModalsContainer } from './components/modals/ModalsContainer';
import { RulebooksModal } from './components/modals/RulebooksModal';
import { ItemCardModal } from './components/modals/ItemCardModal';

// Hooks & Services
import { useGameLoop, getInitialPlayers } from './hooks/useGameLoop';
import { useAI } from './hooks/useAI';
import { realtimeService, RoomParticipant, RealtimeCallbacks } from './services/realtimeService';

const App = () => {
    // 1. Hooks - The Engine
    const game = useGameLoop();

    // 2. Multiplayer State
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [multiplayerRoomCode, setMultiplayerRoomCode] = useState('');
    const [localPlayerId, setLocalPlayerId] = useState('p1');
    const [isHost, setIsHost] = useState(false);
    const [participants, setParticipants] = useState<RoomParticipant[]>([]);
    const [fillEmptyWithBots, setFillEmptyWithBots] = useState(true);
    const [playerCount, setPlayerCount] = useState(3);

    // AI Logic for solo or filled bot seats
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
        selectCharacter: (char) => {
            game.selectCharacter(char);
            if (multiplayerRoomCode) {
                realtimeService.broadcast('SELECT_CHARACTER', { character: char });
            }
        },
        playCard: (cardId) => {
            game.playCard(cardId);
            if (multiplayerRoomCode) {
                realtimeService.broadcast('PLAY_CARD', { cardId });
            }
        },
        trick: game.trick,
        round: game.round,
        difficulty: game.aiDifficulty,
        isRevolt: game.isRevolt,
        isKakumei: game.isKakumei
    });

    const isCurrentPlayer = game.currentPlayerIdx === 0 && game.phase === GamePhase.TRICK_PLAYING && !game.isResolvingRef.current;
    const currentPlayer = game.players[0];

    // Realtime Callbacks
    const setupRealtimeCallbacks = (): RealtimeCallbacks => ({
        onParticipantsChange: (pList) => {
            setParticipants(pList);
        },
        onDisconnectGracePeriod: (pId, secondsLeft) => {
            game.handlePlayerDisconnect(pId, secondsLeft);
        },
        onPlayerReconnected: (pId) => {
            game.handlePlayerReconnect(pId);
        },
        onBotTakeover: (pId) => {
            game.handleBotTakeover(pId);
        },
        onMessage: (msg) => {
            if (msg.type === 'START_GAME') {
                const count = msg.payload.playerCount || 4;
                const startingPlayers = msg.payload.players || getInitialPlayers(count);
                game.initGame(GameMode.ALL_STAR, count, startingPlayers);
            } else if (msg.type === 'PLAY_CARD') {
                game.playCard(msg.payload.cardId);
            } else if (msg.type === 'SELECT_CHARACTER') {
                game.selectCharacter(msg.payload.character);
            }
        }
    });

    // Multiplayer Room Handlers
    const handleCreateRoom = async (playerName: string) => {
        const code = realtimeService.generateRoomCode();
        setMultiplayerRoomCode(code);
        setLocalPlayerId('p1');
        setIsHost(true);
        setIsJoinModalOpen(false);

        await realtimeService.joinRoom(code, 'p1', playerName, true, setupRealtimeCallbacks());
        game.setPhase(GamePhase.LOBBY);
    };

    const handleJoinRoom = async (code: string, playerName: string) => {
        const pId = 'p_' + Math.floor(1000 + Math.random() * 9000);
        setMultiplayerRoomCode(code);
        setLocalPlayerId(pId);
        setIsHost(false);
        setIsJoinModalOpen(false);

        await realtimeService.joinRoom(code, pId, playerName, false, setupRealtimeCallbacks());
        game.setPhase(GamePhase.LOBBY);
    };

    const handleStartGameFromLobby = () => {
        const currentParts = realtimeService.getCurrentParticipants();
        const totalTarget = fillEmptyWithBots ? 4 : Math.max(2, currentParts.length);

        const playerList: Player[] = currentParts.map((part, idx) => ({
            id: part.id === localPlayerId ? 'p1' : `p${idx + 1}`,
            name: part.name,
            character: null,
            hand: [],
            wonCards: [],
            items: [],
            tasks: [],
            beasts: [],
            rearBeasts: [],
            mp: 0,
            magicElements: [],
            score: 30,
            goldCrowns: 0,
            blackCrowns: 0,
            wins: 0,
            gambleSwaps: 0,
            revoltUsed: false,
            rulerUsedRuleAvoidance: false,
            hermitUsedAbility: false,
            hermitDiscarding: false,
            strategistUsedIgnore: false,
            betAmount: 0,
            collectedCards: [],
            timeTravelTokens: 0,
            timeTravelPredictions: [],
            berserkerDeck: [],
            thiefTargetIds: [],
            thiefChipValue: part.id === localPlayerId ? null : 0,
            thiefBetrayalMode: false,
            tasksAssigned: {},
            isHuman: true,
            isConnected: true,
            disconnectCountdown: null,
            isBotControlled: false
        }));

        // Fill remaining with bots if requested
        let botIdx = playerList.length + 1;
        while (playerList.length < totalTarget) {
            playerList.push({
                id: `p${botIdx}`,
                name: `Bot ${botIdx - 1}`,
                character: null,
                hand: [],
                wonCards: [],
                items: [],
                tasks: [],
                beasts: [],
                rearBeasts: [],
                mp: 0,
                magicElements: [],
                score: 30,
                goldCrowns: 0,
                blackCrowns: 0,
                wins: 0,
                gambleSwaps: 0,
                revoltUsed: false,
                rulerUsedRuleAvoidance: false,
                hermitUsedAbility: false,
                hermitDiscarding: false,
                strategistUsedIgnore: false,
                betAmount: 0,
                collectedCards: [],
                timeTravelTokens: 0,
                timeTravelPredictions: [],
                berserkerDeck: [],
                thiefTargetIds: [],
                thiefChipValue: 0,
                thiefBetrayalMode: false,
                tasksAssigned: {},
                isHuman: false,
                isConnected: true,
                disconnectCountdown: null,
                isBotControlled: true
            });
            botIdx++;
        }

        // Broadcast to clients
        realtimeService.broadcast('START_GAME', {
            playerCount: playerList.length,
            players: playerList
        });

        game.initGame(GameMode.ALL_STAR, playerList.length, playerList);
    };

    const handleLeaveLobby = () => {
        realtimeService.leaveRoom();
        setMultiplayerRoomCode('');
        setParticipants([]);
        game.setPhase(GamePhase.MODE_SELECTION);
    };

    const handlePlayCard = (cardId: string) => {
        game.playCard(cardId);
        if (multiplayerRoomCode) {
            realtimeService.broadcast('PLAY_CARD', { cardId });
        }
    };

    return (
        <div className="w-full h-screen bg-gray-900 text-white overflow-hidden flex flex-col font-sans select-none relative">

            <GameHeader
                phase={game.phase}
                round={game.round}
                trick={game.trick}
                resetGame={() => {
                    if (multiplayerRoomCode) handleLeaveLobby();
                    else game.resetGame();
                }}
                toggleLogs={() => game.setShowLogs(!game.showLogs)}
                showLogs={game.showLogs}
                aiDifficulty={game.aiDifficulty}
                setAiDifficulty={game.setAiDifficulty}
            />

            {game.phase === GamePhase.MODE_SELECTION && (
                <HomeMenu
                    onSelectMode={(mode) => game.initGame(mode, playerCount)}
                    onOpenRules={() => game.setViewingRules(true)}
                    onOpenMultiplayer={() => setIsJoinModalOpen(true)}
                    aiDifficulty={game.aiDifficulty}
                    onSelectDifficulty={game.setAiDifficulty}
                    playerCount={playerCount}
                    onSelectPlayerCount={setPlayerCount}
                />
            )}

            {game.phase === GamePhase.LOBBY && (
                <LobbyScreen
                    roomCode={multiplayerRoomCode}
                    participants={participants}
                    localPlayerId={localPlayerId}
                    isHost={isHost}
                    fillEmptyWithBots={fillEmptyWithBots}
                    setFillEmptyWithBots={setFillEmptyWithBots}
                    aiDifficulty={game.aiDifficulty}
                    setAiDifficulty={game.setAiDifficulty}
                    onStartGame={handleStartGameFromLobby}
                    onLeaveLobby={handleLeaveLobby}
                />
            )}

            {game.phase === GamePhase.CHARACTER_SELECTION && (
                <div className="absolute inset-x-0 top-0 bottom-64 z-30 bg-slate-50/95 backdrop-blur-md overflow-hidden pt-20 shadow-2xl border-b border-slate-200">
                    <CharacterSelection
                        players={game.players}
                        characterPool={game.characterPool}
                        selectionOrder={game.selectionOrder}
                        selectionIndex={game.selectionIndex}
                        selectCharacter={(char) => {
                            game.selectCharacter(char);
                            if (multiplayerRoomCode) {
                                realtimeService.broadcast('SELECT_CHARACTER', { character: char });
                            }
                        }}
                    />
                </div>
            )}

            {/* Game Table Area - Visible in PLAYING, SELECTION, etc. */}
            {game.phase !== GamePhase.MODE_SELECTION && game.phase !== GamePhase.LOBBY && (
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
                            playCard={handlePlayCard}
                            abilityMode={game.abilityMode}
                            setAbilityMode={game.setAbilityMode}
                            selectedCards={game.selectedCards}
                            setSelectedCards={game.setSelectedCards}
                            performAction={game.performAction}
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
                                }
                                game.setPlayers(prev => prev.map(pl => {
                                    if (pl.character === '1C') {
                                        return { ...pl, score: pl.score + choice.pointsObj };
                                    }
                                    return pl;
                                }));
                            }
                            game.setStrategistPendingChoice(null);
                        }}
                    />
                </>
            )}

            {/* Global Modals */}
            <LogsPanel
                isOpen={game.showLogs}
                onClose={() => game.setShowLogs(false)}
                logs={game.logs}
            />

            <CharacterModal
                character={game.viewingCharacter ? CHARACTERS[game.viewingCharacter] : null}
                onClose={() => game.setViewingCharacter(null)}
            />

            <RulebooksModal
                isOpen={game.viewingRules}
                onClose={() => game.setViewingRules(false)}
            />

            <ItemCardModal
                itemCardPath={typeof game.itemCardToShow === 'string' ? game.itemCardToShow : game.itemCardToShow?.itemCardPath || null}
                onClose={() => game.setItemCardToShow(null)}
            />

            {/* Join / Create Multiplayer Room Modal */}
            <JoinRoomModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
            />

            {/* Round Summary Modal */}
            {game.roundResults && (
                <RoundSummaryModal
                    result={game.roundResults}
                    onProceed={game.proceedFromSummary}
                />
            )}

            {/* Game Over Screen */}
            {game.phase === GamePhase.GAME_OVER && (
                <GameOverScreen
                    players={game.players}
                    result={game.gameResult}
                    onRestart={() => {
                        if (multiplayerRoomCode) handleLeaveLobby();
                        else game.resetGame();
                    }}
                />
            )}
        </div>
    );
};

export default App;
