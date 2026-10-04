export type Language = 'en' | 'es';

export interface Translations {
  // Navigation & Common
  common: {
    language: string;
    english: string;
    spanish: string;
    back: string;
    close: string;
    cancel: string;
    confirm: string;
    continue: string;
    select: string;
    selected: string;
    play: string;
    reset: string;
    leave: string;
    restart: string;
    round: string;
    trick: string;
    points: string;
    pts: string;
    tricks: string;
    score: string;
    you: string;
    host: string;
    guest: string;
    bot: string;
    leadSuit: string;
    leadPlayer: string;
    goldCrown: string;
    blackCrown: string;
    crowns: string;
    loading: string;
    copy: string;
    copied: string;
    hidden: string;
    noCards: string;
  };

  // Home Screen
  home: {
    playersAtTable: string;
    aiDifficulty: string;
    aiBeginner: string;
    aiIntermediate: string;
    aiExpert: string;
    basicModeTitle: string;
    basicModeDesc: string;
    advancedModeTitle: string;
    advancedModeDesc: string;
    allStarModeTitle: string;
    allStarModeDesc: string;
    multiplayerTitle: string;
    multiplayerDesc: string;
    createRoom: string;
    joinRoom: string;
    rejoinRoom: string;
    rulebooksBtn: string;
    installApp: string;
    installPromptDesc: string;
    installBtn: string;
    dismiss: string;
    iosInstallTitle: string;
    iosInstallSubtitle: string;
    iosStep1: string;
    iosStep2: string;
    iosGotIt: string;
    fallbackInstallAlert: string;
  };

  // Lobby
  lobby: {
    roomCode: string;
    waitingForPlayers: string;
    shareCodeHint: string;
    fillBotsLabel: string;
    botDifficultyLabel: string;
    startGame: string;
    waitingHost: string;
    leaveLobby: string;
    playerSlot: string;
    openSlot: string;
  };

  // Join Room Modal
  joinModal: {
    title: string;
    enterName: string;
    namePlaceholder: string;
    roomCode: string;
    codePlaceholder: string;
    joinBtn: string;
    createBtn: string;
    or: string;
    nameRequired: string;
    codeRequired: string;
  };

  // Character Selection
  charSelect: {
    title: string;
    currentTurn: string;
    yourTurnBadge: string;
    yourHandTitle: string;
    yourHandHint: string;
    kingBannedNotice: string;
    takenBy: string;
    selectBtn: string;
  };

  // Header & Logs
  header: {
    aiBadgePrefix: string;
    aiTooltip: string;
    restartTooltip: string;
    logsTooltip: string;
    chronicleTitle: string;
    rulesTooltip: string;
  };

  // Game Table & Board
  table: {
    battlefield: string;
    revolutionActive: string;
    leadSuitBadge: string;
    disconnectedWaiting: string;
    yourCards: string;
    yourTurnPrompt: string;
    waitingOpponentPrompt: string;
    opponentHandCards: string;
    reconnecting: string;
    controlledByBot: string;
    viewTrapsBtn: string;
    pointsLabel: string;
    tricksLabel: string;
    betLabel: string;
    revoltsLabel: string;
    tasksLabel: string;
    slotsLabel: string;
    mpLabel: string;
    activeStatus: string;
  };

  // Round Summary & Game Over
  summary: {
    roundSummaryTitle: string;
    nextRoundBtn: string;
    finalResultsBtn: string;
    tournamentOverTitle: string;
    grandWinner: string;
    playAgainBtn: string;
    pointsBreakdown: string;
    crownsGained: string;
    // Win reasons
    instantWinReason: string;
    rulerTyrannyReason: string;
    twoGoldCrownsReason: string;
    threeBlackCrownsReason: string;
    highestScoreReason: string;
  };

  // Character Modals & Setup
  modals: {
    rulebooksTitle: string;
    baseRules: string;
    exRules: string;
    openPdf: string;
    charInfoTitle: string;
    catchphrase: string;
    ability: string;
    difficulty: string;
    winCondition: string;
    pointsByWins: string;

    // Adventurer
    adventurerSetupTitle: string;
    adventurerSetupDesc: string;
    pickItemsPrompt: string;
    itemsChosen: string;
    confirmItems: string;
    adventurerSwapTitle: string;
    adventurerSwapDesc: string;

    // Berserker
    berserkerSetupTitle: string;
    berserkerSetupDesc: string;
    discardCardsPrompt: string;
    confirmBerserkerDiscard: string;

    // Gambler
    gamblerSetupTitle: string;
    gamblerSetupDesc: string;
    bidTricksPrompt: string;
    confirmBid: string;
    gamblerSwapDesc: string;

    // King
    kingSetupTitle: string;
    kingSetupDesc: string;
    confirmKingRare: string;

    // Ruler
    rulerSetupTitle: string;
    rulerSetupDesc: string;
    assignTaskPrompt: string;
    confirmTasks: string;

    // Samurai
    samuraiWinTitle: string;
    samuraiWinDesc: string;

    // Strategist
    strategistSetupTitle: string;
    strategistSetupDesc: string;
    strategistChoiceBlack7: string;
    strategistChoiceRare: string;
    strategistTrapsTitle: string;
    strategistTrapsDesc: string;
    strategistReviewTrapsTitle: string;

    // Time Traveler
    timeTravelerSetupTitle: string;
    timeTravelerSetupDesc: string;
    predictWinnersPrompt: string;
    confirmPredictions: string;
    timeTravelerDiscardTitle: string;
    timeTravelerDistributeTitle: string;
    timeTravelerWinTitle: string;

    // Alchemist
    alchemistSuitTitle: string;
    alchemistSuitDesc: string;

    // Collector
    collectorLossTitle: string;
    collectorLossDesc: string;

    // Phantom Thief
    thiefSetupTitle: string;
    thiefSetupDesc: string;
  };

