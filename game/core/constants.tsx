
import React from 'react';
import { CharacterType, CharacterData, Suit, Item, Task, Trap, Beast } from './types';

export const CHARACTERS: Record<CharacterType, CharacterData> = {
  [CharacterType.KING]: {
    id: CharacterType.KING, name: 'King', catchphrase: 'The royal road is the right road', difficulty: 'EASY',
    description: 'Starts with the King Rare card. Scores double points in the final round.',
    abilityName: 'Kings Privilege', pointsByWins: { 0: 0, 1: 20, 2: 50, 3: 80, 4: 120, 5: 999 },
    winConditionText: '5 Wins', imagePath: '1A.webp', thumbnailPath: '1A-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/1A-no-bg.png'
  },
  [CharacterType.STRATEGIST]: {
    id: CharacterType.STRATEGIST, name: 'Strategist', catchphrase: 'To see the big picture', difficulty: 'DIFFICULT',
    description: 'Use Trap Cards to penalize others. Exclusive Black 7 card.',
    abilityName: 'Strategize', pointsByWins: { 0: 50, 1: 30, 2: -50, 3: 50, 4: 80, 5: 999 },
    winConditionText: '5 Wins', imagePath: '1C.webp', thumbnailPath: '1C-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/1C-no-bg.png'
  },
  [CharacterType.GAMBLER]: {
    id: CharacterType.GAMBLER, name: 'Gambler', catchphrase: "It's not luck, it's guidance", difficulty: 'MODERATE',
    description: 'Bid on wins. Discard/Draw to fix hand.',
    abilityName: 'Gamble', pointsByWins: { 0: 30, 1: 60, 2: 90, 3: 150, 4: 999, 5: 999 },
    winConditionText: '4 Wins (if bid 4) or 5 Wins', imagePath: '2A.webp', thumbnailPath: '2A-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/2A-no-bg.png'
  },
  [CharacterType.SUMMONER]: {
    id: CharacterType.SUMMONER, name: 'Summoner', catchphrase: 'Come order, come chaos', difficulty: 'HARD',
    description: 'Summon beasts (EL, MIRIA, etc.) to modify rules using MP.',
    abilityName: 'Summon', pointsByWins: { 0: -20, 1: 20, 2: 40, 3: 70, 4: 100, 5: 999 },
    winConditionText: '5 Wins', imagePath: '2C.webp', thumbnailPath: '2C-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/2C-no-bg.png'
  },
  [CharacterType.NINJA]: {
    id: CharacterType.NINJA, name: 'Ninja', catchphrase: "I'm nowhere!", difficulty: 'MODERATE',
    description: 'Play cards Face Down (Shadow Cloning). High risk.',
    abilityName: 'Shadow Cloning', pointsByWins: { 0: 70, 1: -20, 2: 70, 3: -20, 4: 140, 5: 999 },
    winConditionText: '5 Wins', imagePath: '2D.webp', thumbnailPath: '2D-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/2D-no-bg.png'
  },
  [CharacterType.RESISTANCE]: {
    id: CharacterType.RESISTANCE, name: 'Resistance', catchphrase: 'Opportunity always comes', difficulty: 'MODERATE',
    description: 'Win with low cards (Revolt). Revolution (Kakumei) reverses strength.',
    abilityName: 'Kakumei', pointsByWins: { 0: 0, 1: 30, 2: 60, 3: 90, 4: 120, 5: 150 },
    imagePath: '3A.webp', thumbnailPath: '3A-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/3A-no-bg.png'
  },
  [CharacterType.ADVENTURER]: {
    id: CharacterType.ADVENTURER, name: 'Adventurer', catchphrase: "Don't let luck be your friend", difficulty: 'DIFFICULT',
    description: 'Use Items. Gain points for unused items.',
    abilityName: 'Using Items', pointsByWins: { 0: 20, 1: 10, 2: 20, 3: 40, 4: 60, 5: 999 },
    winConditionText: '5 Wins', imagePath: '3B.webp', thumbnailPath: '3B-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/3B-no-bg.png'
  },
  [CharacterType.ALCHEMIST]: {
    id: CharacterType.ALCHEMIST, name: 'Alchemist', catchphrase: 'Because the law is the truth', difficulty: 'HARD',
    description: 'Play 3 cards at once. Form Magic Circles for points/Crowns.',
    abilityName: 'Alchemy', pointsByWins: { 0: 0, 1: 20, 2: 40, 3: 60, 4: 80, 5: 120 },
    imagePath: '3C.webp', thumbnailPath: '3C-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/3C-no-bg.png'
  },
  [CharacterType.SAMURAI]: {
    id: CharacterType.SAMURAI, name: 'Samurai', catchphrase: 'To master is to discard', difficulty: 'MODERATE',
    description: 'Red cards are as strong as Black. Discard Black to draw.',
    abilityName: 'Spirit of Red', pointsByWins: { 0: 0, 1: 30, 2: 80, 3: 120, 4: 999, 5: -100 },
    winConditionText: '4 Wins', imagePath: '3D.webp', thumbnailPath: '3D-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/3D-no-bg.png'
  },
  [CharacterType.HERMIT]: {
    id: CharacterType.HERMIT, name: 'Hermit', catchphrase: 'Evil ways are also ways', difficulty: 'EASY',
    description: 'White Flag beats Rare. Draw/Discard action.',
    abilityName: 'Dexterous Hand', pointsByWins: { 0: 50, 1: -10, 2: -30, 3: 70, 4: 100, 5: 999 },
    winConditionText: '5 Wins', imagePath: '4A.webp', thumbnailPath: '4A-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/4A-no-bg.png'
  },
  [CharacterType.COLLECTOR]: {
    id: CharacterType.COLLECTOR, name: 'Collector', catchphrase: 'Looking for romance', difficulty: 'MODERATE',
    description: 'Reserve cards. Score for sets (Flush, Straight, etc.).',
    abilityName: 'Reservation', pointsByWins: { 0: 0, 1: 20, 2: 40, 3: 60, 4: 80, 5: 120 },
    winConditionText: '9 Card Straight Flush', imagePath: '4B.webp', thumbnailPath: '4B-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/4B-no-bg.png'
  },
  [CharacterType.TIME_TRAVELER]: {
    id: CharacterType.TIME_TRAVELER, name: 'Time Traveler', catchphrase: "I'm ready to change...", difficulty: 'DIFFICULT',
    description: 'Rewind time or Change the Past. Predict winners.',
    abilityName: 'Time Travel', pointsByWins: { 0: 30, 1: 60, 2: 90, 3: 120, 4: 180, 5: 300 },
    imagePath: '4C.webp', thumbnailPath: '4C-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/4C-no-bg.png'
  },
  [CharacterType.BERSERKER]: {
    id: CharacterType.BERSERKER, name: 'Berserker', catchphrase: 'Rooooar!!', difficulty: 'EASY',
    description: 'Strongest 10s. Weakest to 1s. Win with 0 tricks.',
    abilityName: 'Fierce Uplifting', pointsByWins: { 0: -30, 1: -10, 2: 30, 3: 50, 4: 80, 5: -50 },
    winConditionText: '0 Wins', imagePath: '5A.webp', thumbnailPath: '5A-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/5A-no-bg.png'
  },
  [CharacterType.RULER]: {
    id: CharacterType.RULER, name: 'Ruler', catchphrase: 'Challenges open the way', difficulty: 'MODERATE',
    description: 'Give tasks to players. Avoid rules with tokens.',
    abilityName: 'Giving Tasks', pointsByWins: { 0: 0, 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 },
    winConditionText: '2+ Wins (No R/B/G)', imagePath: '5B.webp', thumbnailPath: '5B-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/5B-no-bg.png'
  },
  [CharacterType.PHANTOM_THIEF]: {
    id: CharacterType.PHANTOM_THIEF, name: 'Phantom Thief', catchphrase: 'Having fun?', difficulty: 'HARD',
    description: 'Exchange cards via Notice Letters. Steal crowns.',
    abilityName: 'Art of Theft', pointsByWins: { 0: 0, 1: -20, 2: 50, 3: -50, 4: 100, 5: 999 },
    winConditionText: '5 Wins', imagePath: '5C.webp', thumbnailPath: '5C-thumb.jpg', summaryThumbnailPath: '/assets/chars-no-bg/5C-no-bg.png'
  }
};

