
import React from 'react';

export enum Suit {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  BLACK = 'BLACK',
  COLORLESS = 'COLORLESS'
}

export enum CardType {
  NUMBER = 'NUMBER',
  RARE = 'RARE',
  WHITE_FLAG = 'WHITE_FLAG',
  BERSERKER = 'BERSERKER',
  SUMMONED_BEAST = 'SUMMONED_BEAST'
}

export interface Card {
  id: string;
  suit: Suit;
  value: number;
  type: CardType;
  ownerId?: string;
  isFacedown?: boolean;
  combinedCards?: Card[];
  imagePath?: string;
  name?: string;
}

export enum CharacterType {
  KING = '1A',
  STRATEGIST = '1C',
  GAMBLER = '2A',
  SUMMONER = '2C',
  NINJA = '2D',
  RESISTANCE = '3A',
  ADVENTURER = '3B',
  ALCHEMIST = '3C',
  SAMURAI = '3D',
  HERMIT = '4A',
  COLLECTOR = '4B',
  TIME_TRAVELER = '4C',
  BERSERKER = '5A',
  RULER = '5B',
  PHANTOM_THIEF = '5C'
}

export interface CharacterData {
  id: CharacterType;
  name: string;
  catchphrase: string;
  difficulty: string;
  description: string;
  abilityName: string;
  pointsByWins: Record<number, number>;
  winConditionText?: string;
  imagePath: string;
  thumbnailPath?: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'RED' | 'BLUE' | 'GOLD';
  description: string;
  effect: string;
  unusedPoints: number;
  imagePath: string;
  itemCardPath?: string;
}

export interface Beast {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  active: boolean;
  suit?: Suit; // Para bestias de color
}

export interface Task {
  id: string;
  name: string;
  difficulty: 'NORMAL' | 'HARD' | 'DIFFICULT';
  description: string;
  points: number;
  condition: (player: Player) => boolean;
}

export interface Trap {
  id: string;
  name: string;
  description: string;
  color: string;
  condition: (card: Card, leadSuit: Suit | null) => boolean;
}

export interface Player {
  id: string;
  name: string;
  character: CharacterType | null;
  lastCharacter?: CharacterType | null;
  hand: Card[];
  wonCards: Card[];
  score: number;
  goldCrowns: number;
  blackCrowns: number;
  wins: number;

  // Character Specific
  bid?: number;
  betAmount?: number;
  items: Item[];
  tasks: Task[];
  mp: number;
  beasts: Beast[];
  rearBeasts: string[]; // IDs de bestias en el banquillo
  frontBeastId?: string | null; // ID de bestia en combate activo
  magicElements: string[];
  reservedCardId?: string | null;
  rulerUsedRuleAvoidance?: boolean;
  gambleSwaps?: number;
  revoltUsed?: boolean;
  isKakumeiActive?: boolean;
  hermitUsedAbility?: boolean;
  gamblerUsedAbility?: boolean;
  berserkerUsedRound3?: boolean;
  strategistUsedIgnore?: boolean;
  wonRevolutionTrick?: boolean;
  revoltsLeft?: number;
  itemSlots?: number;
  pendingItemEffect?: string | null;
  collectedCards: Card[];
  timeTravelTokens: number;
  timeTravelPredictions: string[];
  // Group 4
  berserkerDeck?: Card[];
  thiefPartnerId?: string | null;
  thiefTargetIds?: string[];
  thiefChipValue?: number; // 0 or 1 (represented as ±1)
  thiefBetrayalMode?: boolean;
  tasksAssigned?: Record<string, string[]>;
}

export interface PlayerRoundResult {
  playerId: string;
  playerName: string;
  character: CharacterType | null;
  tricksWon: number;
  pointsGained: number;
  totalScore: number;
  goldCrownsGained: number;
  blackCrownsGained: number;
}

export interface RoundResult {
  round: number;
  playerResults: PlayerRoundResult[];
}

export enum GamePhase {
  MODE_SELECTION = 'MODE_SELECTION',
  CHARACTER_SELECTION = 'CHARACTER_SELECTION',
  SETUP = 'SETUP',
  TRICK_PLAYING = 'TRICK_PLAYING',
  ROUND_END = 'ROUND_END',
  ROUND_SUMMARY = 'ROUND_SUMMARY',
  GAME_OVER = 'GAME_OVER'
}

export enum GameMode {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
  ALL_STAR = 'ALL_STAR'
}

export interface SetupContext {
  deck: Card[];
  playerId: string;
  round: number;
  players: Player[];
}

export interface PowerContext {
  card: Card;
  leadSuit: Suit | null;
  isRevolt: boolean;
  isKakumei: boolean;
  trickContainsRare: boolean;
  onesInSuits: Suit[]; // Suits that have a '1' in the current trick
  berserker10Suits: Suit[]; // Suits that have a Berserker 10 in the trick
  berserkerMainInPlay: boolean; // Whether the Berserker Main card is in the trick
  whiteFlagInPlay: boolean;
  hermitInPlay: boolean;
  berserkerInPlay: boolean;
  player: Player;
}

export interface UIContext {
  player: Player;
  abilityMode: string;
  setAbilityMode: (mode: string) => void;
  selectedCards: string[];
  setSelectedCards: React.Dispatch<React.SetStateAction<string[]>>;
  performAction: (actionName: string, payload?: any) => void;
  isCurrentPlayer: boolean;
  round: number;
}