  // Game Constants (Characters, Items, Tasks, Traps, Beasts)
  gameData: {
    characters: Record<string, {
      name: string;
      catchphrase: string;
      description: string;
      abilityName: string;
      winConditionText: string;
      difficulty: string;
    }>;
    items: Record<string, {
      name: string;
      description: string;
    }>;
    beasts: Record<string, {
      name: string;
      description: string;
    }>;
    traps: Record<string, {
      name: string;
      description: string;
    }>;
    tasks: Record<string, {
      name: string;
      description: string;
    }>;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      language: 'Language',
      english: 'English',
      spanish: 'Spanish',
      back: 'Back',
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      continue: 'Continue',
      select: 'Select',
      selected: 'Selected!',
      play: 'Play',
      reset: 'Reset',
      leave: 'Leave',
      restart: 'Play Again',
      round: 'Round',
      trick: 'Trick',
      points: 'Points',
      pts: 'pts',
      tricks: 'Tricks',
      score: 'Score',
      you: 'YOU',
      host: 'HOST',
      guest: 'GUEST',
      bot: 'Bot',
      leadSuit: 'Lead Suit',
      leadPlayer: 'Lead Player',
      goldCrown: 'Gold Crown',
      blackCrown: 'Black Crown',
      crowns: 'Crowns',
      loading: 'Loading...',
      copy: 'Copy',
      copied: 'Copied!',
      hidden: 'Hidden',
      noCards: 'No cards',
    },

    home: {
      playersAtTable: 'Players at Table',
      aiDifficulty: 'Opponents (AI Level)',
      aiBeginner: 'Beginner',
      aiIntermediate: 'Intermediate',
      aiExpert: 'Expert',
      basicModeTitle: 'Basic',
      basicModeDesc: 'Recommended starting characters to learn core trick-taking mechanics.',
      advancedModeTitle: 'Advanced',
      advancedModeDesc: 'Dynamic character pool featuring expansion roles and deeper strategies.',
      allStarModeTitle: 'All-Star',
      allStarModeDesc: 'Total chaos. All 15 characters available right from the start.',
      multiplayerTitle: 'Online Multiplayer',
      multiplayerDesc: 'Create or join a room to play with friends across devices.',
      createRoom: 'Create Room',
      joinRoom: 'Join Room',
      rejoinRoom: 'Rejoin Room',
      rulebooksBtn: 'Rulebooks',
      installApp: 'Install Tricktakers App',
      installPromptDesc: 'Pin to your home screen and play full-screen like a native app.',
      installBtn: 'Install on Device',
      dismiss: 'Dismiss',
      iosInstallTitle: 'Install on iPhone or iPad',
      iosInstallSubtitle: 'Follow these two simple steps in Safari:',
      iosStep1: 'Tap the Share button in the Safari bottom bar',
      iosStep2: 'Scroll down and select "Add to Home Screen"',
      iosGotIt: 'Got it!',
      fallbackInstallAlert: 'To install Tricktakers, open your browser menu (3 dots) and select "Add to Home screen" or "Install App".',
    },

    lobby: {
      roomCode: 'Room Code',
      waitingForPlayers: 'Waiting for players...',
      shareCodeHint: 'Share this code with your friends to play together:',
      fillBotsLabel: 'Fill empty seats with AI bots',
      botDifficultyLabel: 'AI Difficulty for bots',
      startGame: 'Start Game',
      waitingHost: 'Waiting for Host to start...',
      leaveLobby: 'Leave Room',
      playerSlot: 'Player',
      openSlot: 'Empty Seat',
    },

    joinModal: {
      title: 'Online Multiplayer',
      enterName: 'Your Name',
      namePlaceholder: 'Enter player nickname...',
      roomCode: 'Room Code',
      codePlaceholder: 'e.g. TRICK-1234',
      joinBtn: 'Join Room',
      createBtn: 'Create New Room',
      or: 'or',
      nameRequired: 'Please enter your name.',
      codeRequired: 'Please enter a valid room code.',
    },

    charSelect: {
      title: 'Character Selection',
      currentTurn: 'Current Turn',
      yourTurnBadge: "(It's your turn!)",
      yourHandTitle: 'Your 5 Cards for This Round',
      yourHandHint: 'Examine your hand to decide which character suits your strategy.',
      kingBannedNotice: 'King Ban: You cannot pick King two rounds in a row.',
      takenBy: 'Selected by',
      selectBtn: 'Select',
    },

    header: {
      aiBadgePrefix: 'AI: ',
      aiTooltip: 'Change Artificial Intelligence difficulty',
      restartTooltip: 'Reset Game',
      logsTooltip: 'Tournament Chronicle',
      chronicleTitle: 'Tournament Chronicle',
      rulesTooltip: 'Rulebooks',
    },

    table: {
      battlefield: 'BATTLEFIELD',
      revolutionActive: 'KAKUMEI ACTIVE (REVOLUTION)',
      leadSuitBadge: 'Lead Suit',
      disconnectedWaiting: 'disconnected. Waiting for reconnection...',
      yourCards: 'Your Cards',
      yourTurnPrompt: "It's your turn! Click a card to play it",
      waitingOpponentPrompt: "Waiting for opponent's move...",
      opponentHandCards: 'Cards in hand',
      reconnecting: 'Reconnecting',
      controlledByBot: 'Temporarily AI controlled',
      viewTrapsBtn: 'View Traps',
      pointsLabel: 'Points',
      tricksLabel: 'Tricks',
      betLabel: 'Bid',
      revoltsLabel: 'Revolutions',
      tasksLabel: 'Tasks',
      slotsLabel: 'Items',
      mpLabel: 'MP',
      activeStatus: 'Active',
    },