export const ITEMS: Item[] = [
  { id: 'it-1', name: 'Map of Destiny', type: 'BLUE', description: 'Discard X cards, draw X cards.', effect: 'DRAW_X', unusedPoints: 10, imagePath: 'map.webp', itemCardPath: '/assets/3b-cards/01-map-of-destiny.jpg' },
  { id: 'it-2', name: 'Invisibility Potion', type: 'BLUE', description: 'Play your card facedown.', effect: 'FACEDOWN', unusedPoints: 10, imagePath: 'potion.webp', itemCardPath: '/assets/3b-cards/02-invisibility-potion.jpg' },
  { id: 'it-3', name: 'Timid Boots', type: 'BLUE', description: 'Play last in the trick.', effect: 'PLAY_LAST', unusedPoints: 10, imagePath: 'boots.webp', itemCardPath: '/assets/3b-cards/03-timid-boots.jpg' },
  { id: 'it-4', name: 'Miracle Sword', type: 'RED', description: 'Value ± 5 (Min 1, Max 9).', effect: 'VALUE_MODIFY', unusedPoints: -30, imagePath: 'sword.webp', itemCardPath: '/assets/3b-cards/04-miracle-sword.jpg' },
  { id: 'it-5', name: 'Ruler\'s Wand', type: 'RED', description: 'Card becomes color of lead suit.', effect: 'COLOR_SHIFT', unusedPoints: -30, imagePath: 'wand.webp', itemCardPath: '/assets/3b-cards/05-ruler-wand.jpg' },
  { id: 'it-6', name: 'Berserker\'s Axe', type: 'RED', description: 'Value becomes 10 (Loses to 1).', effect: 'FIX_10', unusedPoints: -30, imagePath: 'axe.webp', itemCardPath: '/assets/3b-cards/06-berserker-axe.jpg' },
  { id: 'it-7', name: 'Golden Treasure', type: 'GOLD', description: 'Immediately gain 30 points.', effect: 'GAIN_30', unusedPoints: 0, imagePath: '', itemCardPath: '/assets/3b-cards/07-golden-treasure.jpg' },
  { id: 'it-8', name: 'Hermit\'s Secret Book', type: 'BLUE', description: 'Played card stays hidden.', effect: 'STAY_HIDDEN', unusedPoints: 10, imagePath: '', itemCardPath: '/assets/3b-cards/08-hermit-book-of-secrets.jpg' },
  { id: 'it-9', name: 'White Orb', type: 'BLUE', description: 'Treat as Colorless/White Flag.', effect: 'WHITE_FLAG', unusedPoints: 10, imagePath: '', itemCardPath: '/assets/3b-cards/09-white-orb.jpg' },
  { id: 'it-10', name: 'Proactive Wing', type: 'BLUE', description: 'Pass lead to next player.', effect: 'PASS_LEAD', unusedPoints: 10, imagePath: '', itemCardPath: '/assets/3b-cards/10-proactive-wing.jpg' },
  { id: 'it-11', name: 'Crystal', type: 'GOLD', description: 'Initial bonus +20 points.', effect: 'GAIN_20', unusedPoints: 0, imagePath: '', itemCardPath: '/assets/3b-cards/11-crystal.jpg' },
  { id: 'it-12', name: 'Fairy Mischief', type: 'RED', description: 'Draw 1, Discard Item.', effect: 'DRAW_DISCARD', unusedPoints: -30, imagePath: '', itemCardPath: '/assets/3b-cards/12-fairy-mischief.jpg' },
  { id: 'it-13', name: 'Dragon Doll', type: 'RED', description: 'Win ties.', effect: 'WIN_TIES', unusedPoints: -30, imagePath: '', itemCardPath: '/assets/3b-cards/13-dragon-doll.jpg' },
  { id: 'it-14', name: 'Castle Visit', type: 'RED', description: 'Change number to 10.', effect: 'CHANGE_10', unusedPoints: -30, imagePath: '', itemCardPath: '/assets/3b-cards/14-castle-visit.jpg' },
  { id: 'it-15', name: 'Rock Crystal', type: 'GOLD', description: 'Initial bonus +30 points.', effect: 'GAIN_30', unusedPoints: 0, imagePath: '', itemCardPath: '/assets/3b-cards/15-rock-crystal.jpg' }
];

