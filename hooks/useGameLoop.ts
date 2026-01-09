import { useState, useCallback, useRef, useEffect } from 'react';
import { Player, Card, Suit, CharacterType, GamePhase, GameMode, CardType, Item, Trap, RoundResult } from '../game/core/types';
import { CHARACTERS, ITEMS, TRAPS, TASKS } from '../game/core/constants';
import { createDeck, getValidMoves, determineWinner, getAiMove, determineTournamentWinner, TournamentResult } from '../game/core/gameLogic';
import { getCharacterLogic } from '../logic/logic_Registry';
import { getScoringLogic } from '../logic/scoring/scoring_Registry';
import { PhantomThiefLogic } from '../logic/characters/logic_PhantomThief';
import { useGameActions } from '../useGameActions';

// Initial Players
const getInitialPlayers = (): Player[] => [
    { id: 'p1', name: 'Tú', character: null, hand: [], wonCards: [], items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 30, goldCrowns: 0, blackCrowns: 0, wins: 0, gambleSwaps: 0, revoltUsed: false, rulerUsedRuleAvoidance: false, hermitUsedAbility: false, hermitDiscarding: false, strategistUsedIgnore: false, betAmount: 0, collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [], berserkerDeck: [], thiefTargetIds: [], thiefChipValue: null, thiefBetrayalMode: false, tasksAssigned: {} }, // ChipValue NULL defines not set
    { id: 'p2', name: 'Rival 1', character: null, hand: [], wonCards: [], items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 30, goldCrowns: 0, blackCrowns: 0, wins: 0, gambleSwaps: 0, revoltUsed: false, rulerUsedRuleAvoidance: false, hermitUsedAbility: false, hermitDiscarding: false, strategistUsedIgnore: false, betAmount: 0, collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [], berserkerDeck: [], thiefTargetIds: [], thiefChipValue: 0, thiefBetrayalMode: false, tasksAssigned: {} },
    { id: 'p3', name: 'Rival 2', character: null, hand: [], wonCards: [], items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 30, goldCrowns: 0, blackCrowns: 0, wins: 0, gambleSwaps: 0, revoltUsed: false, rulerUsedRuleAvoidance: false, hermitUsedAbility: false, hermitDiscarding: false, strategistUsedIgnore: false, betAmount: 0, collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [], berserkerDeck: [], thiefTargetIds: [], thiefChipValue: 0, thiefBetrayalMode: false, tasksAssigned: {} }
];

