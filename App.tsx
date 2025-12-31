import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Card, Suit, CharacterType, GamePhase, GameMode, CardType, Item, Trap } from './types';
import { CHARACTERS, ITEMS, TRAPS, BEASTS, TASKS } from './constants';
import { createDeck, getValidMoves, calculateAlchemyValue, determineWinner, calculateCollectorScore, getAiMove } from './gameLogic';
import { getCharacterLogic } from './logic/logic_Registry';
import PlayerBoard from './components/PlayerBoard';
import GameCard from './components/GameCard';
import CharacterModal from './components/CharacterModal';
import { useGameActions } from './useGameActions';
import { CharacterSelection } from './components/CharacterSelection';

const getInitialPlayers = (): Player[] => [
    { id: 'p1', name: 'Tú', character: null, hand: [], wonCards: [], items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 30, goldCrowns: 0, blackCrowns: 0, wins: 0, gambleSwaps: 0, revoltUsed: false, rulerUsedRuleAvoidance: false, hermitUsedAbility: false, strategistUsedIgnore: false, betAmount: 0, collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [], berserkerDeck: [], thiefTargetIds: [], thiefChipValue: 0, thiefBetrayalMode: false, tasksAssigned: {} },
    { id: 'p2', name: 'Rival 1', character: null, hand: [], wonCards: [], items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 30, goldCrowns: 0, blackCrowns: 0, wins: 0, gambleSwaps: 0, revoltUsed: false, rulerUsedRuleAvoidance: false, hermitUsedAbility: false, strategistUsedIgnore: false, betAmount: 0, collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [], berserkerDeck: [], thiefTargetIds: [], thiefChipValue: 0, thiefBetrayalMode: false, tasksAssigned: {} },
    { id: 'p3', name: 'Rival 2', character: null, hand: [], wonCards: [], items: [], tasks: [], beasts: [], rearBeasts: [], mp: 0, magicElements: [], score: 30, goldCrowns: 0, blackCrowns: 0, wins: 0, gambleSwaps: 0, revoltUsed: false, rulerUsedRuleAvoidance: false, hermitUsedAbility: false, strategistUsedIgnore: false, betAmount: 0, collectedCards: [], timeTravelTokens: 0, timeTravelPredictions: [], berserkerDeck: [], thiefTargetIds: [], thiefChipValue: 0, thiefBetrayalMode: false, tasksAssigned: {} }
];