export const BEASTS: Beast[] = [
  { id: 'b-el', name: 'EL', description: 'Rear: +1 MP/turno. Front: Bandera Blanca.', mpCost: 4, active: false },
  { id: 'b-miria', name: 'MIRIA', description: 'Rear: 10 no pierde contra 1. Front: Berserker.', mpCost: 3, active: false },
  { id: 'b-maru', name: 'MARU', description: 'Front: Rojo 10.', mpCost: 1, active: false, suit: Suit.RED },
  { id: 'b-guru', name: 'GURU', description: 'Front: Azul 10.', mpCost: 1, active: false, suit: Suit.BLUE },
  { id: 'b-nemu', name: 'NEMU', description: 'Front: Verde 10.', mpCost: 1, active: false, suit: Suit.GREEN },
  { id: 'b-oko', name: 'OKO', description: 'Front: Negro 10.', mpCost: 1, active: false, suit: Suit.BLACK },
];

export const TRAPS: Trap[] = [
  {
    id: 'trap-1', name: 'Must Follow', description: 'If you do not follow suit, pay 10 pts.', color: 'text-rose-500',
    condition: (card, leadSuit) => leadSuit !== null && card.suit !== leadSuit && card.suit !== Suit.COLORLESS
  },
  {
    id: 'trap-2', name: 'High Numbers', description: 'If you play 7, 8, or 9, pay 10 pts.', color: 'text-blue-500',
    condition: (card) => card.type !== 'RARE' && card.value >= 7
  },
  {
    id: 'trap-3', name: 'Low Numbers', description: 'If you play 1-6, pay 10 pts.', color: 'text-emerald-500',
    condition: (card) => card.type !== 'WHITE_FLAG' && card.value >= 1 && card.value <= 6
  },
  {
    id: 'trap-4', name: 'Black Card', description: 'If you play a Black card, pay 10 pts.', color: 'text-slate-600',
    condition: (card) => card.suit === Suit.BLACK
  }
];