export const useGameLoop = () => {
    // ...
    // Inside startRound:
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.BASIC);
    const [players, setPlayers] = useState<Player[]>(getInitialPlayers());
    const [phase, setPhase] = useState<GamePhase>(GamePhase.MODE_SELECTION);


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
        if (!p || p.id !== 'p1') return;

        if (p.character === CharacterType.ALCHEMIST) setAbilityMode('ALCHEMIST_SELECT');
        else if (p.character === CharacterType.GAMBLER && p.bid === undefined) {
            if (p.gambleSwaps && p.gambleSwaps > 0) setAbilityMode('GAMBLER_SWAP');
            else setAbilityMode('GAMBLE_BID');
        }
        else if (p.character === CharacterType.KING && p.hand.length > 5) setAbilityMode('KING_SETUP');
        else if (p.character === CharacterType.ADVENTURER && p.items.length === 0) setAbilityMode('ADVENTURER_SETUP');
        else if (p.character === CharacterType.BERSERKER && p.berserkerDeck && p.berserkerDeck.length > 2) setAbilityMode('BERSERKER_SETUP');
        else if (p.character === CharacterType.RULER && (!p.tasksAssigned || Object.keys(p.tasksAssigned).length === 0)) setAbilityMode('RULER_SETUP');
        else if (p.character === CharacterType.STRATEGIST && p.hand.length > 5 && round === 1) setAbilityMode('STRATEGIST_DISCARD'); // Only needed if initially > 5 (Start of game) or handled in setup
        // Actually, Strategist setup adds 1 card (Black7) to 5 dealt -> 6.
        // So always check if Strategist has > 5 cards and hasn't discarded yet.
        // But wait, Strategist keeps cards between rounds? No, hand resets.
        // So checking hand.length > 5 is enough.
        else if (p.character === CharacterType.STRATEGIST && p.hand.length > 5) setAbilityMode('STRATEGIST_DISCARD');
        else if (p.character === CharacterType.PHANTOM_THIEF && p.thiefChipValue === null) setAbilityMode('PHANTOM_THIEF_SETUP');
        else if (p.character === CharacterType.TIME_TRAVELER && (!p.timeTravelPredictions || p.timeTravelPredictions.length === 0)) setAbilityMode('TIME_TRAVELER_SETUP');
        else setAbilityMode('NONE');
    };

    const startRound = useCallback((currentPlayers?: Player[]) => {
        const playersToUse = currentPlayers || players;
        let deck = [...createDeck()];
        let newPlayers = playersToUse.map(p => {
            const logic = getCharacterLogic(p.character);
            const setupData = logic.setup({ deck, playerId: p.id, round, players: playersToUse });

            // Check for Inherited Card (Strategist Bonus from prev round)
            let hand = setupData.hand || [];
            if (p.id === 'p1' && strategistInheritedCard) {
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
            setTrapPool(0);
        }

        // Ruler Setup (Human)
        const rulerPlayer = newPlayers.find(p => p.character === CharacterType.RULER);
        if (rulerPlayer && rulerPlayer.id === 'p1') {
            setAbilityMode('RULER_SETUP');
        }

        // Phantom Thief Setup (Human)
        const thiefPlayer = newPlayers.find(p => p.character === CharacterType.PHANTOM_THIEF);
        if (thiefPlayer && thiefPlayer.id === 'p1') {
            // Force setup if not set yet (we use chipValue === null now to detect unset, or just force it)
            // But wait, setup function returns chipValue: 0. 
            // We should probably init it to -1 or null in setup() if we want to force distinct setup.
            // OR just force mode here regardless.
            setAbilityMode('PHANTOM_THIEF_SETUP');
            addLog("Phantom Thief: Configura tu Chip de Predicción.");
        }

        // Adventurer Setup (Human)
        const humanAdv = newPlayers.find(p => p.id === 'p1' && p.character === CharacterType.ADVENTURER);
        if (humanAdv && humanAdv.items.length === 0) {
            setAbilityMode('ADVENTURER_SETUP');
            addLog("Aventurero: Selecciona tus 2 objetos iniciales.");
        }

        // Berserker Setup (Human)
        const humanBerserker = newPlayers.find(p => p.id === 'p1' && p.character === CharacterType.BERSERKER);
        if (humanBerserker) {
            setAbilityMode('BERSERKER_SETUP');
            addLog("Berserker: ¡Prepárate para la batalla!");
        }

        // King Setup (Human)
        const humanKing = newPlayers.find(p => p.id === 'p1' && p.character === CharacterType.KING);
        if (humanKing && humanKing.hand.length > 5) {
            setAbilityMode('KING_SETUP');
            addLog("Rey: Debes descartar 1 carta para quedarte con 5.");
        }

        // Gambler Setup (Human)
        const humanGambler = newPlayers.find(p => p.id === 'p1' && p.character === CharacterType.GAMBLER);
        if (humanGambler && humanGambler.bid === undefined) {
            if (humanGambler.gambleSwaps && humanGambler.gambleSwaps > 0) setAbilityMode('GAMBLER_SWAP');
            else setAbilityMode('GAMBLE_BID');
            addLog("Apostador: ¡Haz tu predicción!");
        }

        // Strategist Setup (Human)
        const humanStrategist = newPlayers.find(p => p.id === 'p1' && p.character === CharacterType.STRATEGIST);
        if (humanStrategist) {
            setAbilityMode('STRATEGIST_SETUP');
            addLog("Estratega: Define tu Plan Maestro de Trampas.");
            // If hand > 5, Discard phase will trigger after setup is done (via checkPlayerAbilityMode or logic update)
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

        setCharacterPool(newPool);
        setAdvancedModeDeck(newDeck);
        setPhase(GamePhase.CHARACTER_SELECTION);
        addLog(`Ronda ${r}: Selección de personajes en marcha.`);
    };

    const initGame = (mode: GameMode) => {
        setGameMode(mode);
        setPlayers(getInitialPlayers());
        setRound(1);
        setTrick(1);

        let initialDeck: CharacterType[] = [];
        if (mode === GameMode.BASIC) {
            initialDeck = [CharacterType.KING, CharacterType.GAMBLER, CharacterType.RESISTANCE, CharacterType.HERMIT, CharacterType.BERSERKER];
        } else {
            initialDeck = Object.values(CharacterType).sort(() => Math.random() - 0.5);
        }

        setAdvancedModeDeck(initialDeck);
        prepareRoundSelection(1, mode, initialDeck, getInitialPlayers(), []);
    };

    const selectCharacter = (charType: CharacterType) => {
        const currentPickerId = selectionOrder[selectionIndex];
        const isTaken = players.some(p => p.character === charType);
        if (isTaken) return;

        const updatedPlayers = players.map(p => p.id === currentPickerId ? { ...p, character: charType, lastCharacter: charType } : p);
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

        let blackCrownsGiven = 0;
        const crownResults = playersToUse.map(p => {
            let gold = 0; let black = 0;
            if (p.character !== CharacterType.COLLECTOR) {
                // Golden Crown: Only if UNIQUE winner (winnersCount === 1) and maxWins > 0
                if (p.wins === maxWins && maxWins > 0 && winnersCount === 1) {
                    gold = 1;
                }

                const isResistanceBlackCrown = p.character === CharacterType.RESISTANCE && p.wins === 1 && p.wonRevolutionTrick;
                if ((p.wins === 0 || isResistanceBlackCrown) && blackCrownsGiven < 2) {
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
            const strategist = playersToUse.find(p => p.character === CharacterType.STRATEGIST && p.id === 'p1');
            const needsChoice = strategist && (strategist.wins === 0 || strategist.wins === 1);
            if (needsChoice) {
                setStrategistPendingChoice({ type: 'RARE', pointsObj: 0 });
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

                    if (p.character === CharacterType.RESISTANCE && (isKakumei || isRevolt)) {
                        bonus += 30;
                        addLog(`La Resistencia gana 30 pts extra por victoria en Revolución.`);
                    }

                    const resCard = cards.find(c => c.ownerId === winnerId);
                    if (isKakumei && p.character === CharacterType.RESISTANCE && resCard?.suit === Suit.BLACK) {
                        addLog(`¡Baza de Revolución ganada con CARTA NEGRA! ¡LA RESISTENCIA GANA LA PARTIDA!`);
                        return { ...p, wins: p.wins + 1, wonCards: [...p.wonCards, ...cards], score: p.score + 900, wonRevolutionTrick: true, collectedCards: isCollector ? [...p.collectedCards, ...cards] : p.collectedCards };
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
                        wonRevolutionTrick: p.wonRevolutionTrick || isKakumei,
                        collectedCards: nextCollected
                    };
                } else {
                    const resetFlags = {
                        hermitUsedAbility: false,
                        adventurerUsedItem: false,
                        gamblerUsedAbility: false
                    };

                    if (isCollector && hasReservedCard) {
                        const reservedCard = cards.find(c => c.id === p.reservedCardId);
                        if (reservedCard) {
                            addLog(`Coleccionista: Recupera carta reservada (${reservedCard.suit} ${reservedCard.value}).`);
                            return {
                                ...p,
                                ...resetFlags,
                                collectedCards: [...p.collectedCards, reservedCard],
                                reservedCardId: null
                            };
                        }
                    }
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

                // Check for Samurai Win Ability (Take Red Card)
                const availableRedCards = cards.filter(c => c.suit === Suit.RED && c.ownerId !== winnerId);
                if (winnerP.character === CharacterType.SAMURAI && availableRedCards.length > 0) {
                    setAbilityMode('SAMURAI_WIN_CHOICE');
                    // Pause resolution to wait for user input
                    return;
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
                pendingItemEffect: null
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

            // 5. Check Time Traveler "Change the Past" Opportunity
            // "Change the past (not applicable in the 5th trick)"
            // Trick index is 1-based usually, or 0-based? Let's check `trick` state.
            // `trick` from useGameLoop is 1-based (starts at 1).
            // So if trick < 5.
            const winner = updatedPlayers[winnerIdx];
            if (winner.character === CharacterType.TIME_TRAVELER && trick < 5 && winner.timeTravelTokens > 0) {
                // Trigger Interception
                setAbilityMode('TIME_TRAVEL_WIN_CHOICE');
                // We must NOT clear playedCards yet. They are needed if user chooses to Change Past.
                // We should defer the cleanup.
                // But wait, `resolveTrick` is usually called at end of animation.
                // If we return here, we stop the loop.
                // We need to store the "pending resolution" state if they choose NO.
                // Or we can just handle the "No" by calling a "Continue Resolution" action.

                // We'll set a ref or state to know who won, so we can resume if they cancel.
                // Actually, simpler: The Modal will have "Confirm Change" and "Skip".
                // "Skip" calls `COMPLETE_TRICK` action which finishes the job.
                // "Confirm" calls `TIME_TRAVEL_CHANGE_PAST`.

                return; // STOP execution here.
            }

            setPlayedCards([]);
            setLeadSuit(null);
            setTrickStarterIdx(winnerIdx);
            setCurrentPlayerIdx(winnerIdx);
            isResolvingRef.current = false;

            if (updatedPlayers.some(p => p.score >= 900)) {
                addLog("¡Victoria Instantánea! Ronda finalizada.");
                if (!isRoundResolvingRef.current) {
                    isRoundResolvingRef.current = true;
                    setPlayers(updatedPlayers);
                    resolveRound(updatedPlayers);
                }
            } else if (trick < 5) {
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
        setPhase
    });

    const playCard = (cardId: string) => {
        if (isResolvingRef.current) return;
        const p = players[currentPlayerIdx];
        const isUser = p.id === 'p1';
        // Check character specific phases
        const isKingDiscardPhase = p.character === CharacterType.KING && p.hand.length > 5;
        const isGamblerSwapPhase = p.character === CharacterType.GAMBLER && (p.gambleSwaps || 0) > 0 && p.bid === undefined;
        // Robust check: Use hermitDiscarding flag
        const isHermitDiscardPhase = p.character === CharacterType.HERMIT && (p as any).hermitDiscarding;

        if (isUser && (['ALCHEMIST_SELECT', 'GAMBLER_SWAP', 'KING_DISCARD', 'HERMIT_DISCARD', 'SUMMONER_SELECT_CARD', 'SAMURAI_DISCARD', 'STRATEGIST_DISCARD'].includes(abilityMode) || isKingDiscardPhase || isGamblerSwapPhase || isHermitDiscardPhase)) {
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

    return {
        gameMode, players, phase, currentPlayerIdx, trickStarterIdx, round, trick,
        selectionOrder, selectionIndex, characterPool, playedCards, drawPile,
        leadSuit, isRevolt, isKakumei, roundResults, logs, showLogs, strategistPendingChoice,
        strategistInheritedCard, abilityMode, selectedCards, viewingCharacter, itemCardToShow,
        viewingRules, isResolvingRef, gameResult, viewingTraps, trapDeck,
        setPlayers, setPhase, setShowLogs, setViewingRules, setViewingCharacter, setItemCardToShow,
        setSelectedCards, setAbilityMode, setStrategistInheritedCard, setStrategistPendingChoice, setViewingTraps,
        initGame, resetGame, addLog, selectCharacter, playCard, proceedFromSummary, performAction
    };
};