const App: React.FC = () => {
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
    const [advRed, setAdvRed] = useState<string | null>(null);
    const [advBlue, setAdvBlue] = useState<string | null>(null);
    const isResolvingRef = useRef(false);
    const isRoundResolvingRef = useRef(false);
    const [itemCardToShow, setItemCardToShow] = useState<Item | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const prepareRoundSelection = (
        r: number,
        mode: GameMode,
        charDeck: CharacterType[],
        currentPlayers: Player[],
        previousRoundPool: CharacterType[]
    ) => {
        let newOrder: string[] = [];
        if (r === 1) {
            // Round 1: Random or clockwise
            newOrder = currentPlayers.map(p => p.id).sort(() => Math.random() - 0.5);
        } else {
            // Round 2 & 3 Priority Logic:
            // 1. Ex-King
            // 2. Players WITHOUT Gold Crown (Ascending Score)
            // 3. Players WITH Gold Crown (Ascending Score)

            const exKing = currentPlayers.find(p => p.lastCharacter === CharacterType.KING);
            const others = currentPlayers.filter(p => p.id !== exKing?.id);

            const sortedOthers = others.sort((a, b) => {
                // Group by Gold Crown existence
                if (a.goldCrowns === 0 && b.goldCrowns > 0) return -1; // No crown comes first
                if (a.goldCrowns > 0 && b.goldCrowns === 0) return 1;

                // If same crown status, sort by Score Ascending (Loser picks first)
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
            // Basic + Advanced (Expansion 1)
            const advancedChars = [
                CharacterType.STRATEGIST, CharacterType.SUMMONER, CharacterType.ALCHEMIST,
                CharacterType.NINJA, CharacterType.SAMURAI, CharacterType.ADVENTURER
            ];
            newPool = [...basicChars, ...advancedChars];
        } else if (mode === GameMode.ALL_STAR) {
            // All characters from all expansions
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

    // Turnos de la IA para elegir personaje
    useEffect(() => {
        if (phase === GamePhase.CHARACTER_SELECTION) {
            const currentPickerId = selectionOrder[selectionIndex];
            if (currentPickerId && currentPickerId !== 'p1') {
                const timer = setTimeout(() => {
                    const available = characterPool.filter(ct => !players.some(p => p.character === ct));
                    if (available.length > 0) {
                        const randomChar = available[Math.floor(Math.random() * available.length)];
                        selectCharacter(randomChar);
                    }
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [phase, selectionIndex, selectionOrder, players, characterPool]);

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

        // Ruler Task Assignment
        const rulerPlayer = newPlayers.find(p => p.character === CharacterType.RULER);
        if (rulerPlayer) {
            const availableTasks = [...TASKS].sort(() => Math.random() - 0.5);
            newPlayers = newPlayers.map(p => {
                if (p.id !== rulerPlayer.id) {
                    const task = availableTasks.pop(); // Assign unique task
                    if (task) {
                        return { ...p, tasks: [task] };
                    }
                }
                return p;
            });
            addLog("El Gobernante ha asignado tareas a sus súbditos.");
        }

        // Clear inheritance after processing
        // Check for Adventurer Setup
        const humanAdv = newPlayers.find(p => p.id === 'p1' && p.character === CharacterType.ADVENTURER);
        if (humanAdv && humanAdv.items.length === 0) {
            setAbilityMode('ADVENTURER_SETUP');
            addLog("Aventurero: Selecciona tus 2 objetos iniciales.");
        }

        // Check for Berserker Setup
        // Human: Trigger UI
        const humanBerserker = newPlayers.find(p => p.id === 'p1' && p.character === CharacterType.BERSERKER);
        if (humanBerserker) {
            setAbilityMode('BERSERKER_SETUP');
            addLog("Berserker: ¡Prepárate para la batalla!");
        }

        // AI: Auto-Setup
        newPlayers = newPlayers.map(p => {
            if (p.id !== 'p1' && p.character === CharacterType.BERSERKER) {
                const logic = getCharacterLogic(CharacterType.BERSERKER) as any;
                if (logic.drawBerserkerHand && p.berserkerDeck) {
                    const { hand, remaining } = logic.drawBerserkerHand(p.berserkerDeck);
                    addLog(`${p.name} (Berserker) ruge y prepara su hacha.`);
                    return { ...p, hand, berserkerDeck: remaining };
                }
            }
            return p;
        });

        // Check for King Setup (Discard 1 card if > 5)
        const humanKing = newPlayers.find(p => p.id === 'p1' && p.character === CharacterType.KING);
        if (humanKing && humanKing.hand.length > 5) {
            setAbilityMode('KING_SETUP');
            addLog("Rey: Debes descartar 1 carta para quedarte con 5.");
        }

        if (strategistInheritedCard) {
            setStrategistInheritedCard(null);
        }

        // Initialize AI Turn for Player 1 if not human (rare case in this logic)
        // ...
        setPlayers(newPlayers);
        setDrawPile(deck);
        setPhase(GamePhase.TRICK_PLAYING);
        setCurrentPlayerIdx(trickStarterIdx);
        setTrick(1);
        setIsRevolt(false);
        setIsKakumei(false);
        isRoundResolvingRef.current = false;
        addLog(`--- COMIENZA LA RONDA ${round} ---`);
        checkPlayerAbilityMode(newPlayers[trickStarterIdx]);
    }, [round, players, trickStarterIdx]);

    const checkPlayerAbilityMode = (p: Player) => {
        if (!p || p.id !== 'p1') return;

        if (p.character === CharacterType.ALCHEMIST) setAbilityMode('ALCHEMIST_SELECT');
        else if (p.character === CharacterType.GAMBLER && p.bid === undefined) {
            if (p.gambleSwaps && p.gambleSwaps > 0) setAbilityMode('GAMBLER_SWAP');
            else setAbilityMode('GAMBLE_BID');
        }
        else if (p.character === CharacterType.KING && p.hand.length > 5) setAbilityMode('KING_SETUP');
        else if (p.character === CharacterType.ADVENTURER && p.items.length === 0) setAbilityMode('ADVENTURER_SETUP');
        else if (p.character === CharacterType.BERSERKER) setAbilityMode('BERSERKER_SETUP');
        else setAbilityMode('NONE');
    };


    const performCheckGameOver = (currentPlayers: Player[]) => {
        const winnerByInstant = currentPlayers.find(p => p.score >= 900);
        const winnerByGold = currentPlayers.find(p => p.goldCrowns >= 2);
        const winnerByBlack = currentPlayers.find(p => p.blackCrowns >= 3);
        const roundLimitReached = round === 3;

        if (winnerByInstant || winnerByGold || winnerByBlack || roundLimitReached) {
            setPhase(GamePhase.GAME_OVER);
        } else {
            setRound(r => r + 1);
            prepareRoundSelection(round + 1, gameMode, advancedModeDeck, currentPlayers, characterPool);
        }
    };

    const resolveRound = () => {
        addLog(`--- FINAL DE LA RONDA ${round} ---`);

        setPlayers(prev => {
            let updated = [...prev];

            // 1. Calcular Puntos por Personaje
            updated = updated.map(p => {
                const char = p.character ? CHARACTERS[p.character] : null;
                let pts = char ? (char.pointsByWins[p.wins] || 0) : 0;

                // Logic King: Kings Privilege (x2 in Round 3)
                if (p.character === CharacterType.KING && round === 3) {
                    pts *= 2;
                    addLog(`El Rey duplica sus puntos en la Ronda Final: ${pts / 2} x 2 = ${pts}`);
                }

                // Logic Strategist: End of Round Choice (0 or 1 wins)
                if (p.character === CharacterType.STRATEGIST && p.id === 'p1') {
                    if (p.wins === 0) {
                        setStrategistPendingChoice({ type: 'RARE', pointsObj: 50 });
                        pts = 0;
                    } else if (p.wins === 1) {
                        setStrategistPendingChoice({ type: 'BLACK7', pointsObj: 30 });
                        pts = 0;
                    }
                } else if (p.character === CharacterType.STRATEGIST && p.id !== 'p1') {
                    if (p.wins === 0) pts = 50;
                    if (p.wins === 1) pts = 30;
                }

                // Lógica Tahúr
                if (p.character === CharacterType.GAMBLER) {
                    const success = p.bid === p.wins;
                    if (success) {
                        const bonus = (p.betAmount || 0);
                        pts += bonus;
                        addLog(`Tahúr: ¡Apuesta acertada! (+${bonus} pts)`);
                    } else {
                        const penalty = (p.betAmount || 0);
                        pts = -penalty;
                        addLog(`Tahúr: Falló apuesta. (-${penalty} pts)`);
                    }
                }

                // Logic Adventurer: Unused Items
                if (p.character === CharacterType.ADVENTURER) {
                    let itemBonus = 0;
                    p.items.forEach(it => {
                        itemBonus += (it.unusedPoints || 0);
                    });
                    if (itemBonus !== 0) {
                        addLog(`Aventurero: Items no usados (${itemBonus} pts).`);
                        pts += itemBonus;
                    }
                }

                // Logic Samurai: Greedy Penalty
                if (p.character === CharacterType.SAMURAI && p.wins === 5) {
                    pts = -100;
                    addLog("Samurai: ¡Penalización por CODICIA (5 victorias)! -100 pts.");
                }

                // Logic Hermit: Scoring Table
                if (p.character === CharacterType.HERMIT) {
                    const hermitMap: Record<number, number> = { 0: 50, 1: -10, 2: -30, 3: 70, 4: 100, 5: 999 };
                    pts = hermitMap[p.wins] || 0;
                    if (pts !== 999) addLog(`Ermitaño: Puntos por victorias (${p.wins} bazas): ${pts} pts.`);
                }

                // Logic Collector: Poker Sets
                if (p.character === CharacterType.COLLECTOR) {
                    const collectionResult = calculateCollectorScore(p.collectedCards);
                    pts = collectionResult.score;
                    addLog(`Coleccionista: Puntos por Colección (${p.collectedCards.length} cartas): ${pts} pts.`);
                    if (collectionResult.isInstantWin) {
                        pts = 999;
                        addLog("¡Coleccionista: GRAN COLECCIÓN! Victoria Instantánea.");
                    }
                }

                // Logic Berserker: 0 Wins = Instant Victory
                if (p.character === CharacterType.BERSERKER && p.wins === 0) {
                    pts = 999;
                    addLog("¡Berserker: 0 Victorias! Victoria Instantánea (Furia Desatanada).");
                }

                return { ...p, score: pts === 999 ? 999 : Math.max(0, p.score + pts) };
            });

            // 2. Coronas
            const maxWins = Math.max(...updated.map(p => p.wins));
            updated = updated.map(p => {
                // Rule: Collector cannot get crowns
                if (p.character === CharacterType.COLLECTOR) return p;

                if (p.wins === maxWins && maxWins > 0) {
                    addLog(`${p.name} obtiene una Corona Dorada.`);
                    return { ...p, goldCrowns: p.goldCrowns + 1 };
                }

                // Resistance Special: 1 win (if Kakumei) counts for Black Crown
                const isResistanceBlackCrown = p.character === CharacterType.RESISTANCE && p.wins === 1 && p.wonRevolutionTrick;
                if (p.wins === 0 || isResistanceBlackCrown) {
                    addLog(`${p.name} obtiene una Corona Negra.`);
                    return { ...p, blackCrowns: p.blackCrowns + 1 };
                }
                return p;
            });

            // 3. Phantom Thief Stealing Logic (After Crowns Assigned)
            const thief = updated.find(p => p.character === CharacterType.PHANTOM_THIEF);
            if (thief && thief.wins !== 0 && thief.wins !== 5) {
                let targetIds = thief.thiefBetrayalMode ? [thief.thiefPartnerId!] : (thief.thiefTargetIds || []);
                const chip = thief.thiefChipValue || 0;

                let bestVictimId: string | null = null;
                let bestStealType: 'GOLD' | 'BLACK' | 'POINTS' | null = null;

                targetIds.forEach(tid => {
                    const victim = updated.find(v => v.id === tid);
                    if (!victim) return;

                    const diff = Math.abs(thief.wins - victim.wins);
                    const matches = chip === 0 ? diff === 0 : (diff === 1); // 0 or +/-1

                    if (matches) {
                        if (victim.goldCrowns > 0) {
                            if (bestStealType !== 'GOLD') { bestStealType = 'GOLD'; bestVictimId = victim.id; }
                        } else if (victim.blackCrowns > 0) {
                            if (bestStealType !== 'GOLD' && bestStealType !== 'BLACK') { bestStealType = 'BLACK'; bestVictimId = victim.id; }
                        } else if (victim.score >= 30) {
                            if (!bestStealType) { bestStealType = 'POINTS'; bestVictimId = victim.id; }
                        }
                    }
                });

                if (bestVictimId && bestStealType) {
                    updated = updated.map(p => {
                        if (p.id === bestVictimId) {
                            if (bestStealType === 'GOLD') return { ...p, goldCrowns: p.goldCrowns - 1 };
                            if (bestStealType === 'BLACK') return { ...p, blackCrowns: p.blackCrowns - 1 };
                            if (bestStealType === 'POINTS') return { ...p, score: p.score - 30 };
                        }
                        if (p.id === thief.id) {
                            if (bestStealType === 'GOLD') { addLog(`Phantom Thief roba una Corona Dorada a ${updated.find(v => v.id === bestVictimId)?.name}.`); return { ...p, goldCrowns: p.goldCrowns + 1 }; }
                            if (bestStealType === 'BLACK') { addLog(`Phantom Thief roba una Corona Negra a ${updated.find(v => v.id === bestVictimId)?.name}.`); return { ...p, blackCrowns: p.blackCrowns + 1 }; }
                            if (bestStealType === 'POINTS') { addLog(`Phantom Thief roba 30 puntos a ${updated.find(v => v.id === bestVictimId)?.name}.`); return { ...p, score: p.score + 30 }; }
                        }
                        return p;
                    });
                } else {
                    addLog("Phantom Thief no encontró víctimas adecuadas para su robo.");
                }
            } else if (thief && thief.wins === 0) {
                updated = updated.map(p => p.id === thief.id ? { ...p, score: p.score - 20 } : p);
                addLog("Phantom Thief: 0 victorias. Gana corona negra pero pierde 20 puntos.");
            } else if (thief && thief.wins === 2) {
                updated = updated.map(p => {
                    // Deduct base points for 2 wins if any? Standard logic handled in Step 1.
                    // Just add points to partner.
                    if (p.id === thief.thiefPartnerId) {
                        addLog(`Phantom Thief otorga 50 puntos a su socio ${p.name}.`);
                        return { ...p, score: p.score + 50 };
                    }
                    return p;
                });
            }

            // 4. Time Traveler Predictions
            const roundGoldWinner = updated.find(p => p.wins === maxWins && maxWins > 0);
            const roundBlackWinners = updated.filter(p => p.wins === 0 || (p.character === CharacterType.RESISTANCE && p.wins === 1 && p.wonRevolutionTrick));

            updated = updated.map(p => {
                if (p.character === CharacterType.TIME_TRAVELER) {
                    let predictionBonus = 0;
                    const predictions = p.timeTravelPredictions || [];

                    if (predictions[0] && roundGoldWinner && predictions[0] === roundGoldWinner.id) {
                        predictionBonus += 50;
                        addLog("Viajero del Tiempo: ¡Predicción de Corona Dorada ACERTADA! (+50 pts)");
                    }
                    if (predictions[1] && roundBlackWinners.some(bw => bw.id === predictions[1])) {
                        predictionBonus += 50;
                        addLog("Viajero del Tiempo: ¡Predicción de Corona Negra 1 ACERTADA! (+50 pts)");
                    }
                    if (predictions[2] && roundBlackWinners.some(bw => bw.id === predictions[2])) {
                        predictionBonus += 50;
                        addLog("Viajero del Tiempo: ¡Predicción de Corona Negra 2 ACERTADA! (+50 pts)");
                    }

                    if (round === 3 && predictionBonus === 150) {
                        addLog("¡VIAJERO DEL TIEMPO: PREDICCIÓN PERFECTA! Victoria Instantánea.");
                        return { ...p, score: 999 };
                    }
                    return { ...p, score: p.score + predictionBonus };
                }
                return p;
            });

            return updated;
        });

        // Effect check check
        setTimeout(() => {
            const strategist = players.find(p => p.character === CharacterType.STRATEGIST && p.id === 'p1');
            const needsChoice = strategist && (strategist.wins === 0 || strategist.wins === 1);
            if (!needsChoice) {
                performCheckGameOver(players);
            }
        }, 2000);
    };

    const resolveTrick = (cards: Card[]) => {
        timerRef.current = setTimeout(() => {
            // Check Miria Passive (Summoner Rear)
            const miriaPassive = players.some(p => p.character === CharacterType.SUMMONER && p.rearBeasts.includes('b-miria'));

            const winnerId = determineWinner(cards, leadSuit, isRevolt, isKakumei, players, miriaPassive);
            const winnerIdx = players.findIndex(p => p.id === winnerId);
            const winnerName = players[winnerIdx].name;

            const winnerChar = players[winnerIdx].character ? CHARACTERS[players[winnerIdx].character!].name : 'Sin personaje';
            addLog(`¡${winnerName} (${winnerChar}) gana la baza!`);

            setPlayers(prev => prev.map(p => {
                // Determine if Collector is in this trick loss
                const isCollector = p.character === CharacterType.COLLECTOR;
                const hasReservedCard = p.reservedCardId !== null;

                if (p.id === winnerId) {
                    let bonus = 0;
                    // Strategist Pool Collection
                    if (p.character === CharacterType.STRATEGIST && trapPool > 0) {
                        bonus = trapPool;
                        addLog(`¡Estratega reclama el Pozo! (+${bonus} pts)`);
                        setTrapPool(0);
                    }

                    // Resistance Instant Win Check
                    const resCard = cards.find(c => c.ownerId === winnerId);
                    if (isKakumei && p.character === CharacterType.RESISTANCE && resCard?.suit === Suit.BLACK) {
                        addLog(`¡Baza de Revolución ganada con CARTA NEGRA! ¡LA RESISTENCIA GANA LA PARTIDA!`);
                        return { ...p, wins: p.wins + 1, wonCards: [...p.wonCards, ...cards], score: p.score + 900, wonRevolutionTrick: true, collectedCards: isCollector ? [...p.collectedCards, ...cards] : p.collectedCards };
                    }

                    // Collector Capture: If Collector wins, all cards go to collectedCards
                    let nextCollected = p.collectedCards;
                    if (isCollector) {
                        nextCollected = [...nextCollected, ...cards];
                        addLog(`Coleccionista: Captura TOTAL de la baza (${cards.length} cartas).`);
                    }

                    return {
                        ...p,
                        wins: p.wins + 1,
                        wonCards: [...p.wonCards, ...cards],
                        score: p.score + bonus,
                        wonRevolutionTrick: p.wonRevolutionTrick || isKakumei,
                        collectedCards: nextCollected
                    };
                } else {
                    // Time Traveler: Change the Past Redistribution
                    // If the winner was Time Traveler and they have tokens, they could have redistibuted.
                    // For simplicity, let's assume they always do it if they have tokens? Or let's just implement the scoring impact.
                    // Actually, the redistribution adds cards to others' hands.
                    const winnerP = players[winnerIdx];
                    if (winnerP.character === CharacterType.TIME_TRAVELER && winnerP.timeTravelTokens > 0) {
                        // This is a bit complex as it should be optional. 
                        // But let's check if we can add a log and a simple redistribution.
                        // Actually, I'll stick to REWIND for now as it's the more disruptive ability.
                    }

                    // Collector Reservation: If Collector loses, they take their reserved card
                    if (isCollector && hasReservedCard) {
                        const reservedCard = cards.find(c => c.id === p.reservedCardId);
                        if (reservedCard) {
                            addLog(`Coleccionista: Recupera carta reservada (${reservedCard.suit} ${reservedCard.value}).`);
                            return {
                                ...p,
                                collectedCards: [...p.collectedCards, reservedCard],
                                reservedCardId: null
                            };
                        }
                    }
                }
                return p;
            }));

            // Character-Specific Post-Win Logic
            const winnerP = players[winnerIdx];
            if (winnerP) {
                const logic = getCharacterLogic(winnerP.character);
                if (logic.onTrickWon) {
                    const updates = logic.onTrickWon(winnerP, cards, round);
                    if (Object.keys(updates).length > 0) {
                        setPlayers(prev => prev.map(p => p.id === winnerId ? { ...p, ...updates } : p));
                        if (winnerP.character === CharacterType.ADVENTURER && updates.items) {
                            addLog(`El Aventurero ha subido de nivel y tiene un nuevo objeto.`);
                        }
                    }
                }
            }

            // Next Trap Logic
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

            setPlayedCards([]);
            setLeadSuit(null);
            setTrickStarterIdx(winnerIdx);
            setCurrentPlayerIdx(winnerIdx);
            isResolvingRef.current = false;

            // Resistance Logic: Reset Kakumei (Revolt Trick is 1 trick only)
            if (isKakumei) {
                setIsKakumei(false);
                addLog("La Revolución ha terminado. La jerarquía se restablece.");
            }

            // Reset Hermit Ability for next trick
            setPlayers(prev => prev.map(p => p.character === CharacterType.HERMIT ? { ...p, hermitUsedAbility: false } : p));

            if (trick < 5) {
                setTrick(t => t + 1);
            } else {
                if (!isRoundResolvingRef.current) {
                    isRoundResolvingRef.current = true;
                    resolveRound();
                }
            }
        }, 1500);
    };

    const { performAction } = useGameActions({
        drawPile, setDrawPile, players, setPlayers, selectedCards, setSelectedCards,
        setAbilityMode, playedCards, setPlayedCards, setLeadSuit, setCurrentPlayerIdx,
        trickStarterIdx, setIsKakumei, addLog, resolveTrick, currentPlayerIdx,
        isResolvingRef, trick, setItemCardToShow
    });
    const playCard = (cardId: string) => {
        if (isResolvingRef.current) return;
        const p = players[currentPlayerIdx];
        const isUser = p.id === 'p1';
        const isKingDiscardPhase = p.character === CharacterType.KING && p.hand.length > 5;

        // Allow selection if in specific Ability Mode OR it's King's setup discard phase
        if (isUser && (['ALCHEMIST_SELECT', 'GAMBLER_SWAP', 'KING_DISCARD', 'HERMIT_DISCARD'].includes(abilityMode) || isKingDiscardPhase)) {
            setSelectedCards(prev => {
                if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
                // King discard only allows 1 card, so we might want to enforce single selection for UX, but multi-select logic is fine if button checks length.
                // However, let's keep it simple: toggle.
                return [...prev, cardId];
            });
            return;
        }

        const card = p.hand.find(c => c.id === cardId);
        if (!card) return;

        const validMoves = getValidMoves(p.hand, leadSuit);

        // Strategist Ability: Ignore Suit
        const isStrategistIgnore = abilityMode === 'STRATEGIST_IGNORE_SUIT';
        // Ruler: Rule Avoidance
        const isRulerIgnore = abilityMode === 'RULER_IGNORE_RULES';

        if (!validMoves.some(m => m.id === cardId) && !isStrategistIgnore && !isRulerIgnore) {
            if (validMoves.length > 0 && isUser) return;
        }

        // Reset mode if used
        if (isStrategistIgnore && isUser) {
            setAbilityMode('NONE');
            setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, strategistUsedIgnore: true } : pl));
            addLog("Estratega usa su habilidad para ignorar el palo.");
        }
        if (isRulerIgnore && isUser) {
            setAbilityMode('NONE');
            setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, rulerUsedRuleAvoidance: true } : pl));
            addLog("El Gobernante ignora las reglas y juega lo que quiere.");
        }

        if (leadSuit === null && card.suit !== Suit.COLORLESS) {
            setLeadSuit(card.suit);
        }

        let finalCard = { ...card, ownerId: p.id };

        // Apply Adventurer Item Effects
        if (p.pendingItemEffect) {
            if (p.pendingItemEffect === 'FIX_10') {
                finalCard.value = 10;
                addLog(`¡Hacha de Berserker! Valor cambiado a 10.`);
            } else if (p.pendingItemEffect === 'COLOR_SHIFT' && leadSuit) {
                finalCard.suit = leadSuit;
                addLog(`¡Varita del Gobernante! Color cambiado a ${leadSuit}.`);
            } else if (p.pendingItemEffect === 'VALUE_MODIFY') {
                // Simplified: Add 5 if value <= 4, else subtract 5
                const mod = finalCard.value <= 4 ? 5 : -5;
                finalCard.value = Math.max(1, Math.min(9, finalCard.value + mod));
                addLog(`¡Espada Milagrosa! Valor ajustado a ${finalCard.value}.`);
            } else if (p.pendingItemEffect === 'FACEDOWN') {
                finalCard.isFacedown = true;
                addLog(`¡Poción de Invisibilidad! Carta jugada boca abajo.`);
            }
        }

        // Apply Ninja Shadow Cloning
        if (abilityMode === 'NINJA_FACE_DOWN' && isUser) {
            finalCard.isFacedown = true;
            setAbilityMode('NONE');
            addLog(`¡Clon de Sombra! ${p.name} juega una carta boca abajo.`);
        }

        const newPlayed = [...playedCards, finalCard];
        setPlayedCards(newPlayed);
        setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, hand: pl.hand.filter(c => c.id !== cardId), pendingItemEffect: null } : pl));

        const charName = p.character ? CHARACTERS[p.character].name : 'Sin personaje';
        addLog(`${p.name} (${charName}) juega ${card.type === 'NUMBER' ? `${card.suit} ${card.value}` : card.type}.`);

        // Strategist Trap Check
        if (currentTrap && currentTrap.condition(card, leadSuit) && p.character !== CharacterType.STRATEGIST) {
            // Apply Penalty
            // Rule: "Restar 10 puntos... y moverlos a un pozo"
            // If player score is 0, do nothing? Rule: "Si un jugador tiene 0 puntos... simplemente no se añade nada".
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
            resolveTrick(newPlayed);
        }
    };


    // Turnos de la IA
    useEffect(() => {
        if (phase === GamePhase.TRICK_PLAYING && currentPlayerIdx !== 0 && !isResolvingRef.current && abilityMode === 'NONE') {
            const timer = setTimeout(() => {
                const p = players[currentPlayerIdx];
                const moveId = getAiMove(p, leadSuit, playedCards);
                if (moveId) playCard(moveId);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentPlayerIdx, phase, isResolvingRef.current]);

    const renderSelection = () => {
        const currentPicker = players.find(p => p.id === selectionOrder[selectionIndex]);
        const isUserTurn = currentPicker?.id === 'p1';

        return (
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col h-full animate-in fade-in duration-500">
                {/* Header de Selección */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-2">Selección de Personaje</h2>
                    <div className="inline-flex items-center gap-4 bg-white px-8 py-3 rounded-full shadow-sm border border-slate-200">
                        <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Turno actual</span>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <span className={`font-black uppercase text-lg ${isUserTurn ? 'text-teal-500 animate-pulse' : 'text-slate-700'}`}>
                            {currentPicker?.name}
                        </span>
                    </div>
                </div>

                {/* Grid de Personajes - Estilo Clásico/Premium */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {characterPool.map(ct => {
                            const char = CHARACTERS[ct];
                            const taker = players.find(p => p.character === ct);
                            const isTaken = !!taker;
                            const canSelect = isUserTurn && !isTaken;

                            // King Ban Rule: Cannot pick King if you were King last round
                            const isBanned = ct === CharacterType.KING && currentPicker?.lastCharacter === CharacterType.KING;

                            return (
                                <div
                                    key={ct}
                                    onClick={() => canSelect && !isBanned && selectCharacter(ct)}
                                    className={`
                                    relative group transition-all duration-500
                                    ${isTaken || isBanned ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:-translate-y-2 cursor-pointer'}
                                `}
                                >
                                    {/* Card Body */}
                                    <div className={`
                                    aspect-[2/3] rounded-[1.5rem] overflow-hidden bg-slate-200 relative shadow-lg
                                    ${canSelect ? 'ring-4 ring-transparent group-hover:ring-teal-400 group-hover:shadow-teal-500/30' : ''}
                                `}>
                                        <img
                                            src={`/assets/thumb/${char.thumbnailPath || `${char.id}-thumb.jpg`}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            alt={char.name}
                                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x400?text=' + char.name)}
                                        />

                                        {/* Info Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-10">
                                            <h4 className="text-white font-black text-xl uppercase leading-none mb-1">{char.name}</h4>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md text-white uppercase
                                                ${char.difficulty === 'EASY' ? 'bg-emerald-500' : char.difficulty === 'HARD' ? 'bg-rose-500' : 'bg-amber-500'}`}>
                                                    {char.difficulty}
                                                </span>
                                                <i className="fa-solid fa-circle-info text-white/50 text-xs"></i>
                                            </div>
                                        </div>

                                        {/* Taken Overlay */}
                                        {isTaken && (
                                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white mb-2 border-2 border-slate-600">
                                                    <i className="fa-solid fa-check"></i>
                                                </div>
                                                <span className="text-white font-bold text-sm uppercase tracking-wider">{taker.name}</span>
                                            </div>
                                        )}

                                        {/* Selection Hover Effect */}
                                        {canSelect && (
                                            <div className="absolute inset-0 bg-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="bg-white text-teal-600 px-6 py-2 rounded-full font-black text-xs uppercase shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    Seleccionar
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen bg-slate-900 text-slate-200 font-sans selection:bg-amber-500/30 flex flex-col overflow-hidden">

            {/* Strategist Choice Modal */}
            {strategistPendingChoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-lg w-full shadow-2xl space-y-6">
                        <h2 className="text-2xl font-black text-amber-500 uppercase tracking-widest text-center">Decisión del Estratega</h2>
                        <p className="text-slate-300 text-center">
                            Has obtenido {strategistPendingChoice.type === 'RARE' ? '0 victorias' : '1 victoria'}.
                            <br />
                            ¿Qué prefieres para la siguiente ronda?
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    // Option A: Points
                                    setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, score: p.score + strategistPendingChoice.pointsObj } : p));
                                    addLog(`Estratega eligió ${strategistPendingChoice.pointsObj} puntos.`);
                                    setStrategistPendingChoice(null); // Close modal
                                    // Determine updated players for next step
                                    // Use functional update or ref logic? checkGameOver uses passed players. 
                                    // We need to pass the *updated* players to checkGameOver.
                                    // Accessing state 'players' inside this callback refers to current render closure? 
                                    // Yes. But we are inside App body, so 'players' is current.
                                    // BUT setPlayers updates asynchronously.
                                    // Workaround: Apply logic to a local copy then set.
                                    const updated = players.map(p => p.id === 'p1' ? { ...p, score: p.score + strategistPendingChoice.pointsObj } : p);
                                    performCheckGameOver(updated);
                                }}
                                className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 transition-all group"
                            >
                                <div className="text-3xl font-black text-amber-400 mb-2">+{strategistPendingChoice.pointsObj} PTS</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Aceptar Puntos</div>
                            </button>

                            <button
                                onClick={() => {
                                    // Option B: Card Inheritance
                                    const cardType = strategistPendingChoice.type;
                                    const cardToInherit: Card = {
                                        id: `inherited-${cardType}-${Date.now()}`,
                                        suit: cardType === 'BLACK7' ? Suit.BLACK : Suit.COLORLESS,
                                        value: cardType === 'BLACK7' ? 7 : 11, // Rare value is usually 11?
                                        type: cardType === 'BLACK7' ? CardType.NUMBER : CardType.RARE,
                                        ownerId: 'p1'
                                    };
                                    setStrategistInheritedCard(cardToInherit);
                                    addLog(`Estratega eligió llevarse la carta ${cardType === 'BLACK7' ? '7 Negro' : 'Rara'} a la siguiente ronda.`);
                                    setStrategistPendingChoice(null);
                                    performCheckGameOver(players); // Score didn't change
                                }}
                                className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 transition-all group"
                            >
                                <div className="text-3xl font-black text-purple-400 mb-2">{strategistPendingChoice.type === 'BLACK7' ? '7 NEGRO' : 'CARTA RARA'}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Obtener Carta (Próxima Ronda)</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">TT</div>
                    <h1 className="font-black text-xl tracking-tighter uppercase text-slate-800">Tricktakers <span className="text-teal-500">Digital</span></h1>
                </div>

                {phase === GamePhase.TRICK_PLAYING && (
                    <div className="flex gap-8 items-center">
                        <div className="text-center">
                            <span className="block text-[10px] font-black text-slate-400 uppercase">Ronda</span>
                            <span className="font-black text-lg">{round}/3</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-[10px] font-black text-slate-400 uppercase">Baza</span>
                            <span className="font-black text-lg text-teal-500">{trick}/5</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowLogs(!showLogs)}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${showLogs ? 'bg-teal-500 border-teal-600 text-white shadow-lg shadow-teal-500/20' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                    title="Ver Historial"
                >
                    <i className="fa-solid fa-list-ul text-sm"></i>
                </button>

                <button
                    onClick={resetGame}
                    className="ml-2 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-rose-600 hover:border-rose-700 transition-all shadow-lg shadow-slate-900/10"
                    title="Reiniciar al Menú Principal"
                >
                    <i className="fa-solid fa-arrow-rotate-left text-sm"></i>
                </button>
            </header>

            <main className="flex-1 relative overflow-hidden flex flex-col">
                {phase === GamePhase.MODE_SELECTION && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white overflow-y-auto">
                        <div className="max-w-2xl">
                            <h2 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter">EL TORNEO <br />COMIENZA AQUÍ</h2>
                            <p className="text-slate-500 text-lg mb-12 font-medium">Selecciona el nivel de desafío para tu partida.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button onClick={() => initGame(GameMode.BASIC)} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50/30 transition-all group text-left">
                                    <i className="fa-solid fa-seedling text-3xl text-teal-500 mb-4 group-hover:scale-110 transition-transform"></i>
                                    <h4 className="font-black text-xl mb-2">BÁSICO</h4>
                                    <p className="text-slate-500 text-xs">Personajes iniciales recomendados para aprender.</p>
                                </button>
                                <button onClick={() => initGame(GameMode.ADVANCED)} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50/30 transition-all group text-left">
                                    <i className="fa-solid fa-chess-knight text-3xl text-amber-500 mb-4 group-hover:scale-110 transition-transform"></i>
                                    <h4 className="font-black text-xl mb-2">AVANZADO</h4>
                                    <p className="text-slate-500 text-xs">Pool dinámico de personajes de la expansión.</p>
                                </button>
                                <button onClick={() => initGame(GameMode.ALL_STAR)} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-rose-500 hover:bg-rose-50/30 transition-all group text-left">
                                    <i className="fa-solid fa-crown text-3xl text-rose-500 mb-4 group-hover:scale-110 transition-transform"></i>
                                    <h4 className="font-black text-xl mb-2">ALL-STAR</h4>
                                    <p className="text-slate-500 text-xs">Todos los personajes disponibles desde el inicio.</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {phase === GamePhase.CHARACTER_SELECTION && renderSelection()}

                {phase === GamePhase.TRICK_PLAYING && (
                    <>
                        {/* --- ÁREA SUPERIOR: Scrollable (Rivales + Mesa) --- */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col">
                            {/* Oponentes (Rivales) */}
                            <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
                                {players.slice(1).map(p => (
                                    <PlayerBoard key={p.id} player={p} isCurrentPlayer={players[currentPlayerIdx].id === p.id} onCardPlay={() => { }} canPlay={false} onCharacterClick={() => setViewingCharacter(p.character)} />
                                ))}
                            </div>

                            {/* Mesa de Juego (Flexible) */}
                            <div className="flex-1 min-h-[250px] flex flex-col items-center justify-center relative my-4">
                                <div className={`absolute inset-0 bg-teal-50/30 rounded-[3rem] border-4 border-dashed border-teal-100 flex items-center justify-center transition-all ${isKakumei ? 'bg-rose-50/30 border-rose-100 rotate-180' : ''}`}>
                                    {playedCards.length === 0 && (
                                        <div className="text-center opacity-20 select-none">
                                            <i className={`fa-solid ${isKakumei ? 'fa-flag' : 'fa-shield'} text-8xl mb-4`}></i>
                                            <p className="font-black text-2xl uppercase tracking-widest">{isKakumei ? 'REVOLUCIÓN ACTIVA' : 'CAMPO DE BATALLA'}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 sm:gap-6 z-10 flex-wrap justify-center">
                                    {playedCards.map((c, idx) => (
                                        <div
                                            key={idx}
                                            className={`animate-in zoom-in slide-in-from-bottom-8 duration-500 cursor-pointer transition-transform ${selectedCards.includes(c.id) ? 'scale-110 -translate-y-4' : ''}`}
                                            onClick={() => {
                                                if (abilityMode === 'COLLECTOR_RESERVE') {
                                                    setSelectedCards(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [c.id]);
                                                }
                                            }}
                                        >
                                            <div className={`${selectedCards.includes(c.id) ? 'ring-4 ring-amber-500 rounded-2xl shadow-2xl shadow-amber-500/50' : ''}`}>
                                                <GameCard card={c} disabled={abilityMode !== 'COLLECTOR_RESERVE'} />
                                            </div>
                                            <div className="text-center mt-2 font-black text-[10px] uppercase text-slate-400">{players.find(p => p.id === c.ownerId)?.name}</div>
                                        </div>
                                    ))}
                                </div>

                                {leadSuit && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-xl flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Palo Líder</span>
                                        <div className={`w-3 h-3 rounded-full ${leadSuit === Suit.RED ? 'bg-rose-500' : leadSuit === Suit.BLUE ? 'bg-sky-500' : leadSuit === Suit.GREEN ? 'bg-teal-500' : 'bg-slate-900'}`}></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- ÁREA INFERIOR: Fija (Mano del Jugador + Acciones) --- */}
                        <div className="shrink-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative">

                            {/* Botones de Acción Flotantes (Action Bar) */}
                            {currentPlayerIdx === 0 && (
                                <div className="absolute bottom-full left-0 w-full flex justify-center pb-4 z-50 pointer-events-none">
                                    <div className="pointer-events-auto transform transition-transform hover:scale-105 origin-bottom">
                                        {getCharacterLogic(players[0].character).renderActions?.({
                                            player: players[0],
                                            abilityMode,
                                            setAbilityMode,
                                            selectedCards,
                                            setSelectedCards,
                                            performAction,
                                            isCurrentPlayer: true,
                                            round
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Tablero del Jugador Humano */}
                            <div className="max-w-7xl mx-auto p-2 sm:p-4">
                                <PlayerBoard
                                    player={players[0]}
                                    isCurrentPlayer={currentPlayerIdx === 0}
                                    onCardPlay={playCard}
                                    canPlay={currentPlayerIdx === 0}
                                    onCharacterClick={() => setViewingCharacter(players[0].character)}
                                    selectedCards={selectedCards}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Logs Side Panel */}
                {showLogs && phase !== GamePhase.MODE_SELECTION && (
                    <div className="w-80 bg-white border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300 fixed right-0 top-16 bottom-0 z-50 shadow-2xl">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Crónica del Torneo</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className={`text-xs font-medium leading-relaxed ${i === 0 ? 'text-teal-600 font-bold' : 'text-slate-500'}`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {phase === GamePhase.GAME_OVER && (() => {
                    // Priority 1: Instant Win (Score >= 900) - e.g. King with 5 wins
                    const instant = players.find(p => p.score >= 900);
                    let winner = instant ? { player: instant, reason: '¡Victoria Instantánea!' } : null;

                    // Priority 2: 2 Gold Crowns
                    if (!winner) {
                        const gold = players.find(p => p.goldCrowns >= 2);
                        if (gold) winner = { player: gold, reason: 'Maestro de Coronas Doradas (2)' };
                    }

                    // Priority 3: 3 Black Crowns
                    if (!winner) {
                        const black = players.find(p => p.blackCrowns >= 3);
                        if (black) winner = { player: black, reason: 'Rey de la Miseria (3 Coronas Negras)' };
                    }

                    // Priority 4: Max Score with Tie-Breaker (Hierarchy)
                    if (!winner) {
                        const hierarchy = [
                            CharacterType.KING,
                            CharacterType.GAMBLER,
                            CharacterType.RESISTANCE,
                            CharacterType.ADVENTURER,
                            CharacterType.HERMIT,
                            CharacterType.COLLECTOR,
                            CharacterType.BERSERKER,
                            CharacterType.RULER,
                            CharacterType.STRATEGIST,
                            CharacterType.SUMMONER, // Add others if needed
                        ];

                        const sorted = [...players].sort((a, b) => {
                            if (b.score !== a.score) return b.score - a.score;
                            // Tie-breaker
                            const idxA = hierarchy.indexOf(a.character!);
                            const idxB = hierarchy.indexOf(b.character!);
                            // Lower index = Higher priority
                            // If char not in list (e.g. basic), -1. Priority valid chars first.
                            if (idxA === -1) return 1;
                            if (idxB === -1) return -1;
                            return idxA - idxB;
                        });

                        // Variant checks (+350 or +150 diff) could go here too
                        winner = { player: sorted[0], reason: 'Victoria por Puntuación (y Jerarquía)' };
                    }

                    // Priority 1.5: Ruler Special Win (2+ Wins, No Color Cards)
                    // Check before Score if this is an "Instant Win" equivalent or high priority?
                    // Rules say "Instant Win". Let's put it high.
                    if (!winner || winner.reason === 'Victoria por Puntuación (y Jerarquía)') {
                        const ruler = players.find(p => p.character === CharacterType.RULER);
                        if (ruler) {
                            const hasColor = ruler.wonCards.some(c => c.suit !== Suit.COLORLESS);
                            if (ruler.wins >= 2 && !hasColor) {
                                winner = { player: ruler, reason: 'Tiranía Absoluta (2+ victorias sin cartas de color)' };
                            }
                        }
                    }

                    return (
                        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-8">
                            <div className="text-center max-w-lg">
                                <h2 className="text-7xl font-black text-white mb-4 tracking-tighter">FIN DEL TORNEO</h2>
                                <div className="bg-white/10 p-8 rounded-[3rem] border border-white/20 mb-8">
                                    <p className="text-teal-400 font-black text-2xl mb-2 uppercase">Ganador Absoluto</p>
                                    <h3 className="text-5xl font-black text-white mb-6 tracking-tight">
                                        {winner.player.name}
                                    </h3>
                                    <p className="text-white/60 mb-6">{winner.reason}</p>

                                    <div className="space-y-2">
                                        {players.sort((a, b) => b.score - a.score).map((p, i) => (
                                            <div key={p.id} className="flex justify-between items-center text-white/60 font-bold">
                                                <span>{i + 1}. {p.name} ({CHARACTERS[p.character!].name})</span>
                                                <div className="text-right">
                                                    <div className="text-white">{p.score} pts</div>
                                                    <div className="text-[9px] flex gap-1 justify-end">
                                                        {Array(p.goldCrowns).fill(0).map((_, i) => <i key={i} className="fa-solid fa-crown text-amber-400"></i>)}
                                                        {Array(p.blackCrowns).fill(0).map((_, i) => <i key={i} className="fa-solid fa-crown text-slate-900"></i>)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={resetGame} className="px-12 py-4 bg-teal-500 text-white rounded-full font-black text-xl hover:bg-teal-400 transition-all shadow-2xl shadow-teal-500/20">VOLVER A JUGAR</button>
                            </div>
                        </div>
                    );
                })()}
            </main>

            {viewingCharacter && (
                <CharacterModal character={CHARACTERS[viewingCharacter]} onClose={() => setViewingCharacter(null)} />
            )}

            {/* Adventurer Item Card Modal */}
            {itemCardToShow && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300"
                    onClick={() => setItemCardToShow(null)}
                >
                    <div className="relative max-w-sm w-full animate-in zoom-in duration-300">
                        <img
                            src={`/assets/3b-cards/${itemCardToShow}`}
                            className="w-full rounded-2xl shadow-2xl border-4 border-slate-700"
                            alt="Item Card"
                        />
                        <button className="absolute -top-4 -right-4 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white border-2 border-slate-700 shadow-xl">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Adventurer Setup Modal */}
            {abilityMode === 'ADVENTURER_SETUP' && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 max-w-2xl w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                            <span className="text-3xl">🎒</span> Preparación de Aventurero
                        </h2>
                        <p className="text-slate-300 mb-6">Elige tus 2 objetos iniciales para la partida:</p>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-red-400 mb-2 uppercase tracking-wider">Objeto Rojo</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {ITEMS.filter(i => i.type === 'RED').map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setAdvRed(item.id)}
                                            className={`p-3 rounded-lg border text-left transition-all ${advRed === item.id
                                                ? 'bg-red-900/50 border-red-500 ring-2 ring-red-500/50'
                                                : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                                        >
                                            <div className="font-bold text-white">{item.name}</div>
                                            <div className="text-xs text-slate-400 mt-1">{item.effect}</div>
                                            <div className="text-xs text-amber-500/80 mt-1">No usado: {item.unusedPoints} pts</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Objeto Azul</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {ITEMS.filter(i => i.type === 'BLUE').map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setAdvBlue(item.id)}
                                            className={`p-3 rounded-lg border text-left transition-all ${advBlue === item.id
                                                ? 'bg-blue-900/50 border-blue-500 ring-2 ring-blue-500/50'
                                                : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                                        >
                                            <div className="font-bold text-white">{item.name}</div>
                                            <div className="text-xs text-slate-400 mt-1">{item.effect}</div>
                                            <div className="text-xs text-amber-500/80 mt-1">No usado: {item.unusedPoints} pts</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <button
                                onClick={() => {
                                    if (advRed && advBlue) {
                                        performAction({ type: 'ADVENTURER_PICK_ITEMS', payload: { redItemId: advRed, blueItemId: advBlue } });
                                    }
                                }}
                                disabled={!advRed || !advBlue}
                                className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-colors
                                        ${advRed && advBlue
                                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                            >
                                Confirmar Equipo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Berserker Setup Modal */}
            {abilityMode === 'BERSERKER_SETUP' && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl border border-rose-900 p-8 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-black text-rose-500 mb-2 uppercase tracking-tighter italic">¡Modo Berserker Intimidante!</h2>
                            <p className="text-slate-400">Rechaza las cartas débiles de los mortales y toma tu Hacha.</p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => {
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
                                className="group relative px-8 py-4 bg-rose-600 hover:bg-rose-500 rounded-lg overflow-hidden transition-all shadow-[0_0_30px_rgba(225,29,72,0.6)] hover:shadow-[0_0_50px_rgba(225,29,72,0.8)]"
                            >
                                <div className="absolute inset-0 bg-[url('/assets/color-cards/berserker-cards/berserker-init.png')] opacity-20 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"></div>
                                <span className="relative text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <i className="fa-solid fa-hand-fist"></i> Descartar Mano
                                </span>
                            </button>
                        </div>
                        <p className="text-center text-rose-500/50 text-xs mt-6 uppercase font-bold tracking-widest">Solo los fuertes sobreviven</p>
                    </div>
                </div>
            )}

            {/* King Setup Modal */}
            {abilityMode === 'KING_SETUP' && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-start pt-20">
                    <div className="bg-amber-100 rounded-xl border-4 border-amber-500 p-6 px-12 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="text-center mb-4">
                            <h2 className="text-3xl font-black text-amber-600 mb-1 uppercase tracking-tighter">👑 Preparación Real: Descarta 1 Carta</h2>
                            <p className="text-amber-800 font-bold">Selecciona una carta para descartar</p>
                        </div>
                    </div>
                    {/* The hand is rendered below in the main UI, but we can overlay instructions or force interaction */}
                    {/* Render a special hand view here for discarding to ensure focus and clarity */}
                    <div className="mt-10 flex gap-4 max-w-4xl flex-wrap justify-center animate-in slide-in-from-bottom-10 duration-500">
                        {players.find(p => p.id === 'p1')?.hand.map(card => (
                            <GameCard
                                key={card.id}
                                card={card}
                                onClick={() => {
                                    setPlayers(prev => {
                                        const p1 = prev.find(p => p.id === 'p1')!;
                                        const newHand = p1.hand.filter(c => c.id !== card.id);
                                        return prev.map(p => p.id === 'p1' ? { ...p, hand: newHand } : p);
                                    });
                                    setAbilityMode('NONE');
                                    addLog(`Rey ha descartado ${card.suit} ${card.value}.`);
                                }}
                                selected={false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Strategist Choice Modal */}
            {
                strategistPendingChoice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-lg w-full shadow-2xl space-y-6">
                            <h2 className="text-2xl font-black text-amber-500 uppercase tracking-widest text-center">Decisión del Estratega</h2>
                            <p className="text-slate-300 text-center">
                                Has obtenido <span className="text-white font-bold">{strategistPendingChoice.type === 'RARE' ? '0 victorias' : '1 victoria'}</span>.
                                <br />
                                ¿Qué recompensa prefieres?
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        // Option A: Points
                                        const updated = players.map(p => p.id === 'p1' ? { ...p, score: p.score + strategistPendingChoice.pointsObj } : p);
                                        setPlayers(updated); // Sync state
                                        addLog(`Estratega eligió ${strategistPendingChoice.pointsObj} puntos.`);
                                        setStrategistPendingChoice(null);
                                        performCheckGameOver(updated);
                                    }}
                                    className="flex flex-col items-center justify-center p-6 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 hover:border-amber-500 transition-all group"
                                >
                                    <div className="text-3xl font-black text-amber-400 mb-2">+{strategistPendingChoice.pointsObj}</div>
                                    <div className="text-xs text-slate-400 group-hover:text-amber-200 uppercase tracking-wider font-bold">Puntos de Victoria</div>
                                </button>

                                <button
                                    onClick={() => {
                                        // Option B: Card Inheritance
                                        const cardType = strategistPendingChoice.type;
                                        const cardToInherit: Card = {
                                            id: `inherited-strat-${Date.now()}`,
                                            suit: cardType === 'BLACK7' ? Suit.BLACK : Suit.COLORLESS,
                                            value: cardType === 'BLACK7' ? 7 : 11,
                                            type: cardType === 'BLACK7' ? CardType.NUMBER : CardType.RARE,
                                            ownerId: 'p1'
                                        };
                                        setStrategistInheritedCard(cardToInherit);
                                        addLog(`Estratega reservó: ${cardType === 'BLACK7' ? '7 Negro' : 'Carta Rara'} para la siguiente ronda.`);
                                        setStrategistPendingChoice(null);
                                        performCheckGameOver(players);
                                    }}
                                    className="flex flex-col items-center justify-center p-6 bg-slate-700 hover:bg-slate-600 rounded-xl border border-slate-600 hover:border-purple-500 transition-all group"
                                >
                                    <div className="text-3xl font-black text-purple-400 mb-2">{strategistPendingChoice.type === 'BLACK7' ? '7' : 'R'}</div>
                                    <div className="text-xs text-slate-400 group-hover:text-purple-200 uppercase tracking-wider font-bold">{strategistPendingChoice.type === 'BLACK7' ? '7 Negro' : 'Carta Rara'}</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default App;