export const TASKS: Task[] = [
  // Normal
  { id: 'task-take-1', name: 'Take a 1', difficulty: 'NORMAL', points: 10, description: 'Win at least one "1" card.', condition: (p) => p.wonCards.some(c => c.value === 1), imagePath: '/assets/5b-ruler-tasks/normal-take-1.jpg' },
  { id: 'task-take-10', name: 'Take a 10', difficulty: 'NORMAL', points: 10, description: 'Win at least one "10" card.', condition: (p) => p.wonCards.some(c => c.value === 10), imagePath: '/assets/5b-ruler-tasks/normal-take-10.jpg' },
  { id: 'task-take-black', name: 'Take Black', difficulty: 'NORMAL', points: 10, description: 'Win at least one Black card.', condition: (p) => p.wonCards.some(c => c.suit === Suit.BLACK), imagePath: '/assets/5b-ruler-tasks/normal-take-black.jpg' },
  { id: 'task-no-blue', name: 'No Blue', difficulty: 'NORMAL', points: 10, description: 'Do not win any Blue cards.', condition: (p) => !p.wonCards.some(c => c.suit === Suit.BLUE), imagePath: '/assets/5b-ruler-tasks/normal-not-take-blue.jpg' },
  { id: 'task-no-green', name: 'No Green', difficulty: 'NORMAL', points: 10, description: 'Do not win any Green cards.', condition: (p) => !p.wonCards.some(c => c.suit === Suit.GREEN), imagePath: '/assets/5b-ruler-tasks/normal-not-take-green.jpg' },
  { id: 'task-no-red', name: 'No Red', difficulty: 'NORMAL', points: 10, description: 'Do not win any Red cards.', condition: (p) => !p.wonCards.some(c => c.suit === Suit.RED), imagePath: '/assets/5b-ruler-tasks/normal-not-take-red.jpg' },

  // Hard
  { id: 'task-0-tricks', name: 'Win 0 Tricks', difficulty: 'HARD', points: 20, description: 'Do not win any tricks.', condition: (p) => p.wins === 0, imagePath: '/assets/5b-ruler-tasks/hard-0-tricks.jpg' },
  { id: 'task-1-trick', name: 'Win 1 Trick', difficulty: 'HARD', points: 20, description: 'Win exactly 1 trick.', condition: (p) => p.wins === 1, imagePath: '/assets/5b-ruler-tasks/hard-1-trick.jpg' },
  { id: 'task-2-tricks', name: 'Win 2+ Tricks', difficulty: 'HARD', points: 20, description: 'Win 2 or more tricks.', condition: (p) => p.wins >= 2, imagePath: '/assets/5b-ruler-tasks/hard-win-2-tricks.jpg' },
  { id: 'task-black-crown', name: 'Black Crown', difficulty: 'HARD', points: 20, description: 'Win a Black 10.', condition: (p) => p.wonCards.some(c => c.suit === Suit.BLACK && c.value === 10), imagePath: '/assets/5b-ruler-tasks/hard-take-black-crown.jpg' },
  { id: 'task-take-blue', name: 'Take Blue', difficulty: 'HARD', points: 20, description: 'Win at least one Blue card.', condition: (p) => p.wonCards.some(c => c.suit === Suit.BLUE), imagePath: '/assets/5b-ruler-tasks/hard-take-blue.jpg' },
  { id: 'task-take-green', name: 'Take Green', difficulty: 'HARD', points: 20, description: 'Win at least one Green card.', condition: (p) => p.wonCards.some(c => c.suit === Suit.GREEN), imagePath: '/assets/5b-ruler-tasks/hard-take-green.jpg' },
  { id: 'task-take-red', name: 'Take Red', difficulty: 'HARD', points: 20, description: 'Win at least one Red card.', condition: (p) => p.wonCards.some(c => c.suit === Suit.RED), imagePath: '/assets/5b-ruler-tasks/hard-take-red.jpg' },
  { id: 'task-rare', name: 'Take Rare', difficulty: 'HARD', points: 20, description: 'Win a trick with a Rare card.', condition: (p) => p.wonCards.some(c => c.type === 'RARE'), imagePath: '/assets/5b-ruler-tasks/hard-win-trick-rare.jpg' },

  // Difficult
  { id: 'task-gold-crown', name: 'Gold Crown', difficulty: 'DIFFICULT', points: 30, description: 'Win the Gold Crown (Rare King).', condition: (p) => p.wonCards.some(c => c.type === 'RARE' && c.value === 0), imagePath: '/assets/5b-ruler-tasks/difficult-take-gold-crown.jpg' },
  {
    id: 'task-avoid-lead',
    name: 'Avoid Lead Suit',
    difficulty: 'DIFFICULT',
    points: 30,
    description: 'Do not follow suit in any winning trick.', // Best guess
    condition: (p) => true, // Placeholder logic as it requires per-trick tracking
    imagePath: '/assets/5b-ruler-tasks/difficult-avoid-lead-suit-all-tricks.jpg'
  }
];