    summary: {
      roundSummaryTitle: 'Round {round} Summary',
      nextRoundBtn: 'Next Round',
      finalResultsBtn: 'View Final Results',
      tournamentOverTitle: 'TOURNAMENT OVER',
      grandWinner: 'Grand Champion',
      playAgainBtn: 'PLAY AGAIN',
      pointsBreakdown: 'Points breakdown',
      crownsGained: 'Crowns gained',
      instantWinReason: 'Instant Character Win! ({name})',
      rulerTyrannyReason: 'Absolute Tyranny (2+ wins without color cards)',
      twoGoldCrownsReason: 'Gold Crown Master (2 Gold Crowns)',
      threeBlackCrownsReason: 'Misery King (3 Black Crowns)',
      highestScoreReason: 'Highest Score (with Official Hierarchy Tiebreak)',
    },

    modals: {
      rulebooksTitle: 'Tricktakers Rulebooks',
      baseRules: 'Base Game Rulebook',
      exRules: 'Expansion Rulebook (EX)',
      openPdf: 'Open Official PDF',
      charInfoTitle: 'Character Details',
      catchphrase: 'Motto',
      ability: 'Ability',
      difficulty: 'Difficulty',
      winCondition: 'Instant Win Condition',
      pointsByWins: 'Points by Tricks Won',

      adventurerSetupTitle: 'Adventurer Equipment',
      adventurerSetupDesc: 'Select 2 Item Cards to begin your adventure. Unused items give bonus points at the end of the round!',
      pickItemsPrompt: 'Choose 2 items from the pool:',
      itemsChosen: 'Items chosen',
      confirmItems: 'Equip Items',
      adventurerSwapTitle: 'Adventurer Item Swap',
      adventurerSwapDesc: 'Discard an item or swap your current gear.',

      berserkerSetupTitle: 'Berserker Frenzy',
      berserkerSetupDesc: 'Discard 2 cards from your 7-card starting hand to enter the arena with 5 cards.',
      discardCardsPrompt: 'Select 2 cards to discard:',
      confirmBerserkerDiscard: 'Confirm Frenzy Hand',

      gamblerSetupTitle: 'Gambler Bidding',
      gamblerSetupDesc: 'Bid how many tricks you will win this round. If you hit your bid, score massive points or trigger an Instant Win with 4 wins!',
      bidTricksPrompt: 'Place your bid (0 to 4 tricks):',
      confirmBid: 'Confirm Bid',
      gamblerSwapDesc: 'You may swap cards before locking in your bid.',

      kingSetupTitle: "King's Privilege",
      kingSetupDesc: 'The King begins each round with the exclusive King Rare card and scores double in the final round.',
      confirmKingRare: 'Accept Royal Scepter',

      rulerSetupTitle: 'Royal Decrees (Tasks)',
      rulerSetupDesc: 'Assign task cards to your opponents. If they complete their tasks, you score points! Avoid trick rules with Lead Tokens.',
      assignTaskPrompt: 'Assign a task to each opponent:',
      confirmTasks: 'Issue Decrees',

      samuraiWinTitle: 'Way of the Warrior',
      samuraiWinDesc: 'The Samurai seeks exactly 4 wins for an instant victory. Beware of taking 5 wins, which triggers a Greed penalty!',

      strategistSetupTitle: 'Strategist Plan',
      strategistSetupDesc: 'Choose whether to take the exclusive Black 7 card into hand or score immediate bonus points.',
      strategistChoiceBlack7: 'Add Black 7 to Hand',
      strategistChoiceRare: 'Score +30 Bonus Points',
      strategistTrapsTitle: 'Strategist Trap Cards',
      strategistTrapsDesc: 'Review the active traps set on the battlefield. Players will lose points if they trigger them!',
      strategistReviewTrapsTitle: 'Active Trap Cards',

      timeTravelerSetupTitle: 'Time Traveler Prophecy',
      timeTravelerSetupDesc: 'Predict which players will win the most tricks. Correct predictions grant massive scoring bonuses!',
      predictWinnersPrompt: 'Select your round predictions:',
      confirmPredictions: 'Seal Prophecies',
      timeTravelerDiscardTitle: 'Rewind Discard',
      timeTravelerDistributeTitle: 'Timeline Distribution',
      timeTravelerWinTitle: 'Master of Time',

      alchemistSuitTitle: 'Alchemical Transmutation',
      alchemistSuitDesc: 'Select the primary element (suit) to form Magic Circles and transmute power.',

      collectorLossTitle: 'Collector Reservation',
      collectorLossDesc: 'Reserve cards from lost tricks into your private collection to assemble Straights, Flushes, and Sets.',

      phantomThiefSetupTitle: 'Phantom Thief Notice Letter',
      phantomThiefSetupDesc: 'Send a calling card to an unsuspecting target to swap cards or steal crowns.',
    },

