import { useState, useCallback, useRef, useEffect } from 'react';
import { Player, Card, Suit, CharacterType, GamePhase, GameMode, CardType, Item, Trap, RoundResult, AIDifficulty } from '../game/core/types';
import { CHARACTERS, ITEMS, TRAPS, TASKS } from '../game/core/constants';
import { createDeck, getValidMoves, determineWinner, getAiMove, determineTournamentWinner, TournamentResult } from '../game/core/gameLogic';
import { getCharacterLogic } from '../logic/logic_Registry';
import { getScoringLogic } from '../logic/scoring/scoring_Registry';
import { PhantomThiefLogic } from '../logic/characters/logic_PhantomThief';
import { calculateAlchemyValue } from '../game/core/alchemyUtils';
import { useGameActions } from '../useGameActions';

// Initial Players generator (supporting 2, 3, or 4 players)
const createInitialPlayer = (id: string, name: string, isHuman = false): Player => ({
    id,
    name,
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
    thiefChipValue: isHuman ? null : 0,
    thiefBetrayalMode: false,
    tasksAssigned: {},
    isHuman,
    isConnected: true,
    disconnectCountdown: null,
    isBotControlled: !isHuman
});

export const getInitialPlayers = (count: number = 3): Player[] => {
    const list: Player[] = [
        createInitialPlayer('p1', 'Tú', true),
        createInitialPlayer('p2', 'Rival 1', false),
    ];
    if (count >= 3) list.push(createInitialPlayer('p3', 'Rival 2', false));
    if (count >= 4) list.push(createInitialPlayer('p4', 'Rival 3', false));
    return list;
};