export const SUIT_COLORS: Record<Suit, string> = {
  [Suit.RED]: 'border-rose-400 text-rose-500',
  [Suit.BLUE]: 'border-sky-400 text-sky-500',
  [Suit.GREEN]: 'border-teal-500 text-teal-600',
  [Suit.BLACK]: 'border-slate-800 text-slate-900',
  [Suit.COLORLESS]: 'border-amber-400 text-amber-500'
};

export const SUIT_BG_COLORS: Record<Suit, string> = {
  [Suit.RED]: 'bg-[#f47b6e]/10',
  [Suit.BLUE]: 'bg-[#89a1d1]/10',
  [Suit.GREEN]: 'bg-[#6ab3a4]/10',
  [Suit.BLACK]: 'bg-slate-900/5',
  [Suit.COLORLESS]: 'bg-amber-50'
};

export const SUIT_ICONS: Record<Suit, React.ReactNode> = {
  [Suit.RED]: <i className="fa-solid fa-paw"></i>,
  [Suit.BLUE]: <i className="fa-solid fa-shield"></i>,
  [Suit.GREEN]: <i className="fa-solid fa-feather"></i>,
  [Suit.BLACK]: <i className="fa-solid fa-dragon"></i>,
  [Suit.COLORLESS]: <i className="fa-solid fa-crown"></i>
};
