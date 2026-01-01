import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Card, Suit, CharacterType, GamePhase, GameMode, CardType, Item, Trap } from './game/core/types';
import { CHARACTERS, ITEMS, TRAPS, BEASTS, TASKS } from './game/core/constants';
import { createDeck, getValidMoves, calculateAlchemyValue, determineWinner, getAiMove } from './game/core/gameLogic';
import { getCharacterLogic } from './logic/logic_Registry';
import { getScoringLogic } from './logic/scoring/scoring_Registry';
import { PhantomThiefLogic } from './logic/characters/logic_PhantomThief';
import PlayerBoard from './components/PlayerBoard';
import GameCard from './components/GameCard';
import CharacterModal from './components/CharacterModal';
import { useGameActions } from './useGameActions';
import { CharacterSelection } from './components/CharacterSelection';
import { LogsPanel } from './components/LogsPanel';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { AdventurerSetupModal } from './components/modals/AdventurerSetupModal';
import { BerserkerSetupModal } from './components/modals/BerserkerSetupModal';
import { RulerSetupModal } from './components/modals/RulerSetupModal';
import { PhantomThiefSetupModal } from './components/modals/PhantomThiefSetupModal';
import { StrategistModal } from './components/modals/StrategistModal';
import { determineTournamentWinner } from './game/core/gameLogic';

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
    const isResolvingRef = useRef(false);
    const isRoundResolvingRef = useRef(false);
    const [itemCardToShow, setItemCardToShow] = useState<Item | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [viewingRules, setViewingRules] = useState(false);

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
            if (rulerPlayer.id === 'p1') {
                setAbilityMode('RULER_SETUP');
            } else {
                // AI Ruler: Auto-Assign
                const availableTasks = [...TASKS].sort(() => Math.random() - 0.5);
                newPlayers = newPlayers.map(p => {
                    if (p.id !== rulerPlayer.id) {
                        const task = availableTasks.pop();
                        if (task) return { ...p, tasks: [task] };
                    }
                    return p;
                });
                addLog(`${rulerPlayer.name} (Gobernante) ha dictado sus leyes.`);
            }
        }

        // Phantom Thief Setup
        const thiefPlayer = newPlayers.find(p => p.character === CharacterType.PHANTOM_THIEF);
        if (thiefPlayer && thiefPlayer.id === 'p1') {
            setAbilityMode('PHANTOM_THIEF_SETUP');
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
        else if (p.character === CharacterType.RULER && p.tasks.length === 0) setAbilityMode('RULER_SETUP');
        else if (p.character === CharacterType.PHANTOM_THIEF && !p.thiefTargetIds) setAbilityMode('PHANTOM_THIEF_SETUP');
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
                // Modular Scoring Refactor
                const scoringLogic = getScoringLogic(p.character);
                const result = scoringLogic.getScore(p, round, updated);

                let pts = result.score;
                result.logs.forEach(msg => addLog(msg));

                // Special UI-related logic (cannot easily be in modular logic without passing setters)
                if (p.character === CharacterType.STRATEGIST && p.id === 'p1') {
                    if (p.wins === 0) setStrategistPendingChoice({ type: 'RARE', pointsObj: 50 });
                    else if (p.wins === 1) setStrategistPendingChoice({ type: 'BLACK7', pointsObj: 30 });
                }

                return {
                    ...p,
                    score: pts === 999 ? 999 : Math.max(0, p.score + pts),
                    magicElements: [],
                    tasks: [],
                    wonCards: [],
                    collectedCards: [],
                    bid: undefined,
                    betAmount: 0,
                    wonRevolutionTrick: false,
                    revoltUsed: false,
                    isKakumeiActive: false,
                    wins: 0
                };
            });

            // 2. Coronas
            const maxWins = Math.max(...updated.map(p => p.wins));
            let blackCrownsGiven = 0;
            updated = updated.map(p => {
                // Rule: Collector cannot get crowns
                if (p.character === CharacterType.COLLECTOR) return p;

                if (p.wins === maxWins && maxWins > 0) {
                    addLog(`${p.name} obtiene una Corona Dorada.`);
                    return { ...p, goldCrowns: p.goldCrowns + 1 };
                }

                // Resistance Special: 1 win (if Kakumei) counts for Black Crown
                const isResistanceBlackCrown = p.character === CharacterType.RESISTANCE && p.wins === 1 && p.wonRevolutionTrick;
                if ((p.wins === 0 || isResistanceBlackCrown) && blackCrownsGiven < 2) {
                    addLog(`${p.name} obtiene una Corona Negra.`);
                    blackCrownsGiven++;
                    return { ...p, blackCrowns: p.blackCrowns + 1 };
                }
                return p;
            });

            // 3. Phantom Thief Stealing Logic (After Crowns Assigned)
            updated = PhantomThiefLogic.resolveSteal(updated, addLog);
            updated = PhantomThiefLogic.resolveBonus(updated, addLog);

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
                    // Reset per-trick flags
                    const resetFlags = {
                        hermitUsedAbility: false,
                        adventurerUsedItem: false,
                        gamblerUsedAbility: false
                    };
                    // Strategist Pool Collection
                    if (p.character === CharacterType.STRATEGIST && trapPool > 0) {
                        bonus = trapPool;
                        addLog(`¡Estratega reclama el Pozo! (+${bonus} pts)`);
                        setTrapPool(0);
                    }

                    // Resistance Bonus: +30 for every trick won in Kakumei/Revolt
                    if (p.character === CharacterType.RESISTANCE && (isKakumei || isRevolt)) {
                        bonus += 30;
                        addLog(`La Resistencia gana 30 pts extra por victoria en Revolución.`);
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
                                ...resetFlags,
                                collectedCards: [...p.collectedCards, reservedCard],
                                reservedCardId: null
                            };
                        }
                    }
                    return { ...p, ...resetFlags };
                }
            }));

            // Character-Specific Post-Win Logic
            const winnerP = players[winnerIdx];
            if (winnerP) {
                // Alchemist Element: Win the trick
                if (winnerP.character === CharacterType.ALCHEMIST) {
                    setPlayers(prev => prev.map(p => p.id === winnerId ? {
                        ...p,
                        magicElements: [...(p.magicElements || []), 'TRICK_WIN']
                    } : p));
                    addLog("Alquimista: Obtuvo elemento por ganar la baza.");
                }

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

            // Character Logic Resets (Baza a Baza)
            setPlayers(prev => prev.map(p => ({
                ...p,
                adventurerUsedItem: false,
                pendingItemEffect: null
            })));

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
        setAbilityMode, playedCards, setPlayedCards, setLeadSuit, leadSuit, setCurrentPlayerIdx,
        trickStarterIdx, setIsKakumei, addLog, resolveTrick, currentPlayerIdx,
        isResolvingRef, trick, setItemCardToShow
    });
    const playCard = (cardId: string) => {
        if (isResolvingRef.current) return;
        const p = players[currentPlayerIdx];
        const isUser = p.id === 'p1';
        const isKingDiscardPhase = p.character === CharacterType.KING && p.hand.length > 5;

        const isGamblerSwapPhase = p.character === CharacterType.GAMBLER && (p.gambleSwaps || 0) > 0 && p.bid === undefined;

        // Allow selection if in specific Ability Mode OR it's King's setup discard phase OR Gambler Swap
        if (isUser && (['ALCHEMIST_SELECT', 'GAMBLER_SWAP', 'KING_DISCARD', 'HERMIT_DISCARD'].includes(abilityMode) || isKingDiscardPhase || isGamblerSwapPhase)) {
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

        if (playedCards.length === 0 && card.suit !== Suit.COLORLESS) {
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
    // Turnos de la IA - ROBUST FIX
    useEffect(() => {
        if (phase === GamePhase.TRICK_PLAYING && currentPlayerIdx !== 0 && !isResolvingRef.current && abilityMode === 'NONE') {
            const timer = setTimeout(() => {
                try {
                    const p = players[currentPlayerIdx];
                    const moveId = getAiMove(p, leadSuit, playedCards);
                    if (moveId) playCard(moveId);
                    else {
                        // FALLBACK: Play first valid card if AI Logic returns null
                        console.warn("AI returned no move. Using fallback.");
                        const valid = getValidMoves(p.hand, leadSuit);
                        if (valid.length > 0) playCard(valid[0].id);
                        else {
                            // Should not happen, but prevents perma-freeze
                            addLog(`Error: ${p.name} no tiene cartas válidas.`);
                        }
                    }
                } catch (e) {
                    console.error("AI Turn Error:", e);
                    // Emergency Fallback
                    const p = players[currentPlayerIdx];
                    const valid = getValidMoves(p.hand, leadSuit);
                    if (valid.length > 0) playCard(valid[0].id);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentPlayerIdx, phase, abilityMode, players, leadSuit, playedCards]);


    return (
        <div
            className="min-h-[100dvh] md:h-[100dvh] text-slate-800 font-sans selection:bg-teal-500/30 flex flex-col overflow-x-hidden bg-cover bg-center"
            style={{
                backgroundColor: '#B9DED1',
                backgroundImage: `url('/assets/bg-pattern.png')`,
                backgroundBlendMode: 'overlay', // Optional: blends color with pattern
                backgroundSize: 'cover' // Or 'auto' if it's a tile
            }}
        >

            {/* Strategist Choice Modal */}
            <StrategistModal
                choice={strategistPendingChoice}
                onChoosePoints={(pts) => {
                    setPlayers(prev => prev.map(p => p.id === 'p1' ? { ...p, score: p.score + pts } : p));
                    addLog(`Estratega eligió ${pts} puntos.`);
                    setStrategistPendingChoice(null);
                    const updated = players.map(p => p.id === 'p1' ? { ...p, score: p.score + pts } : p);
                    performCheckGameOver(updated);
                }}
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
                    performCheckGameOver(players);
                }}
            />

            {/* Header */}
            <header className="px-6 pt-10 pb-4 md:py-4 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <img src="/assets/logo/logo.svg" alt="Tricktakers Logo" className="h-10 w-auto" />
                </div>

                <div className="flex items-center gap-4">
                    {phase === GamePhase.TRICK_PLAYING && (
                        <div className="hidden sm:flex gap-6 items-center bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                            <div className="text-center">
                                <span className="block text-[8px] font-black text-slate-400 uppercase">Ronda</span>
                                <span className="font-black text-xs">{round}/3</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-[8px] font-black text-slate-400 uppercase">Baza</span>
                                <span className="font-black text-xs text-teal-500">{trick}/5</span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetGame}
                            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-rose-600 transition-all"
                            title="Reiniciar"
                        >
                            <i className="fa-solid fa-arrow-rotate-left text-sm"></i>
                        </button>

                        <button
                            onClick={() => setShowLogs(!showLogs)}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${showLogs ? 'bg-teal-500 text-white' : 'bg-white text-slate-600'}`}
                            title="Log"
                        >
                            <i className="fa-solid fa-list-ul text-sm"></i>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden flex flex-col">
                {phase === GamePhase.MODE_SELECTION && (
                    <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-8 text-center bg-white overflow-y-auto custom-scrollbar">
                        <div className="max-w-2xl py-12">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">EL TORNEO <br />COMIENZA AQUÍ</h2>
                            <p className="text-slate-500 text-base md:text-lg mb-12 font-medium">Selecciona el nivel de desafío para tu partida.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button onClick={() => initGame(GameMode.BASIC)} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50/30 transition-all group text-left">
                                    <i className="fa-solid fa-seedling text-3xl text-teal-500 mb-4 group-hover:scale-110 transition-transform"></i>
                                    <h4 className="font-white text-xl mb-2">BÁSICO</h4>
                                    <p className="text-slate-500 text-xs">Personajes iniciales recomendados para aprender.</p>
                                </button>
                                <button onClick={() => initGame(GameMode.ADVANCED)} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50/30 transition-all group text-left">
                                    <i className="fa-solid fa-chess-knight text-3xl text-amber-500 mb-4 group-hover:scale-110 transition-transform"></i>
                                    <h4 className="font-white text-xl mb-2">AVANZADO</h4>
                                    <p className="text-slate-500 text-xs">Pool dinámico de personajes de la expansión.</p>
                                </button>
                                <button onClick={() => initGame(GameMode.ALL_STAR)} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 hover:border-rose-500 hover:bg-rose-50/30 transition-all group text-left">
                                    <i className="fa-solid fa-crown text-3xl text-rose-500 mb-4 group-hover:scale-110 transition-transform"></i>
                                    <h4 className="font-white text-xl mb-2">ALL-STAR</h4>
                                    <p className="text-slate-500 text-xs">Todos los personajes disponibles desde el inicio.</p>
                                </button>
                            </div>

                            {/* Rulebooks Button */}
                            <div className="mt-8">
                                <button
                                    onClick={() => setViewingRules(true)}
                                    className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-500 font-bold uppercase text-xs tracking-widest hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <i className="fa-solid fa-book-open"></i> Manuales de Juego
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rulebooks Modal */}
                {viewingRules && (
                    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setViewingRules(false)}>
                        <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Manuales de Reglas</h3>
                                <button onClick={() => setViewingRules(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                            <p className="text-slate-500 text-sm">Consulta las reglas oficiales para resolver tus dudas.</p>

                            <div className="grid grid-cols-1 gap-4">
                                <a
                                    href="/rules/Tricktakers_Base_Rulebook_copia.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                                        <i className="fa-solid fa-book text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 group-hover:text-teal-700">Tricktakers Base</div>
                                        <div className="text-xs text-slate-400">Reglas fundamentales y personajes básicos.</div>
                                    </div>
                                    <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-slate-300 group-hover:text-teal-500"></i>
                                </a>

                                <a
                                    href="/rules/tricktakers_ex_rules_en_copia.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                        <i className="fa-solid fa-scroll text-xl"></i>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 group-hover:text-amber-700">Expansión (Inglés)</div>
                                        <div className="text-xs text-slate-400">Nuevos personajes y mecánicas avanzadas.</div>
                                    </div>
                                    <i className="fa-solid fa-arrow-up-right-from-square ml-auto text-slate-300 group-hover:text-amber-500"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {phase === GamePhase.CHARACTER_SELECTION && (
                    <CharacterSelection
                        players={players}
                        selectionOrder={selectionOrder}
                        selectionIndex={selectionIndex}
                        characterPool={characterPool}
                        selectCharacter={selectCharacter}
                    />
                )}

                {phase === GamePhase.TRICK_PLAYING && (
                    <>
                        {/* --- ÁREA SUPERIOR: Scrollable (Rivales + Mesa) --- */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col">
                            {/* Oponentes (Rivales) */}
                            <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
                                {players.slice(1).map(p => (
                                    <PlayerBoard key={p.id} player={p} isCurrentPlayer={players[currentPlayerIdx].id === p.id} onCardPlay={() => { }} canPlay={false} onCharacterClick={() => setViewingCharacter(p.character)} onItemClick={setItemCardToShow} />
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
                                                const p = players[0];
                                                const isGamblerSwap = p.character === CharacterType.GAMBLER && (p.gambleSwaps || 0) > 0 && p.bid === undefined;

                                                if (abilityMode === 'COLLECTOR_RESERVE' || isGamblerSwap) {
                                                    setSelectedCards(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]);
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
                                    onItemClick={setItemCardToShow}
                                    selectedCards={selectedCards}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Logs Side Panel */}
                {showLogs && phase !== GamePhase.MODE_SELECTION && (
                    <LogsPanel logs={logs} onClose={() => setShowLogs(false)} />
                )}

                {phase === GamePhase.GAME_OVER && (
                    <GameOverScreen
                        result={determineTournamentWinner(players)}
                        players={players}
                        onReset={resetGame}
                    />
                )}
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

            {/* Ruler Setup Modal */}
            {abilityMode === 'RULER_SETUP' && (
                <RulerSetupModal
                    otherPlayers={players.filter(p => p.id !== 'p1')}
                    onConfirm={(assignments) => performAction('RULER_ASSIGN_TASKS', assignments)}
                />
            )}

            {/* Phantom Thief Setup Modal */}
            {abilityMode === 'PHANTOM_THIEF_SETUP' && (
                <PhantomThiefSetupModal
                    onConfirm={(suits) => performAction('PHANTOM_THIEF_SETUP', suits)}
                />
            )}

        </div>
    );
};

export default App;