    gameData: {
      characters: {
        '1A': {
          name: 'King',
          catchphrase: 'The royal road is the right road',
          description: 'Starts with the King Rare card. Scores double points in the final round.',
          abilityName: "King's Privilege",
          winConditionText: '5 Wins',
          difficulty: 'EASY',
        },
        '1C': {
          name: 'Strategist',
          catchphrase: 'To see the big picture',
          description: 'Use Trap Cards to penalize others. Exclusive Black 7 card.',
          abilityName: 'Strategize',
          winConditionText: '5 Wins',
          difficulty: 'DIFFICULT',
        },
        '2A': {
          name: 'Gambler',
          catchphrase: "It's not luck, it's guidance",
          description: 'Bid on wins. Discard/Draw to fix hand.',
          abilityName: 'Gamble',
          winConditionText: '4 Wins (if bid 4) or 5 Wins',
          difficulty: 'MODERATE',
        },
        '2C': {
          name: 'Summoner',
          catchphrase: 'Come order, come chaos',
          description: 'Summon beasts (EL, MIRIA, etc.) to modify rules using MP.',
          abilityName: 'Summon',
          winConditionText: '5 Wins',
          difficulty: 'HARD',
        },
        '2D': {
          name: 'Ninja',
          catchphrase: "I'm nowhere!",
          description: 'Play cards Face Down (Shadow Cloning). High risk.',
          abilityName: 'Shadow Cloning',
          winConditionText: '5 Wins',
          difficulty: 'MODERATE',
        },
        '3A': {
          name: 'Resistance',
          catchphrase: 'Opportunity always comes',
          description: 'Win with low cards (Revolt). Revolution (Kakumei) reverses strength.',
          abilityName: 'Kakumei',
          winConditionText: 'Black Card win during Revolt',
          difficulty: 'MODERATE',
        },
        '3B': {
          name: 'Adventurer',
          catchphrase: "Don't let luck be your friend",
          description: 'Use Items. Gain points for unused items.',
          abilityName: 'Using Items',
          winConditionText: '5 Wins',
          difficulty: 'DIFFICULT',
        },
        '3C': {
          name: 'Alchemist',
          catchphrase: 'Because the law is the truth',
          description: 'Play 3 cards at once. Form Magic Circles for points/Crowns.',
          abilityName: 'Alchemy',
          winConditionText: "Philosopher's Stone (2 Gold Crowns)",
          difficulty: 'HARD',
        },
        '3D': {
          name: 'Samurai',
          catchphrase: 'To master is to discard',
          description: 'Red cards are as strong as Black. Discard Black to draw.',
          abilityName: 'Spirit of Red',
          winConditionText: '4 Wins',
          difficulty: 'MODERATE',
        },
        '4A': {
          name: 'Hermit',
          catchphrase: 'Evil ways are also ways',
          description: 'White Flag beats Rare. Draw/Discard action.',
          abilityName: 'Dexterous Hand',
          winConditionText: '5 Wins',
          difficulty: 'EASY',
        },
        '4B': {
          name: 'Collector',
          catchphrase: 'Looking for romance',
          description: 'Reserve cards. Score for sets (Flush, Straight, etc.).',
          abilityName: 'Reservation',
          winConditionText: '9 Card Straight Flush',
          difficulty: 'MODERATE',
        },
        '4C': {
          name: 'Time Traveler',
          catchphrase: "I'm ready to change...",
          description: 'Rewind time or Change the Past. Predict winners.',
          abilityName: 'Time Travel',
          winConditionText: 'Round 3 Perfect Prophecy',
          difficulty: 'DIFFICULT',
        },
        '5A': {
          name: 'Berserker',
          catchphrase: 'Rooooar!!',
          description: 'Strongest 10s. Weakest to 1s. Win with 0 tricks.',
          abilityName: 'Fierce Uplifting',
          winConditionText: '0 Wins',
          difficulty: 'EASY',
        },
        '5B': {
          name: 'Ruler',
          catchphrase: 'Challenges open the way',
          description: 'Give tasks to players. Avoid rules with tokens.',
          abilityName: 'Giving Tasks',
          winConditionText: '2+ Wins (No R/B/G cards)',
          difficulty: 'MODERATE',
        },
        '5C': {
          name: 'Phantom Thief',
          catchphrase: 'Having fun?',
          description: 'Exchange cards via Notice Letters. Steal crowns.',
          abilityName: 'Art of Theft',
          winConditionText: '5 Wins',
          difficulty: 'HARD',
        },
      },
      items: {
        'it-1': { name: 'Map of Destiny', description: 'Discard X cards, draw X cards.' },
        'it-2': { name: 'Invisibility Potion', description: 'Play your card Face Down.' },
        'it-3': { name: 'Timid Boots', description: 'Play last in the trick.' },
        'it-4': { name: 'Miracle Sword', description: 'Value ± 5 (Min 1, Max 9).' },
        'it-5': { name: "Ruler's Wand", description: 'Card becomes color of lead suit.' },
        'it-6': { name: "Berserker's Axe", description: 'Value becomes 10 (Loses to 1).' },
        'it-7': { name: 'Golden Treasure', description: 'Immediately gain 30 points.' },
        'it-8': { name: "Hermit's Secret Book", description: 'Played card stays hidden.' },
        'it-9': { name: 'White Orb', description: 'Treat as Colorless / White Flag.' },
        'it-10': { name: 'Proactive Wing', description: 'Pass lead to next player.' },
        'it-11': { name: 'Crystal', description: 'Initial bonus +20 points.' },
        'it-12': { name: 'Fairy Mischief', description: 'Draw 1 card, discard this item.' },
        'it-13': { name: 'Dragon Doll', description: 'Win trick ties.' },
        'it-14': { name: 'Castle Visit', description: 'Change card number to 10.' },
        'it-15': { name: 'Rock Crystal', description: 'Initial bonus +30 points.' },
      },
      beasts: {
        'b-el': { name: 'EL', description: 'Rear: +1 MP/turn. Front: White Flag.' },
        'b-miria': { name: 'MIRIA', description: 'Rear: 10 does not lose to 1. Front: Berserker.' },
        'b-maru': { name: 'MARU', description: 'Front: Red 10.' },
        'b-guru': { name: 'GURU', description: 'Front: Blue 10.' },
        'b-nemu': { name: 'NEMU', description: 'Front: Green 10.' },
        'b-oko': { name: 'OKO', description: 'Front: Black 10.' },
      },
      traps: {
        'trap-1': { name: 'Low Numbers (A)', description: 'If you play 1-6, lose points.' },
        'trap-2': { name: 'High Numbers (B)', description: 'If you play 7, 8, or 9, lose points.' },
        'trap-3': { name: 'Black Card (C)', description: 'If you play a Black card, lose points.' },
        'trap-4': { name: 'Strategist Victory (D)', description: 'If the Strategist wins the trick, all opponents lose points.' },
        'trap-5': { name: 'Must Follow (E)', description: "If you cannot follow the lead suit, lose points." },
      },
      tasks: {
        'task-take-1': { name: 'Take a 1', description: 'Win at least one "1" card.' },
        'task-take-10': { name: 'Take a 10', description: 'Win at least one "10" card.' },
        'task-take-black': { name: 'Take Black', description: 'Win at least one Black card.' },
        'task-no-blue': { name: 'No Blue', description: 'Do not win any Blue cards.' },
        'task-no-green': { name: 'No Green', description: 'Do not win any Green cards.' },
        'task-no-red': { name: 'No Red', description: 'Do not win any Red cards.' },
        'task-0-tricks': { name: 'Win 0 Tricks', description: 'Do not win any tricks.' },
        'task-1-trick': { name: 'Win 1 Trick', description: 'Win exactly 1 trick.' },
        'task-2-tricks': { name: 'Win 2+ Tricks', description: 'Win 2 or more tricks.' },
        'task-black-crown': { name: 'Black Crown', description: 'Win a Black 10 card.' },
        'task-take-blue': { name: 'Take Blue', description: 'Win at least one Blue card.' },
        'task-take-green': { name: 'Take Green', description: 'Win at least one Green card.' },
        'task-take-red': { name: 'Take Red', description: 'Win at least one Red card.' },
        'task-rare': { name: 'Take Rare', description: 'Win a trick with a Rare card.' },
        'task-gold-crown': { name: 'Gold Crown', description: 'Win the Gold Crown (Rare King).' },
        'task-avoid-lead': { name: 'Avoid Lead Suit', description: 'Do not follow lead suit in any won trick.' },
      },
    },
  },

  es: {
    common: {
      language: 'Idioma',
      english: 'Inglés',
      spanish: 'Español',
      back: 'Volver',
      close: 'Cerrar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      continue: 'Continuar',
      select: 'Seleccionar',
      selected: '¡Seleccionado!',
      play: 'Jugar',
      reset: 'Reiniciar',
      leave: 'Salir',
      restart: 'Volver a Jugar',
      round: 'Ronda',
      trick: 'Baza',
      points: 'Puntos',
      pts: 'pts',
      tricks: 'Bazas',
      score: 'Puntuación',
      you: 'TÚ',
      host: 'ANFITRIÓN',
      guest: 'INVITADO',
      bot: 'Bot',
      leadSuit: 'Palo Líder',
      leadPlayer: 'Jugador Mano',
      goldCrown: 'Corona Dorada',
      blackCrown: 'Corona Negra',
      crowns: 'Coronas',
      loading: 'Cargando...',
      copy: 'Copiar',
      copied: '¡Copiado!',
      hidden: 'Oculto',
      noCards: 'Sin cartas',
    },

    home: {
      playersAtTable: 'Jugadores en Mesa',
      aiDifficulty: 'Nivel Rivales (IA)',
      aiBeginner: 'Fácil',
      aiIntermediate: 'Medio',
      aiExpert: 'Experto',
      basicModeTitle: 'Básico',
      basicModeDesc: 'Personajes iniciales recomendados para aprender las mecánicas.',
      advancedModeTitle: 'Avanzado',
      advancedModeDesc: 'Pool dinámico con personajes de la expansión y nuevas estrategias.',
      allStarModeTitle: 'All-Star',
      allStarModeDesc: 'Caos total. Todos los 15 personajes disponibles desde el inicio.',
      multiplayerTitle: 'Multijugador Online',
      multiplayerDesc: 'Crea o únete a una sala para jugar con amigos desde cualquier dispositivo.',
      createRoom: 'Crear Sala',
      joinRoom: 'Unirse a Sala',
      rejoinRoom: 'Reunirse a la Sala',
      rulebooksBtn: 'Manuales de Juego',
      installApp: 'Instalar App Tricktakers',
      installPromptDesc: 'Fíjala en tu pantalla de inicio y juega a pantalla completa como una app nativa.',
      installBtn: 'Instalar en Teléfono',
      dismiss: 'Descartar',
      iosInstallTitle: 'Instalar en iPhone o iPad',
      iosInstallSubtitle: 'Sigue estos dos sencillos pasos en Safari:',
      iosStep1: 'Pulsa el botón Compartir en la barra inferior de Safari',
      iosStep2: 'Desliza hacia abajo y selecciona "Añadir a pantalla de inicio"',
      iosGotIt: '¡Entendido!',
      fallbackInstallAlert: 'Para instalar Tricktakers, pulsa en los 3 puntos de tu navegador y selecciona "Añadir a pantalla de inicio" o "Instalar aplicación".',
    },

    lobby: {
      roomCode: 'Código de Sala',
      waitingForPlayers: 'Esperando jugadores...',
      shareCodeHint: 'Comparte este código con tus amigos para jugar juntos:',
      fillBotsLabel: 'Completar asientos vacíos con bots de IA',
      botDifficultyLabel: 'Nivel de la IA para los bots',
      startGame: 'Empezar Partida',
      waitingHost: 'Esperando a que el Anfitrión comience...',
      leaveLobby: 'Salir de la Sala',
      playerSlot: 'Jugador',
      openSlot: 'Asiento Libre',
    },

    joinModal: {
      title: 'Multijugador Online',
      enterName: 'Tu Nombre',
      namePlaceholder: 'Introduce tu apodo...',
      roomCode: 'Código de Sala',
      codePlaceholder: 'ej. TRICK-1234',
      joinBtn: 'Unirse a la Sala',
      createBtn: 'Crear Nueva Sala',
      or: 'o',
      nameRequired: 'Por favor, escribe tu nombre.',
      codeRequired: 'Por favor, introduce un código de sala válido.',
    },

    charSelect: {
      title: 'Selección de Personaje',
      currentTurn: 'Turno actual',
      yourTurnBadge: '(¡Tu turno!)',
      yourHandTitle: 'Tus 5 Cartas de esta Ronda',
      yourHandHint: 'Revisa tu mano para decidir qué personaje te conviene.',
      kingBannedNotice: 'Regla del Rey: No puedes elegir al Rey dos rondas seguidas.',
      takenBy: 'Elegido por',
      selectBtn: 'Seleccionar',
    },

    header: {
      aiBadgePrefix: 'IA: ',
      aiTooltip: 'Cambiar nivel de la Inteligencia Artificial',
      restartTooltip: 'Reiniciar Partida',
      logsTooltip: 'Crónica del Torneo',
      chronicleTitle: 'Crónica del Torneo',
      rulesTooltip: 'Manuales de Juego',
    },

    table: {
      battlefield: 'CAMPO DE BATALLA',
      revolutionActive: 'REVOLUCIÓN ACTIVA (KAKUMEI)',
      leadSuitBadge: 'Palo Líder',
      disconnectedWaiting: 'se ha desconectado. Esperando reconexión...',
      yourCards: 'Tus Cartas',
      yourTurnPrompt: '¡Es tu turno! Haz clic en una carta para jugarla',
      waitingOpponentPrompt: 'Esperando el turno del rival...',
      opponentHandCards: 'Cartas en mano',
      reconnecting: 'Reconectando',
      controlledByBot: 'Controlado temporalmente por IA',
      viewTrapsBtn: 'Ver Trampas',
      pointsLabel: 'Puntos',
      tricksLabel: 'Bazas',
      betLabel: 'Apuesta',
      revoltsLabel: 'Revoluciones',
      tasksLabel: 'Tareas',
      slotsLabel: 'Salas',
      mpLabel: 'MP',
      activeStatus: 'Activa',
    },

    summary: {
      roundSummaryTitle: 'Resumen de la Ronda {round}',
      nextRoundBtn: 'Siguiente Ronda',
      finalResultsBtn: 'Ver Resultados Finales',
      tournamentOverTitle: 'FIN DEL TORNEO',
      grandWinner: 'Ganador Absoluto',
      playAgainBtn: 'VOLVER A JUGAR',
      pointsBreakdown: 'Desglose de puntos',
      crownsGained: 'Coronas ganadas',
      instantWinReason: '¡Victoria Instantánea por Personaje! ({name})',
      rulerTyrannyReason: 'Tiranía Absoluta (2+ victorias sin cartas de color)',
      twoGoldCrownsReason: 'Maestro de Coronas Doradas (2 Coronas)',
      threeBlackCrownsReason: 'Rey de la Miseria (3 Coronas Negras)',
      highestScoreReason: 'Victoria por Puntuación (y Jerarquía Oficial)',
    },

    modals: {
      rulebooksTitle: 'Manuales de Juego Tricktakers',
      baseRules: 'Manual del Juego Base',
      exRules: 'Manual de la Expansión (EX)',
      openPdf: 'Abrir PDF Oficial',
      charInfoTitle: 'Detalles del Personaje',
      catchphrase: 'Lema',
      ability: 'Habilidad',
      difficulty: 'Dificultad',
      winCondition: 'Condición de Victoria Instantánea',
      pointsByWins: 'Puntos por Bazas Ganadas',

      adventurerSetupTitle: 'Equipamiento del Aventurero',
      adventurerSetupDesc: 'Elige 2 Cartas de Objeto para iniciar tu aventura. ¡Los objetos no usados otorgan puntos al final de la ronda!',
      pickItemsPrompt: 'Elige 2 objetos de la reserva:',
      itemsChosen: 'Objetos elegidos',
      confirmItems: 'Equipar Objetos',
      adventurerSwapTitle: 'Intercambio de Objetos',
      adventurerSwapDesc: 'Descarta un objeto o renueva tu inventario.',

      berserkerSetupTitle: 'Furia Berserker',
      berserkerSetupDesc: 'Descarta 2 cartas de tu mano inicial de 7 para entrar a la arena con 5 cartas.',
      discardCardsPrompt: 'Selecciona 2 cartas para descartar:',
      confirmBerserkerDiscard: 'Confirmar Mano de Furia',

      gamblerSetupTitle: 'Apuesta del Tahúr (Gambler)',
      gamblerSetupDesc: 'Apuesta cuántas bazas vas a ganar esta ronda. ¡Si aciertas, ganas grandes puntos o la partida instantánea con 4 bazas!',
      bidTricksPrompt: 'Haz tu apuesta (0 a 4 bazas):',
      confirmBid: 'Confirmar Apuesta',
      gamblerSwapDesc: 'Puedes descartar y robar cartas antes de fijar tu apuesta.',

      kingSetupTitle: 'Privilegio del Rey',
      kingSetupDesc: 'El Rey comienza cada ronda con la carta exclusiva King Rare y puntúa el doble en la ronda final.',
      confirmKingRare: 'Aceptar Cetro Real',

      rulerSetupTitle: 'Decretos Reales (Tareas)',
      rulerSetupDesc: 'Asigna tareas a tus rivales. ¡Si las cumplen, tú recibes puntos! Evita reglas con Fichas de Líder.',
      assignTaskPrompt: 'Asigna una tarea a cada rival:',
      confirmTasks: 'Emitir Decretos',

      samuraiWinTitle: 'Camino del Samurái',
      samuraiWinDesc: 'El Samurái busca exactamente 4 victorias para la victoria instantánea. ¡Cuidado con conseguir 5 victorias o recibirás penalización!',

      strategistSetupTitle: 'Estrategia de Batalla',
      strategistSetupDesc: 'Elige si deseas incorporar el 7 Negro exclusivo a tu mano o recibir bonificación de puntos directa.',
      strategistChoiceBlack7: 'Añadir 7 Negro a la Mano',
      strategistChoiceRare: 'Puntuar +30 Puntos Extra',
      strategistTrapsTitle: 'Cartas de Trampa del Estratega',
      strategistTrapsDesc: 'Revisa las trampas activas en el campo. ¡Los jugadores perderán puntos si caen en ellas!',
      strategistReviewTrapsTitle: 'Cartas de Trampa Activas',

      timeTravelerSetupTitle: 'Profecía del Viajero en el Tiempo',
      timeTravelerSetupDesc: 'Predice qué jugadores ganarán más bazas. ¡Las predicciones acertadas otorgan grandes bonificaciones!',
      predictWinnersPrompt: 'Elige tus predicciones para la ronda:',
      confirmPredictions: 'Sellar Profecías',
      timeTravelerDiscardTitle: 'Descarte Temporal',
      timeTravelerDistributeTitle: 'Distribución Temporal',
      timeTravelerWinTitle: 'Amo del Tiempo',

      alchemistSuitTitle: 'Transmutación Alquímica',
      alchemistSuitDesc: 'Elige el elemento primario para formar Círculos Mágicos y transmutar poder.',

      collectorLossTitle: 'Reserva del Coleccionista',
      collectorLossDesc: 'Reserva cartas de bazas perdidas en tu colección privada para formar Escaleras, Colores y Tríos.',

      phantomThiefSetupTitle: 'Carta de Aviso del Ladrón Fantasma',
      phantomThiefSetupDesc: 'Envía una carta de aviso a tu objetivo para intercambiar cartas o robar coronas.',
    },

    gameData: {
      characters: {
        '1A': {
          name: 'Rey',
          catchphrase: 'El camino real es el camino correcto',
          description: 'Comienza con la carta Rara del Rey. Puntúa el doble en la ronda final.',
          abilityName: 'Privilegio Real',
          winConditionText: '5 Victorias',
          difficulty: 'FÁCIL',
        },
        '1C': {
          name: 'Estratega',
          catchphrase: 'Ver el panorama completo',
          description: 'Usa Cartas de Trampa para penalizar. Carta exclusiva 7 Negro.',
          abilityName: 'Estrategia',
          winConditionText: '5 Victorias',
          difficulty: 'DIFÍCIL',
        },
        '2A': {
          name: 'Tahúr',
          catchphrase: 'No es suerte, es destino',
          description: 'Apuesta tus victorias. Descarta y roba para ajustar tu mano.',
          abilityName: 'Apuesta',
          winConditionText: '4 Victorias (con apuesta 4) o 5 Victorias',
          difficulty: 'MODERADO',
        },
        '2C': {
          name: 'Invocador',
          catchphrase: 'Venga el orden, venga el caos',
          description: 'Invoca bestias (EL, MIRIA, etc.) para alterar reglas usando MP.',
          abilityName: 'Invocación',
          winConditionText: '5 Victorias',
          difficulty: 'DIFÍCIL',
        },
        '2D': {
          name: 'Ninja',
          catchphrase: '¡No estoy en ningún lugar!',
          description: 'Juega cartas Boca Abajo (Clonación de Sombras). Alto riesgo.',
          abilityName: 'Clonación de Sombras',
          winConditionText: '5 Victorias',
          difficulty: 'MODERADO',
        },
        '3A': {
          name: 'Resistencia',
          catchphrase: 'La oportunidad siempre llega',
          description: 'Gana con cartas bajas (Rebelión). La Revolución (Kakumei) invierte la fuerza.',
          abilityName: 'Kakumei',
          winConditionText: 'Ganar baza con Carta Negra durante Rebelión',
          difficulty: 'MODERADO',
        },
        '3B': {
          name: 'Aventurero',
          catchphrase: 'No dejes que la suerte sea tu amiga',
          description: 'Usa Objetos. Gana puntos por los objetos no utilizados.',
          abilityName: 'Uso de Objetos',
          winConditionText: '5 Victorias',
          difficulty: 'DIFÍCIL',
        },
        '3C': {
          name: 'Alquimista',
          catchphrase: 'Porque la ley es la verdad',
          description: 'Juega 3 cartas a la vez. Forma Círculos Mágicos para puntos/Coronas.',
          abilityName: 'Alquimia',
          winConditionText: 'Piedra Filosofal (2 Coronas Doradas)',
          difficulty: 'DIFÍCIL',
        },
        '3D': {
          name: 'Samurái',
          catchphrase: 'Dominar es desprenderse',
          description: 'Las cartas Rojas son tan fuertes como las Negras. Descarta Negras para robar.',
          abilityName: 'Espíritu Rojo',
          winConditionText: '4 Victorias',
          difficulty: 'MODERADO',
        },
        '4A': {
          name: 'Ermitaño',
          catchphrase: 'Los malos caminos también son caminos',
          description: 'La Bandera Blanca vence a las Raras. Acción de Robar/Descartar.',
          abilityName: 'Mano Diestra',
          winConditionText: '5 Victorias',
          difficulty: 'FÁCIL',
        },
        '4B': {
          name: 'Coleccionista',
          catchphrase: 'En busca del romance',
          description: 'Reserva cartas. Puntúa por combinaciones (Color, Escalera, etc.).',
          abilityName: 'Reserva',
          winConditionText: 'Escalera de Color de 9 Cartas',
          difficulty: 'MODERADO',
        },
        '4C': {
          name: 'Viajero en el Tiempo',
          catchphrase: 'Listo para cambiar el pasado...',
          description: 'Rebobina el tiempo o altera el pasado. Predice ganadores.',
          abilityName: 'Viaje Temporal',
          winConditionText: 'Profecía Perfecta en Ronda 3',
          difficulty: 'DIFÍCIL',
        },
        '5A': {
          name: 'Berserker',
          catchphrase: '¡¡Ruaaaaar!!',
          description: 'Los 10 son los más fuertes, pero pierden contra el 1. Gana con 0 bazas.',
          abilityName: 'Furia Desatada',
          winConditionText: '0 Victorias',
          difficulty: 'FÁCIL',
        },
        '5B': {
          name: 'Gobernante',
          catchphrase: 'Los desafíos abren el camino',
          description: 'Asigna tareas a los rivales. Evita reglas con fichas.',
          abilityName: 'Asignar Tareas',
          winConditionText: '2+ Victorias (Sin cartas Rojas/Azules/Verdes)',
          difficulty: 'MODERADO',
        },
        '5C': {
          name: 'Ladrón Fantasma',
          catchphrase: '¿Te estás divirtiendo?',
          description: 'Intercambia cartas mediante Cartas de Aviso. Roba coronas.',
          abilityName: 'Arte del Hurto',
          winConditionText: '5 Victorias',
          difficulty: 'DIFÍCIL',
        },
      },
      items: {
        'it-1': { name: 'Mapa del Destino', description: 'Descarta X cartas, roba X cartas.' },
        'it-2': { name: 'Poción de Invisibilidad', description: 'Juega tu carta Boca Abajo.' },
        'it-3': { name: 'Botas Tímidas', description: 'Juega último en la baza.' },
        'it-4': { name: 'Espada Milagrosa', description: 'Modifica el valor ± 5 (Mín 1, Máx 9).' },
        'it-5': { name: 'Varita del Gobernante', description: 'La carta se convierte en el color del Palo Líder.' },
        'it-6': { name: 'Hacha del Berserker', description: 'El valor se convierte en 10 (Pierde contra 1).' },
        'it-7': { name: 'Tesoro Dorado', description: 'Gana inmediatamente 30 puntos.' },
        'it-8': { name: 'Libro Secreto del Ermitaño', description: 'La carta jugada permanece oculta.' },
        'it-9': { name: 'Orbe Blanco', description: 'Se trata como Incoloro / Bandera Blanca.' },
        'it-10': { name: 'Ala Proactiva', description: 'Pasa la salida de baza al siguiente jugador.' },
        'it-11': { name: 'Cristal', description: 'Bonificación inicial de +20 puntos.' },
        'it-12': { name: 'Travesura de Hada', description: 'Roba 1 carta y descarta este objeto.' },
        'it-13': { name: 'Muñeco Dragón', description: 'Gana todos los empates en la baza.' },
        'it-14': { name: 'Visita al Castillo', description: 'Cambia el número de tu carta a 10.' },
        'it-15': { name: 'Cristal de Roca', description: 'Bonificación inicial de +30 puntos.' },
      },
      beasts: {
        'b-el': { name: 'EL', description: 'Trasero: +1 MP/turno. Frontal: Bandera Blanca.' },
        'b-miria': { name: 'MIRIA', description: 'Trasero: El 10 no pierde contra el 1. Frontal: Berserker.' },
        'b-maru': { name: 'MARU', description: 'Frontal: Rojo 10.' },
        'b-guru': { name: 'GURU', description: 'Frontal: Azul 10.' },
        'b-nemu': { name: 'NEMU', description: 'Frontal: Verde 10.' },
        'b-oko': { name: 'OKO', description: 'Frontal: Negro 10.' },
      },
      traps: {
        'trap-1': { name: 'Números Bajos (A)', description: 'Si juegas del 1 al 6, pierdes puntos.' },
        'trap-2': { name: 'Números Altos (B)', description: 'Si juegas 7, 8 o 9, pierdes puntos.' },
        'trap-3': { name: 'Carta Negra (C)', description: 'Si juegas una carta Negra, pierdes puntos.' },
        'trap-4': { name: 'Victoria del Estratega (D)', description: 'Si el Estratega gana la baza, todos los rivales pierden puntos.' },
        'trap-5': { name: 'Obligado a Seguir Palo (E)', description: 'Si no puedes asistir al palo líder, pierdes puntos.' },
      },
      tasks: {
        'task-take-1': { name: 'Llevarse un 1', description: 'Gana al menos una carta "1".' },
        'task-take-10': { name: 'Llevarse un 10', description: 'Gana al menos una carta "10".' },
        'task-take-black': { name: 'Llevarse Negra', description: 'Gana al menos una carta Negra.' },
        'task-no-blue': { name: 'Sin Azules', description: 'No ganes ninguna carta Azul.' },
        'task-no-green': { name: 'Sin Verdes', description: 'No ganes ninguna carta Verde.' },
        'task-no-red': { name: 'Sin Rojas', description: 'No ganes ninguna carta Roja.' },
        'task-0-tricks': { name: 'Ganar 0 Bazas', description: 'No ganes ninguna baza en la ronda.' },
        'task-1-trick': { name: 'Ganar 1 Baza', description: 'Gana exactamente 1 baza.' },
        'task-2-tricks': { name: 'Ganar 2+ Bazas', description: 'Gana 2 o más bazas.' },
        'task-black-crown': { name: 'Corona Negra', description: 'Gana una carta Negra con valor 10.' },
        'task-take-blue': { name: 'Llevarse Azul', description: 'Gana al menos una carta Azul.' },
        'task-take-green': { name: 'Llevarse Verde', description: 'Gana al menos una carta Verde.' },
        'task-take-red': { name: 'Llevarse Roja', description: 'Gana al menos una carta Roja.' },
        'task-rare': { name: 'Llevarse Rara', description: 'Gana una baza usando una carta Rara.' },
        'task-gold-crown': { name: 'Corona Dorada', description: 'Gana la Corona Dorada (Rey Raro).' },
        'task-avoid-lead': { name: 'Evitar Palo Líder', description: 'No sigas el palo líder en ninguna baza que ganes.' },
      },
    },
  },
};