export const useGameLoop = () => {
    // ...
    // Inside startRound:
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.BASIC);
    const [players, setPlayers] = useState<Player[]>(getInitialPlayers());
    const [phase, setPhase] = useState<GamePhase>(GamePhase.MODE_SELECTION);
    const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(AIDifficulty.INTERMEDIATE);
    const [localSeatId, setLocalSeatId] = useState<string>('p1');

    const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
    const [trickStarterIdx, setTrickStarterIdx] = useState(0);
    const [round, setRound] = useState(1);
    const [trick, setTrick] = useState(1);

    const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
    const [selectionIndex, setSelectionIndex] = useState(0);
    const [characterPool, setCharacterPool] = useState<CharacterType[]>([]);
    const [advancedModeDeck, setAdvancedModeDeck] = useState<CharacterType[]>([]);

    const [playedCards, setPlayedCards] = useState<Card[]>([]);
    const [drawPile, setDrawPile] = useState<Card[]>([]);
    const [leadSuit, setLeadSuit] = useState<Suit | null>(null);
    const [isRevolt, setIsRevolt] = useState(false);
    const [isKakumei, setIsKakumei] = useState(false);
    const [roundResults, setRoundResults] = useState<RoundResult | null>(null);
    const [gameResult, setGameResult] = useState<TournamentResult | null>(null);

    const [logs, setLogs] = useState<string[]>(["¡Bienvenidos al Torneo Tricktakers!"]);
    const [showLogs, setShowLogs] = useState(false);

    // Strategist State
    const [trapPool, setTrapPool] = useState(0);
    const [trapDeck, setTrapDeck] = useState<Trap[]>([]);
    const [currentTrap, setCurrentTrap] = useState<Trap | null>(null);
    const [abilityMode, setAbilityMode] = useState<string>('NONE');
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [viewingCharacter, setViewingCharacter] = useState<CharacterType | null>(null);
    const [strategistInheritedCard, setStrategistInheritedCard] = useState<Card | null>(null);
    const [strategistPendingChoice, setStrategistPendingChoice] = useState<{ type: 'BLACK7' | 'RARE', pointsObj: number } | null>(null);
    const isResolvingRef = useRef(false);
    const isRoundResolvingRef = useRef(false);
    const [itemCardToShow, setItemCardToShow] = useState<Item | string | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [viewingRules, setViewingRules] = useState(false);

    const [viewingTraps, setViewingTraps] = useState(false);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg].slice(-50));
    };

    const resetGame = () => {
        setPlayers(getInitialPlayers());
        setPhase(GamePhase.MODE_SELECTION);
        setRound(1);
        setTrick(1);
        setPlayedCards([]);
        setDrawPile([]);
        setLeadSuit(null);
        setLogs(["¡Bienvenidos al Torneo Tricktakers!"]);
        setTrapPool(0);
        setTrapDeck([]);
        setCurrentTrap(null);
        setAbilityMode('NONE');
        setSelectedCards([]);
        setViewingCharacter(null);
        setStrategistInheritedCard(null);
        setStrategistPendingChoice(null);
        setIsRevolt(false);
        setIsKakumei(false);
        isResolvingRef.current = false;
        isRoundResolvingRef.current = false;
    };

    const checkPlayerAbilityMode = (p: Player) => {
        if (!p || p.id !== localSeatId || !p.isHuman || p.isBotControlled) {
            setAbilityMode('NONE');
            return;
        }

        if (p.character === CharacterType.ALCHEMIST) setAbilityMode('ALCHEMIST_SELECT');
        else if (p.character === CharacterType.GAMBLER && p.bid === undefined) {
            if (p.gambleSwaps && p.gambleSwaps > 0) setAbilityMode('GAMBLER_SWAP');
            else setAbilityMode('GAMBLE_BID');
        }
        else if (p.character === CharacterType.KING && p.hand.length > 5) setAbilityMode('KING_SETUP');
        else if (p.character === CharacterType.ADVENTURER && p.items.length === 0) setAbilityMode('ADVENTURER_SETUP');
        else if (p.character === CharacterType.BERSERKER && p.berserkerDeck && p.berserkerDeck.length > 2) setAbilityMode('BERSERKER_SETUP');
        else if (p.character === CharacterType.RULER && (!p.tasksAssigned || Object.keys(p.tasksAssigned).length === 0)) setAbilityMode('RULER_SETUP');
        else if (p.character === CharacterType.STRATEGIST && p.hand.length > 5 && round === 1) setAbilityMode('STRATEGIST_DISCARD');
        else if (p.character === CharacterType.STRATEGIST && p.hand.length > 5) setAbilityMode('STRATEGIST_DISCARD');
        else if (p.character === CharacterType.PHANTOM_THIEF && p.thiefChipValue === null) setAbilityMode('PHANTOM_THIEF_SETUP');
        else if (p.character === CharacterType.TIME_TRAVELER && (!p.timeTravelPredictions || p.timeTravelPredictions.length === 0)) setAbilityMode('TIME_TRAVELER_SETUP');
        else setAbilityMode('NONE');
    };

    const startRound = useCallback((currentPlayers?: Player[]) => {
        const playersToUse = currentPlayers || players;
        // Use existing drawPile which has the remaining cards after dealing
        let deck = [...drawPile];

        let newPlayers = playersToUse.map(p => {
            const logic = getCharacterLogic(p.character);
            // Pass existing hand to setup
            const setupData = logic.setup({ deck, playerId: p.id, round, players: playersToUse, hand: p.hand });

            // Check for Inherited Card (Strategist Bonus from prev round)
            let hand = setupData.hand || p.hand || [];
            if ((!hand || hand.length === 0) && p.character !== CharacterType.BERSERKER) {
                if (deck.length < 5) {
                    deck = createDeck();
                }
                hand = deck.splice(0, 5).map(c => ({ ...c, ownerId: p.id }));
            }

            if (p.id === localSeatId && strategistInheritedCard) {
                hand = [...hand, strategistInheritedCard];
                addLog(`Has heredado una carta especial: ${strategistInheritedCard.type === 'RARE' ? 'Rara' : '7 Negro'}`);
            }

            return {
                ...p,
                ...setupData,
                hand, // Use modified hand
                wonCards: [],
                wins: 0,
                revoltUsed: false,
                isKakumeiActive: false,
                hermitUsedAbility: false,
                strategistUsedIgnore: false,
                items: p.character === CharacterType.ADVENTURER ? (setupData.items || []) : p.items
            };
        });

        // Initialize Strategist Traps if present
        const hasStrategist = newPlayers.some(p => p.character === CharacterType.STRATEGIST);
        if (hasStrategist) {
            const shuffledTraps = [...TRAPS].sort(() => Math.random() - 0.5);
            setTrapDeck(shuffledTraps);
            setCurrentTrap(shuffledTraps[0]);
            setTrapPool(0);
            addLog("El Estratega ha preparado sus trampas...");
            addLog(`Trampa Inicial: ${shuffledTraps[0].name}`);
        } else {
            setTrapDeck([]);
            setCurrentTrap(null);
            setTrapPool(0);
        }

        // Ruler Setup (Local Human)
        const rulerPlayer = newPlayers.find(p => p.character === CharacterType.RULER);
        if (rulerPlayer && rulerPlayer.id === localSeatId && rulerPlayer.isHuman && !rulerPlayer.isBotControlled) {
            setAbilityMode('RULER_SETUP');
        }

        // Phantom Thief Setup (Local Human)
        const thiefPlayer = newPlayers.find(p => p.character === CharacterType.PHANTOM_THIEF);
        if (thiefPlayer && thiefPlayer.id === localSeatId && thiefPlayer.isHuman && !thiefPlayer.isBotControlled) {
            setAbilityMode('PHANTOM_THIEF_SETUP');
            addLog("Phantom Thief: Configura tu Chip de Predicción.");
        }

        // Adventurer Setup (Local Human)
        const humanAdv = newPlayers.find(p => p.id === localSeatId && p.character === CharacterType.ADVENTURER && p.isHuman && !p.isBotControlled);
        if (humanAdv && humanAdv.items.length === 0) {
            setAbilityMode('ADVENTURER_SETUP');
            addLog("Aventurero: Selecciona tus 2 objetos iniciales.");
        }

        // Berserker Setup (Local Human)
        const humanBerserker = newPlayers.find(p => p.id === localSeatId && p.character === CharacterType.BERSERKER && p.isHuman && !p.isBotControlled);
        if (humanBerserker) {
            setAbilityMode('BERSERKER_SETUP');
            addLog("Berserker: ¡Prepárate para la batalla!");
        }

        // King Setup (Local Human)
        const humanKing = newPlayers.find(p => p.id === localSeatId && p.character === CharacterType.KING && p.isHuman && !p.isBotControlled);
        if (humanKing && humanKing.hand.length > 5) {
            setAbilityMode('KING_SETUP');
            addLog("Rey: Debes descartar 1 carta para quedarte con 5.");
        }

        // Gambler Setup (Local Human)
        const humanGambler = newPlayers.find(p => p.id === localSeatId && p.character === CharacterType.GAMBLER && p.isHuman && !p.isBotControlled);
        if (humanGambler && humanGambler.bid === undefined) {
            if (humanGambler.gambleSwaps && humanGambler.gambleSwaps > 0) setAbilityMode('GAMBLER_SWAP');
            else setAbilityMode('GAMBLE_BID');
            addLog("Apostador: ¡Haz tu predicción!");
        }

        // Strategist Setup (Local Human)
        const humanStrategist = newPlayers.find(p => p.id === localSeatId && p.character === CharacterType.STRATEGIST && p.isHuman && !p.isBotControlled);
        if (humanStrategist) {
            setAbilityMode('STRATEGIST_SETUP');
            addLog("Estratega: Define tu Plan Maestro de Trampas.");
        }

        // Time Traveler Setup (Local Human)
        const humanTimeTraveler = newPlayers.find(p => p.id === localSeatId && p.character === CharacterType.TIME_TRAVELER && p.isHuman && !p.isBotControlled);
        if (humanTimeTraveler && (!humanTimeTraveler.timeTravelPredictions || humanTimeTraveler.timeTravelPredictions.length === 0)) {
            setAbilityMode('TIME_TRAVELER_SETUP');
            addLog("Viajero del Tiempo: Configura tus visiones del futuro (predicciones).");
        }

        if (strategistInheritedCard) {
            setStrategistInheritedCard(null);
        }

        setPlayers(newPlayers);
        setDrawPile(deck);
        setPhase(GamePhase.TRICK_PLAYING);
        setCurrentPlayerIdx(trickStarterIdx);
        setTrick(1);
        setIsRevolt(false);
        setIsKakumei(false);
        isResolvingRef.current = false;
        isRoundResolvingRef.current = false;
        addLog(`--- COMIENZA LA RONDA ${round} ---`);

        // Only check for other ability modes if Strategist setup is not active
        if (!humanStrategist) {
            // Let the useEffect handle the ability mode check for the starter
        }
    }, [round, players, trickStarterIdx, strategistInheritedCard]);

    // Check ability mode on turn change
    useEffect(() => {
        if (phase === GamePhase.TRICK_PLAYING && !isResolvingRef.current && !isRoundResolvingRef.current) {
            checkPlayerAbilityMode(players[currentPlayerIdx]);
        }
    }, [currentPlayerIdx, phase, players]);

    const prepareRoundSelection = (
        r: number,
        mode: GameMode,
        charDeck: CharacterType[],
        currentPlayers: Player[],
        previousRoundPool: CharacterType[]
    ) => {
        let newOrder: string[] = [];
        if (r === 1) {
            newOrder = currentPlayers.map(p => p.id).sort(() => Math.random() - 0.5);
        } else {
            const exKing = currentPlayers.find(p => p.lastCharacter === CharacterType.KING);
            const others = currentPlayers.filter(p => p.id !== exKing?.id);

            const sortedOthers = others.sort((a, b) => {
                if (a.goldCrowns === 0 && b.goldCrowns > 0) return -1;
                if (a.goldCrowns > 0 && b.goldCrowns === 0) return 1;
                return a.score - b.score;
            });

            newOrder = exKing ? [exKing.id, ...sortedOthers.map(p => p.id)] : sortedOthers.map(p => p.id);
        }

        setSelectionOrder(newOrder);
        setSelectionIndex(0);
        let newPool: CharacterType[] = [];
        let newDeck = [...charDeck];

        const basicChars = [CharacterType.KING, CharacterType.GAMBLER, CharacterType.RESISTANCE, CharacterType.HERMIT, CharacterType.BERSERKER];

        if (mode === GameMode.BASIC) {
            newPool = basicChars;
        } else if (mode === GameMode.ADVANCED) {
            const advancedChars = [
                CharacterType.STRATEGIST, CharacterType.SUMMONER, CharacterType.ALCHEMIST,
                CharacterType.NINJA, CharacterType.SAMURAI, CharacterType.ADVENTURER
            ];
            newPool = [...basicChars, ...advancedChars];
        } else if (mode === GameMode.ALL_STAR) {
            newPool = Object.values(CharacterType);
        } else {
            const poolSize = currentPlayers.length + 1;
            newPool = newDeck.splice(0, poolSize);
        }

        const newCardDeck = createDeck();
        let currentDrawPile = [...newCardDeck];
        const newPlayersWithHands = currentPlayers.map(p => {
            const hand = currentDrawPile.splice(0, 5).map(c => ({ ...c, ownerId: p.id }));
            return { ...p, hand };
        });

        // If round > 1, apply any carry-over logic if needed (e.g. scores) but hands are fresh.
        // Also update the state immediately so players see their hands in selection.
        setPlayers(newPlayersWithHands);
        setDrawPile(currentDrawPile);

        setCharacterPool(newPool);
        setAdvancedModeDeck(newDeck);
        setPhase(GamePhase.CHARACTER_SELECTION);
        addLog(`Ronda ${r}: Selección de personajes en marcha.`);
    };

    const initGame = (mode: GameMode, playerCount: number = 3, customPlayers?: Player[]) => {
        setGameMode(mode);
        const startingPlayers = customPlayers || getInitialPlayers(playerCount);
        setPlayers(startingPlayers);
        setRound(1);
        setTrick(1);

        let initialDeck: CharacterType[] = [];
        if (mode === GameMode.BASIC) {
            initialDeck = [CharacterType.KING, CharacterType.GAMBLER, CharacterType.RESISTANCE, CharacterType.HERMIT, CharacterType.BERSERKER];
        } else {
            initialDeck = Object.values(CharacterType).sort(() => Math.random() - 0.5);
        }

        setAdvancedModeDeck(initialDeck);
        prepareRoundSelection(1, mode, initialDeck, startingPlayers, []);
    };

    const handlePlayerDisconnect = (playerId: string, secondsRemaining: number) => {
        setPlayers(prev => prev.map(p => {
            if (p.id === playerId) {
                return { ...p, isConnected: false, disconnectCountdown: secondsRemaining };
            }
            return p;
        }));
    };

    const handlePlayerReconnect = (playerId: string) => {
        setPlayers(prev => prev.map(p => {
            if (p.id === playerId) {
                addLog(`¡${p.name} se ha reconectado!`);
                return { ...p, isConnected: true, disconnectCountdown: null, isBotControlled: false };
            }
            return p;
        }));
    };

    const handleBotTakeover = (playerId: string) => {
        setPlayers(prev => prev.map(p => {
            if (p.id === playerId) {
                addLog(`Tiempo agotado: La IA toma el control de ${p.name}.`);
                return { ...p, disconnectCountdown: null, isBotControlled: true };
            }
            return p;
        }));
    };

    const selectCharacter = (charType: CharacterType) => {
        const currentPickerId = selectionOrder[selectionIndex];
        const picker = players.find(p => p.id === currentPickerId);

        // REGLA: El jugador que jugó como Rey en la ronda anterior no puede elegir al Rey
        if (picker && picker.lastCharacter === CharacterType.KING && charType === CharacterType.KING) {
            addLog(`${picker.name} fue el Rey en la ronda anterior y no puede repetir al Rey.`);
            return;
        }

        const isTaken = players.some(p => p.character === charType);
        if (isTaken) return;

        const updatedPlayers = players.map(p => p.id === currentPickerId ? { ...p, character: charType } : p);
        setPlayers(updatedPlayers);

        if (selectionIndex < selectionOrder.length - 1) {
            setSelectionIndex(prev => prev + 1);
        } else {
            setTimeout(() => startRound(updatedPlayers), 800);
        }
    };

    const performCheckGameOver = (currentPlayers: Player[]) => {
        const winnerByInstant = currentPlayers.find(p => p.score >= 900);
        const winnerByGold = currentPlayers.find(p => p.goldCrowns >= 2);
        const winnerByBlack = currentPlayers.find(p => p.blackCrowns >= 3);
        const roundLimitReached = round >= 3;

        if (winnerByInstant || winnerByGold || winnerByBlack || roundLimitReached) {
            const finalResult = determineTournamentWinner(currentPlayers);
            setGameResult(finalResult);
            setPhase(GamePhase.GAME_OVER);
        } else {
            const nextRound = round + 1;
            setRound(nextRound);
            prepareRoundSelection(nextRound, gameMode, advancedModeDeck, currentPlayers, characterPool);
        }
    };

    const resolveRound = (currentPlayers?: Player[]) => {
        const playersToUse = currentPlayers || players;
        addLog(`--- FINAL DE LA RONDA ${round} ---`);

        const scoringResults = playersToUse.map(p => {
            const scoringLogic = getScoringLogic(p.character);
            const result = scoringLogic.getScore(p, round, playersToUse);
            return { playerId: p.id, pts: result.score, logs: result.logs };
        });

        const maxWins = Math.max(...playersToUse.map(p => p.wins));

        // Count how many players have maxWins
        const winnersCount = playersToUse.filter(p => p.wins === maxWins).length;

        // Criterio de elegibilidad oficial para Coronas Negras
        const isEligibleForBlackCrown = (p: Player): boolean => {
            if (p.character === CharacterType.COLLECTOR) return false;
            if (p.character === CharacterType.NINJA) return p.wins === 2;
            if (p.character === CharacterType.PHANTOM_THIEF) return p.wins === 1;
            if (p.character === CharacterType.RESISTANCE) return p.wins === 0 || (p.wins === 1 && !!p.wonRevolutionTrick);
            return p.wins === 0;
        };

        let blackCrownsGiven = 0;
        const crownResults = playersToUse.map(p => {
            let gold = 0; let black = 0;
            if (p.character !== CharacterType.COLLECTOR) {
                // Golden Crown: Only if UNIQUE winner (winnersCount === 1) and maxWins > 0
                if (p.wins === maxWins && maxWins > 0 && winnersCount === 1) {
                    gold = 1;
                }

                if (isEligibleForBlackCrown(p) && blackCrownsGiven < 2) {
                    blackCrownsGiven++;
                    black = 1;
                }
            }
            return { playerId: p.id, gold, black };
        });

        scoringResults.forEach(sr => sr.logs.forEach(msg => addLog(msg)));
        crownResults.forEach(cr => {
            const p = playersToUse.find(pl => pl.id === cr.playerId)!;
            if (cr.gold > 0) addLog(`${p.name} obtiene una Corona Dorada.`);
            if (cr.black > 0) addLog(`${p.name} obtiene una Corona Negra.`);
        });

        setPlayers(prev => {
            let updated = prev.map(p => {
                const sr = scoringResults.find(s => s.playerId === p.id)!;
                const cr = crownResults.find(c => c.playerId === p.id)!;
                return {
                    ...p,
                    lastCharacter: p.character, // Preservamos el personaje de esta ronda para la siguiente selección
                    character: null,
                    score: sr.pts === 999 ? 999 : Math.max(0, p.score + sr.pts),
                    goldCrowns: p.goldCrowns + cr.gold,
                    blackCrowns: p.blackCrowns + cr.black,
                    magicElements: [], tasks: [], wonCards: [], collectedCards: [],
                    bid: undefined, betAmount: 0, wonRevolutionTrick: false,
                    revoltUsed: false, isKakumeiActive: false, wins: 0
                };
            });

            updated = PhantomThiefLogic.resolveSteal(updated, addLog);
            updated = PhantomThiefLogic.resolveBonus(updated, addLog);
            return updated;
        });

        const newResults = {
            round,
            playerResults: playersToUse.map(p => {
                const sr = scoringResults.find(s => s.playerId === p.id)!;
                const cr = crownResults.find(c => c.playerId === p.id)!;
                return {
                    playerId: p.id,
                    playerName: p.name,
                    character: p.character,
                    tricksWon: p.wins,
                    pointsGained: sr.pts,
                    totalScore: sr.pts === 999 ? 999 : Math.max(0, p.score + sr.pts),
                    goldCrownsGained: cr.gold,
                    blackCrownsGained: cr.black
                };
            })
        };
        console.log("Setting round results:", newResults);
        setRoundResults(newResults);

        setTimeout(() => {
            const strategist = playersToUse.find(p => p.character === CharacterType.STRATEGIST && p.id === localSeatId);
            const needsChoice = strategist && (strategist.wins === 0 || strategist.wins === 1);
            if (needsChoice) {
                const choiceType: 'RARE' | 'BLACK7' = strategist.wins === 0 ? 'RARE' : 'BLACK7';
                const choicePts = strategist.wins === 0 ? 50 : 30;
                setStrategistPendingChoice({ type: choiceType, pointsObj: choicePts });
            } else {
                console.log("Transitioning to ROUND_SUMMARY");
                setPhase(GamePhase.ROUND_SUMMARY);
            }
        }, 1000);
    };

    const proceedFromSummary = () => {
        if (phase !== GamePhase.ROUND_SUMMARY) return;
        setPhase(GamePhase.ROUND_END);
        setRoundResults(null);
        performCheckGameOver(players);
    };

    const resolveTrick = (cards: Card[], currentPlayers?: Player[]) => {
        timerRef.current = setTimeout(() => {
            const playersToUse = currentPlayers || players;
            const miriaPassive = playersToUse.some(p => p.character === CharacterType.SUMMONER && p.rearBeasts.includes('b-miria'));

            const winnerId = determineWinner(cards, leadSuit, isRevolt, isKakumei, playersToUse, miriaPassive);
            const winnerIdx = playersToUse.findIndex(p => p.id === winnerId);
            const winnerName = playersToUse[winnerIdx].name;

            const winnerChar = playersToUse[winnerIdx].character ? CHARACTERS[playersToUse[winnerIdx].character!].name : 'Sin personaje';
            addLog(`¡${winnerName} (${winnerChar}) gana la baza!`);

            const strategistId = playersToUse.find(p => p.character === CharacterType.STRATEGIST)?.id;
            let currentTrapPool = trapPool;

            // Trap D Logic: Pre-calculate penalties
            const updatedPlayersPreCalc = playersToUse.map(p => {
                if (currentTrap && currentTrap.id === 'trap-4' && winnerId === strategistId && p.id !== winnerId) {
                    if (p.score >= 10) {
                        currentTrapPool += 10;
                        addLog(`¡TRAMPA (D)! ${p.name} pierde 10 pts por victoria del Estratega.`);
                        return { ...p, score: p.score - 10 };
                    } else {
                        addLog(`¡TRAMPA (D)! ${p.name} debería perder 10 pts pero está en bancarrota.`);
                    }
                }
                return p;
            });

            let updatedPlayers = updatedPlayersPreCalc.map(p => {
                const isCollector = p.character === CharacterType.COLLECTOR;
                const hasReservedCard = p.reservedCardId !== null;

                if (p.id === winnerId) {
                    let bonus = 0;
                    const resetFlags = {
                        hermitUsedAbility: false,
                        adventurerUsedItem: false,
                        gamblerUsedAbility: false
                    };

                    if (p.character === CharacterType.STRATEGIST && currentTrapPool > 0) {
                        bonus = currentTrapPool;
                        addLog(`¡Estratega reclama el Pozo! (+${bonus} pts)`);
                        setTrapPool(0);
                    } else if (p.character !== CharacterType.STRATEGIST) {
                        setTrapPool(currentTrapPool);
                    }

                    const resCard = cards.find(c => c.ownerId === winnerId);
                    const isRevoltTrick = isKakumei || isRevolt;

                    if (isRevoltTrick && p.character === CharacterType.RESISTANCE) {
                        if (resCard?.suit === Suit.BLACK) {
                            addLog(`¡Baza de Revolución ganada con CARTA NEGRA! ¡LA RESISTENCIA GANA LA PARTIDA!`);
                            return {
                                ...p,
                                ...resetFlags,
                                wins: p.wins + 1,
                                wonCards: [...p.wonCards, ...cards],
                                score: 999,
                                wonRevolutionTrick: true,
                                revoltWinningCard: resCard,
                                collectedCards: isCollector ? [...p.collectedCards, ...cards] : p.collectedCards
                            };
                        } else {
                            addLog(`La Resistencia gana la baza de Revolución con ${resCard?.type === 'WHITE_FLAG' ? 'Bandera Blanca' : `${resCard?.suit} ${resCard?.value}`}.`);
                        }
                    }

                    let nextCollected = p.collectedCards;
                    if (isCollector) {
                        nextCollected = [...nextCollected, ...cards];
                        addLog(`Coleccionista: Captura TOTAL de la baza (${cards.length} cartas).`);
                    }

                    return {
                        ...p,
                        ...resetFlags,
                        wins: p.wins + 1,
                        wonCards: [...p.wonCards, ...cards],
                        score: p.score + bonus,
                        wonRevolutionTrick: p.wonRevolutionTrick || isRevoltTrick,
                        revoltWinningCard: isRevoltTrick && p.character === CharacterType.RESISTANCE ? resCard : p.revoltWinningCard,
                        collectedCards: nextCollected
                    };
                } else {
                    const resetFlags = {
                        hermitUsedAbility: false,
                        adventurerUsedItem: false,
                        gamblerUsedAbility: false
                    };

                    return { ...p, ...resetFlags };
                }
            });

            const winnerP = updatedPlayers[winnerIdx];
            if (winnerP) {
                const logic = getCharacterLogic(winnerP.character);
                if (logic.onTrickWon) {
                    const updates = logic.onTrickWon(winnerP, cards, round);
                    if (Object.keys(updates).length > 0) {
                        updatedPlayers = updatedPlayers.map(p => p.id === winnerId ? { ...p, ...updates } : p);
                        if (winnerP.character === CharacterType.ADVENTURER && updates.items) {
                            addLog(`El Aventurero ha subido de nivel y tiene un nuevo objeto.`);
                        }
                    }
                }

                // CHECK: Collector Loss Ability (Local Human)
                const humanCollector = updatedPlayers.find(p => p.id === localSeatId && p.character === CharacterType.COLLECTOR && p.isHuman && !p.isBotControlled);
                if (humanCollector && humanCollector.id !== winnerId) {
                    setAbilityMode('COLLECTOR_PICK_TRICK_CARD');
                    return; // Pause resolution
                }

                // Check for Samurai Win Ability (Take Red Card)
                const availableRedCards = cards.filter(c => c.suit === Suit.RED && c.ownerId !== winnerId);
                if (winnerP.character === CharacterType.SAMURAI && availableRedCards.length > 0) {
                    if (winnerP.id === localSeatId && winnerP.isHuman && !winnerP.isBotControlled) {
                        setAbilityMode('SAMURAI_WIN_CHOICE');
                        // Pause resolution to wait for user input
                        return;
                    } else {
                        // AI Samurai: automatically takes the highest Red card and discards the lowest non-Black card
                        const bestRedCard = [...availableRedCards].sort((a, b) => b.value - a.value)[0];
                        const discardCandidate = [...winnerP.hand].sort((a, b) => a.value - b.value)[0];
                        if (discardCandidate && bestRedCard.value > discardCandidate.value) {
                            updatedPlayers = updatedPlayers.map(p => {
                                if (p.id === winnerId) {
                                    const newHand = p.hand.filter(c => c.id !== discardCandidate.id);
                                    newHand.push({ ...bestRedCard, ownerId: winnerId });
                                    return { ...p, hand: newHand };
                                }
                                return p;
                            });
                            addLog(`${winnerP.name} (Samurái) intercambió una carta de su mano por ${bestRedCard.suit} ${bestRedCard.value}.`);
                        }
                    }
                }
            }

            if (isKakumei) {
                setIsKakumei(false);
                addLog("La Revolución ha terminado. La jerarquía se restablece.");
            }

            updatedPlayers = updatedPlayers.map(p => p.character === CharacterType.HERMIT ? { ...p, hermitUsedAbility: false, hermitDiscarding: false } : p);

            updatedPlayers = updatedPlayers.map(p => ({
                ...p,
                adventurerUsedItem: false,
                pendingItemEffect: null,
                frontBeastId: null
            }));

            if (trick < 4) {
                if (trapDeck.length > trick) {
                    const nextTrap = trapDeck[trick];
                    setCurrentTrap(nextTrap);
                    addLog(`Nueva Trampa Revelada: ${nextTrap.name}`);
                } else {
                    setCurrentTrap(null);
                }
            } else {
                setCurrentTrap(null);
            }

            // 5. Check Time Traveler "Change the Past" Opportunity (Local Human ONLY)
            const winner = updatedPlayers[winnerIdx];
            if (winner.character === CharacterType.TIME_TRAVELER && trick < 5 && winner.timeTravelTokens > 0) {
                if (winner.id === localSeatId && winner.isHuman && !winner.isBotControlled) {
                    // Trigger Interception for local human player
                    setAbilityMode('TIME_TRAVEL_WIN_CHOICE');
                    return; // STOP execution here to wait for user input
                }
                // AI Time Traveler: does not block the engine or pop up modal
            }

            setPlayedCards([]);
            setLeadSuit(null);
            setTrickStarterIdx(winnerIdx);
            setCurrentPlayerIdx(winnerIdx);
            isResolvingRef.current = false;

            if (trick < 5) {
                setPlayers(updatedPlayers);
                setTrick(t => t + 1);
            } else {
                if (!isRoundResolvingRef.current) {
                    isRoundResolvingRef.current = true;
                    setPlayers(updatedPlayers);
                    resolveRound(updatedPlayers);
                }
            }
        }, 1500);
    };

    const { performAction } = useGameActions({
        drawPile, setDrawPile, players, setPlayers, selectedCards, setSelectedCards,
        setAbilityMode, playedCards, setPlayedCards, setLeadSuit, leadSuit, setCurrentPlayerIdx,
        trickStarterIdx, setIsKakumei, addLog, resolveTrick, currentPlayerIdx,
        isResolvingRef,
        trick,
        setItemCardToShow,
        setTrapDeck,
        setTrick,
        setPhase,
        setTrickStarterIdx,
        localPlayerId: localSeatId
    });

    const playCard = (cardId: string) => {
        if (isResolvingRef.current) return;
        const p = players[currentPlayerIdx];
        const isUser = p.id === localSeatId && p.isHuman && !p.isBotControlled;

        // AI Alchemist Turn: Automatically transmute 3 cards
        if (p.character === CharacterType.ALCHEMIST && !isUser) {
            let selection: Card[] = [];
            const leadCards = leadSuit ? p.hand.filter(c => c.suit === leadSuit) : [];
            if (leadSuit && leadCards.length > 0) {
                selection.push(leadCards[0]);
            }
            const remainingInHand = p.hand.filter(c => !selection.some(s => s.id === c.id));
            while (selection.length < 3 && remainingInHand.length > 0) {
                selection.push(remainingInHand.shift()!);
            }

            if (selection.length === 3) {
                const alchemyResult = calculateAlchemyValue(selection);
                const sumValue = alchemyResult.value;
                const newElements = [...(p.magicElements || []), ...alchemyResult.elements];

                let declaredSuit = leadSuit;
                if (!declaredSuit) {
                    declaredSuit = selection[0].suit || Suit.RED;
                    setLeadSuit(declaredSuit);
                }

                const virtualCard: Card = {
                    id: `alchemy-ai-${Date.now()}-${p.id}`,
                    suit: declaredSuit,
                    value: sumValue,
                    type: CardType.NUMBER,
                    ownerId: p.id,
                    name: `Alchemy Result (${sumValue})`,
                    combinedCards: selection
                };

                if (sumValue === 10 && declaredSuit !== Suit.COLORLESS) {
                    virtualCard.imagePath = `/assets/color-cards/10s-cards/${declaredSuit.toLowerCase()}-10.jpg`;
                }

                const alchemistDeck = [...(p.alchemistDeck || [])];
                let drawnCards: Card[] = [];
                if (alchemistDeck.length > 0 && trick < 5) {
                    drawnCards = alchemistDeck.splice(0, 3).map(c => ({ ...c, ownerId: p.id }));
                }

                const newHand = [...p.hand.filter(c => !selection.some(s => s.id === c.id)), ...drawnCards];
                const updatedAi = {
                    ...p,
                    hand: newHand,
                    alchemistDeck,
                    magicElements: newElements
                };

                const newPlayed = [...playedCards, virtualCard];
                setPlayedCards(newPlayed);
                addLog(`${p.name} (Alquimista) transmutó 3 cartas -> Valor ${sumValue} (${declaredSuit}).`);

                const updatedPlayers = players.map(pl => pl.id === p.id ? updatedAi : pl);
                setPlayers(updatedPlayers);

                if (newPlayed.length < players.length) {
                    setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length);
                } else {
                    isResolvingRef.current = true;
                    resolveTrick(newPlayed, updatedPlayers);
                }
                return;
            }
        }
        // Check character specific phases
        const isKingDiscardPhase = p.character === CharacterType.KING && p.hand.length > 5;
        const isGamblerSwapPhase = p.character === CharacterType.GAMBLER && (p.gambleSwaps || 0) > 0 && p.bid === undefined;
        // Robust check: Use hermitDiscarding flag
        const isHermitDiscardPhase = p.character === CharacterType.HERMIT && (p as any).hermitDiscarding;

        if (isUser && (['ALCHEMIST_SELECT', 'GAMBLER_SWAP', 'KING_DISCARD', 'HERMIT_DISCARD', 'SUMMONER_SELECT_CARD', 'SAMURAI_DISCARD', 'STRATEGIST_DISCARD', 'COLLECTOR_RESERVE'].includes(abilityMode) || isKingDiscardPhase || isGamblerSwapPhase || isHermitDiscardPhase)) {
            if (abilityMode === 'SAMURAI_DISCARD') {
                performAction('SAMURAI_EXECUTE_DISCARD', { cardId });
                return;
            }
            if (abilityMode === 'STRATEGIST_DISCARD') {
                performAction('STRATEGIST_EXECUTE_DISCARD', { cardId });
                return;
            }

            setSelectedCards(prev => {
                if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
                return [...prev, cardId];
            });
            return;
        }

        const card = p.hand.find(c => c.id === cardId);
        if (!card) return;

        const validMoves = getValidMoves(p.hand, leadSuit);
        const isStrategistIgnore = abilityMode === 'STRATEGIST_IGNORE_SUIT';
        const isRulerIgnore = abilityMode === 'RULER_IGNORE_RULES';

        if (!validMoves.some(m => m.id === cardId) && !isStrategistIgnore && !isRulerIgnore) {
            if (validMoves.length > 0 && isUser) return;
        }

        let playersWithStatusEffects = [...players];
        if (isStrategistIgnore && isUser) {
            setAbilityMode('NONE');
            playersWithStatusEffects = playersWithStatusEffects.map(pl => pl.id === p.id ? { ...pl, strategistUsedIgnore: true } : pl);
            addLog("Estratega usa su habilidad para ignorar el palo.");
        }
        if (isRulerIgnore && isUser) {
            setAbilityMode('NONE');
            playersWithStatusEffects = playersWithStatusEffects.map(pl => pl.id === p.id ? { ...pl, rulerUsedRuleAvoidance: true } : pl);
            addLog("El Gobernante ignora las reglas y juega lo que quiere.");
        }

        const playerInEffectState = playersWithStatusEffects.find(pl => pl.id === p.id)!;

        if (leadSuit === null && card.suit !== Suit.COLORLESS) {
            setLeadSuit(card.suit);
        }

        let finalCard = { ...card, ownerId: p.id };
        if (playerInEffectState.pendingItemEffect) {
            if (playerInEffectState.pendingItemEffect === 'FIX_10' || playerInEffectState.pendingItemEffect === 'CHANGE_10') {
                finalCard.value = 10;
                // Update image for Value 10
                if (finalCard.suit !== Suit.COLORLESS) {
                    finalCard.imagePath = `/assets/color-cards/10s-cards/${finalCard.suit.toLowerCase()}-10.jpg`;
                }
                addLog(`¡Objeto activado! Valor cambiado a 10.`);
            } else if (playerInEffectState.pendingItemEffect === 'COLOR_SHIFT' && leadSuit) {
                finalCard.suit = leadSuit;
                addLog(`¡Varita del Gobernante! Color cambiado a ${leadSuit}.`);
            } else if (playerInEffectState.pendingItemEffect === 'VALUE_MODIFY') {
                const mod = finalCard.value <= 4 ? 5 : -5;
                finalCard.value = Math.max(1, Math.min(9, finalCard.value + mod));
                addLog(`¡Espada Milagrosa! Valor ajustado a ${finalCard.value}.`);
            } else if (playerInEffectState.pendingItemEffect === 'FACEDOWN') {
                finalCard.isFacedown = true;
                addLog(`¡Poción de Invisibilidad! Carta jugada boca abajo.`);
            } else if (playerInEffectState.pendingItemEffect === 'WHITE_FLAG') {
                finalCard.type = CardType.WHITE_FLAG;
                finalCard.suit = Suit.COLORLESS;
                finalCard.value = 0;
                addLog(`¡Orbe Blanco! La carta se convierte en Bandera Blanca.`);
            } else if (playerInEffectState.pendingItemEffect === 'WIN_TIES') {
                finalCard.winTies = true;
                addLog(`¡Muñeca de Dragón! Ganarás los empates.`);
            }
        }

        if (abilityMode === 'NINJA_FACE_DOWN' && isUser) {
            finalCard.isFacedown = true;
            setAbilityMode('NONE');
            addLog(`¡Clon de Sombra! ${p.name} juega una carta boca abajo.`);
        }

        const newPlayed = [...playedCards, finalCard];
        setPlayedCards(newPlayed);

        const updatedPlayersAfterPlay = playersWithStatusEffects.map(pl => pl.id === p.id ? { ...pl, hand: pl.hand.filter(c => c.id !== cardId), pendingItemEffect: null } : pl);

        setPlayers(updatedPlayersAfterPlay);

        const charName = p.character ? CHARACTERS[p.character].name : 'Sin personaje';
        addLog(`${p.name} (${charName}) juega ${card.type === 'NUMBER' ? `${card.suit} ${card.value}` : card.type}.`);

        if (currentTrap && currentTrap.condition(card, leadSuit) && p.character !== CharacterType.STRATEGIST) {
            setPlayers(prev => prev.map(pl => {
                if (pl.id === p.id) {
                    if (pl.score >= 10) {
                        setTrapPool(tp => tp + 10);
                        addLog(`¡TRAMPA! ${pl.name} activó "${currentTrap.name}". -10 pts al Pozo.`);
                        return { ...pl, score: pl.score - 10 };
                    } else {
                        addLog(`¡TRAMPA! ${pl.name} activó "${currentTrap.name}" pero está en bancarrota.`);
                    }
                }
                return pl;
            }));
        }

        if (newPlayed.length < players.length) {
            const nextIdx = (currentPlayerIdx + 1) % players.length;
            setCurrentPlayerIdx(nextIdx);
        } else {
            isResolvingRef.current = true;
            resolveTrick(newPlayed, updatedPlayersAfterPlay);
        }
    };

    const restoreFullState = (state: {
        phase?: GamePhase;
        round?: number;
        trick?: number;
        players?: Player[];
        currentPlayerIdx?: number;
        leadSuit?: Suit | null;
        playedCards?: Card[];
        isKakumei?: boolean;
        isRevolt?: boolean;
        characterPool?: CharacterType[];
        selectionOrder?: string[];
        selectionIndex?: number;
        gameMode?: GameMode;
        roundResults?: RoundResult | null;
        gameResult?: TournamentResult | null;
    }) => {
        if (state.phase !== undefined) setPhase(state.phase);
        if (state.round !== undefined) setRound(state.round);
        if (state.trick !== undefined) setTrick(state.trick);
        if (state.players) setPlayers(state.players);
        if (state.currentPlayerIdx !== undefined) setCurrentPlayerIdx(state.currentPlayerIdx);
        if (state.leadSuit !== undefined) setLeadSuit(state.leadSuit);
        if (state.playedCards) setPlayedCards(state.playedCards);
        if (state.isKakumei !== undefined) setIsKakumei(state.isKakumei);
        if (state.isRevolt !== undefined) setIsRevolt(state.isRevolt);
        if (state.characterPool) setCharacterPool(state.characterPool);
        if (state.selectionOrder) setSelectionOrder(state.selectionOrder);
        if (state.selectionIndex !== undefined) setSelectionIndex(state.selectionIndex);
        if (state.gameMode !== undefined) setGameMode(state.gameMode);
        if (state.roundResults !== undefined) setRoundResults(state.roundResults);
        if (state.gameResult !== undefined) setGameResult(state.gameResult);
        isResolvingRef.current = false;
        isRoundResolvingRef.current = false;
    };

    return {
        gameMode, players, phase, currentPlayerIdx, trickStarterIdx, round, trick,
        selectionOrder, selectionIndex, characterPool, playedCards, drawPile,
        leadSuit, isRevolt, isKakumei, roundResults, logs, showLogs, strategistPendingChoice,
        strategistInheritedCard, abilityMode, selectedCards, viewingCharacter, itemCardToShow,
        viewingRules, isResolvingRef, gameResult, viewingTraps, trapDeck, aiDifficulty,
        localSeatId,
        setPlayers, setPhase, setShowLogs, setViewingRules, setViewingCharacter, setItemCardToShow,
        setSelectedCards, setAbilityMode, setStrategistInheritedCard, setStrategistPendingChoice, setViewingTraps,
        setAiDifficulty, setLocalSeatId,
        handlePlayerDisconnect, handlePlayerReconnect, handleBotTakeover, restoreFullState,
        initGame, resetGame, addLog, selectCharacter, playCard, proceedFromSummary, performAction
    };
};
