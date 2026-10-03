import React, { useState, useRef, useEffect } from 'react';
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
    const [myInGameId, setMyInGameId] = useState('p1');
    const [isHost, setIsHost] = useState(false);
    const [participants, setParticipants] = useState<RoomParticipant[]>([]);
    const [fillEmptyWithBots, setFillEmptyWithBots] = useState(true);
    const [playerCount, setPlayerCount] = useState(3);
    const seatMapRef = useRef<Record<string, string>>({});
    const localPlayerIdRef = useRef<string>('p1');
    const isHostRef = useRef<boolean>(false);

    const getPersistentParticipantId = (): string => {
        let pId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tricktakers_participant_id') : null;
        if (!pId) {
            pId = 'p_' + Math.floor(1000 + Math.random() * 9000);
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('tricktakers_participant_id', pId);
            }
        }
        return pId;
    };

    // AI Logic for solo or filled bot seats (Only Host runs AI decisions in multiplayer)
    useAI({
        enabled: !multiplayerRoomCode || isHost,
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
        },
        playCard: (cardId) => {
            game.playCard(cardId);
        },
        trick: game.trick,
        round: game.round,
        difficulty: game.aiDifficulty,
        isRevolt: game.isRevolt,
        isKakumei: game.isKakumei
    });

    const myPlayer = game.players.find(p => p.id === myInGameId) || game.players[0];
    const isCurrentPlayer = game.players[game.currentPlayerIdx]?.id === myInGameId && game.phase === GamePhase.TRICK_PLAYING && !game.isResolvingRef.current;

    const handleProceedSummary = () => {
        if (!multiplayerRoomCode || isHostRef.current) {
            game.proceedFromSummary();
        } else {
            realtimeService.broadcast('PROCEED_ROUND', { playerId: myInGameId });
        }
    };

    // Realtime Callbacks
    const setupRealtimeCallbacks = (): RealtimeCallbacks => ({
        onParticipantsChange: (pList) => {
            setParticipants(pList);
        },
        onDisconnectGracePeriod: (pId, secondsLeft) => {
            const mappedSeat = seatMapRef.current[pId] || pId;
            game.handlePlayerDisconnect(mappedSeat, secondsLeft);
        },
        onPlayerReconnected: (pId) => {
            const mappedSeat = seatMapRef.current[pId] || pId;
            game.handlePlayerReconnect(mappedSeat);
        },
        onBotTakeover: (pId) => {
            const mappedSeat = seatMapRef.current[pId] || pId;
            game.handleBotTakeover(mappedSeat);
        },
        onMessage: (msg) => {
            if (msg.type === 'PLAY_CARD') {
                if (isHostRef.current) {
                    game.playCard(msg.payload.cardId);
                }
            } else if (msg.type === 'SELECT_CHARACTER') {
                if (isHostRef.current) {
                    game.selectCharacter(msg.payload.character);
                }
            } else if (msg.type === 'PROCEED_ROUND') {
                if (isHostRef.current) {
                    game.proceedFromSummary();
                }
            } else if (msg.type === 'RECONNECT') {
                const pId = msg.payload?.participantId || msg.payload?.playerId;
                if (isHostRef.current && pId) {
                    const mappedSeat = seatMapRef.current[pId];
                    if (mappedSeat) {
                        game.handlePlayerReconnect(mappedSeat);
                    }
                    if (game.phase !== GamePhase.LOBBY && game.phase !== GamePhase.MODE_SELECTION) {
                        realtimeService.broadcast('SYNC_FULL_STATE', {
                            phase: game.phase,
                            round: game.round,
                            trick: game.trick,
                            players: game.players,
                            currentPlayerIdx: game.currentPlayerIdx,
                            leadSuit: game.leadSuit,
                            playedCards: game.playedCards,
                            isKakumei: game.isKakumei,
                            isRevolt: game.isRevolt,
                            seatMap: seatMapRef.current,
                            characterPool: game.characterPool,
                            selectionOrder: game.selectionOrder,
                            selectionIndex: game.selectionIndex,
                            gameMode: game.gameMode,
                            roundResults: game.roundResults,
                            gameResult: game.gameResult
                        });
                    }
                }
            } else if (msg.type === 'SYNC_FULL_STATE') {
                const payload = msg.payload;
                if (payload.seatMap) {
                    seatMapRef.current = payload.seatMap;
                    const mySeat = payload.seatMap[localPlayerIdRef.current] || 'p2';
                    setMyInGameId(mySeat);
                    game.setLocalSeatId(mySeat);
                }
                game.restoreFullState(payload);
            }
        }
    });

    // Keep realtime callbacks fresh on every render
    useEffect(() => {
        realtimeService.updateCallbacks(setupRealtimeCallbacks());
    });

    // Authoritative Host Game State Sync: Host broadcasts full state on every change
    useEffect(() => {
        if (!multiplayerRoomCode || !isHostRef.current) return;
        if (game.phase === GamePhase.MODE_SELECTION || game.phase === GamePhase.LOBBY) return;

        realtimeService.broadcast('SYNC_FULL_STATE', {
            phase: game.phase,
            round: game.round,
            trick: game.trick,
            players: game.players,
            currentPlayerIdx: game.currentPlayerIdx,
            leadSuit: game.leadSuit,
            playedCards: game.playedCards,
            isKakumei: game.isKakumei,
            isRevolt: game.isRevolt,
            seatMap: seatMapRef.current,
            characterPool: game.characterPool,
            selectionOrder: game.selectionOrder,
            selectionIndex: game.selectionIndex,
            gameMode: game.gameMode,
            roundResults: game.roundResults,
            gameResult: game.gameResult
        });
    }, [
        game.phase,
        game.round,
        game.trick,
        game.players,
        game.currentPlayerIdx,
        game.playedCards,
        game.selectionIndex,
        game.characterPool,
        game.roundResults,
        game.gameResult,
        multiplayerRoomCode
    ]);

    // Multiplayer Room Handlers
    const handleCreateRoom = async (playerName: string) => {
        const code = realtimeService.generateRoomCode();
        localStorage.setItem('tricktakers_last_room', code);
        localStorage.setItem('tricktakers_player_name', playerName);
        setMultiplayerRoomCode(code);
        setLocalPlayerId('p1');
        localPlayerIdRef.current = 'p1';
        setIsHost(true);
        isHostRef.current = true;
        setIsJoinModalOpen(false);

        await realtimeService.joinRoom(code, 'p1', playerName, true, setupRealtimeCallbacks());
        game.setPhase(GamePhase.LOBBY);
    };

    const handleJoinRoom = async (code: string, playerName: string) => {
        const pId = getPersistentParticipantId();
        localStorage.setItem('tricktakers_last_room', code);
        localStorage.setItem('tricktakers_player_name', playerName);
        setMultiplayerRoomCode(code);
        setLocalPlayerId(pId);
        localPlayerIdRef.current = pId;
        setIsHost(false);
        isHostRef.current = false;
        setIsJoinModalOpen(false);

        await realtimeService.joinRoom(code, pId, playerName, false, setupRealtimeCallbacks());
        realtimeService.broadcast('RECONNECT', { participantId: pId, name: playerName });
        if (game.phase === GamePhase.MODE_SELECTION) {
            game.setPhase(GamePhase.LOBBY);
        }
    };

    const handleStartGameFromLobby = () => {
        const currentParts = realtimeService.getCurrentParticipants();
        const totalTarget = fillEmptyWithBots ? 4 : Math.max(2, currentParts.length);

        const seatMap: Record<string, string> = {};
        const playerList: Player[] = currentParts.map((part, idx) => {
            const seatId = `p${idx + 1}`;
            seatMap[part.id] = seatId;
            return {
                id: seatId,
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
                thiefChipValue: null,
                thiefBetrayalMode: false,
                tasksAssigned: {},
                isHuman: true,
                isConnected: true,
                disconnectCountdown: null,
                isBotControlled: false
            };
        });

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

        setMyInGameId('p1');
        game.setLocalSeatId('p1');
        seatMapRef.current = seatMap;

        // Host initializes authoritative game loop
        game.initGame(GameMode.ALL_STAR, playerList.length, playerList);
    };

    const handleLeaveLobby = () => {
        realtimeService.leaveRoom();
        setMultiplayerRoomCode('');
        setParticipants([]);
        game.setPhase(GamePhase.MODE_SELECTION);
    };

    const handlePlayCard = (cardId: string) => {
        if (!multiplayerRoomCode || isHostRef.current) {
            game.playCard(cardId);
        } else {
            realtimeService.broadcast('PLAY_CARD', { cardId, playerId: myInGameId });
        }
    };

    return (
        <div className="w-full h-screen bg-[#B9DED1] bg-pattern text-slate-800 overflow-hidden flex flex-col font-sans select-none relative">

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
                    onRejoinRoom={(code) => {
                        const savedName = localStorage.getItem('tricktakers_player_name') || 'Jugador';
                        handleJoinRoom(code, savedName);
                    }}
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
                <div className="absolute inset-x-0 top-16 bottom-0 z-30 bg-[#B9DED1]/95 bg-pattern backdrop-blur-lg overflow-y-auto custom-scrollbar shadow-2xl pt-4 pb-12">
                    <CharacterSelection
                        players={game.players}
                        characterPool={game.characterPool}
                        selectionOrder={game.selectionOrder}
                        selectionIndex={game.selectionIndex}
                        localPlayerId={myInGameId}
                        selectCharacter={(char) => {
                            if (!multiplayerRoomCode || isHostRef.current) {
                                game.selectCharacter(char);
                            } else {
                                realtimeService.broadcast('SELECT_CHARACTER', { character: char, playerId: myInGameId });
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
                        localPlayerId={myInGameId}
                    />

                    {/* Player Hand & Actions */}
                    <div className="w-full z-20 shrink-0">
                        <PlayerHandArea
                            player={myPlayer}
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
                        localPlayerId={myInGameId}
                        onStrategistChoice={(choice) => {
                            if (choice) {
                                if (choice.type === 'BLACK7') {
                                    game.setStrategistInheritedCard({ id: 'str-b7', suit: 'BLACK', value: 7, type: 'NUMBER', ownerId: myInGameId } as any);
                                }
                                game.setPlayers(prev => prev.map(pl => {
                                    if (pl.character === '1C' && pl.id === myInGameId) {
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
            {game.showLogs && (
                <LogsPanel
                    isOpen={game.showLogs}
                    onClose={() => game.setShowLogs(false)}
                    logs={game.logs}
                />
            )}

            <CharacterModal
                character={game.viewingCharacter ? CHARACTERS[game.viewingCharacter] : null}
                onClose={() => game.setViewingCharacter(null)}
            />

            {game.viewingRules && (
                <RulebooksModal
                    isOpen={game.viewingRules}
                    onClose={() => game.setViewingRules(false)}
                />
            )}

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
                    onProceed={handleProceedSummary}
                    localPlayerId={myInGameId}
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
