
import { CharacterType } from '../game/core/types';
import { ICharacterLogic, BaseCharacterLogic } from './logic_Interface';
import { KingLogic } from './characters/logic_King';
import { StrategistLogic } from './characters/logic_Strategist';
import { GamblerLogic } from './characters/logic_Gambler';
import { SummonerLogic } from './characters/logic_Summoner';
import { NinjaLogic } from './characters/logic_Ninja';
import { ResistanceLogic } from './characters/logic_Resistance';
import { AdventurerLogic } from './characters/logic_Adventurer';
import { AlchemistLogic } from './characters/logic_Alchemist';
import { SamuraiLogic } from './characters/logic_Samurai';
import { HermitLogic } from './characters/logic_Hermit';
import { CollectorLogic } from './characters/logic_Collector';
import { TimeTravelerLogic } from './characters/logic_TimeTraveler';
import { BerserkerLogic } from './characters/logic_Berserker';
import { RulerLogic } from './characters/logic_Ruler';
import { PhantomThiefLogic } from './characters/logic_PhantomThief';

const REGISTRY: Partial<Record<CharacterType, ICharacterLogic>> = {
  [CharacterType.KING]: new KingLogic(),
  [CharacterType.STRATEGIST]: new StrategistLogic(),
  [CharacterType.GAMBLER]: new GamblerLogic(),
  [CharacterType.SUMMONER]: new SummonerLogic(),
  [CharacterType.NINJA]: new NinjaLogic(),
  [CharacterType.RESISTANCE]: new ResistanceLogic(),
  [CharacterType.ADVENTURER]: new AdventurerLogic(),
  [CharacterType.ALCHEMIST]: new AlchemistLogic(),
  [CharacterType.SAMURAI]: new SamuraiLogic(),
  [CharacterType.HERMIT]: new HermitLogic(),
  [CharacterType.COLLECTOR]: new CollectorLogic(),
  [CharacterType.TIME_TRAVELER]: new TimeTravelerLogic(),
  [CharacterType.BERSERKER]: new BerserkerLogic(),
  [CharacterType.RULER]: new RulerLogic(),
  [CharacterType.PHANTOM_THIEF]: new PhantomThiefLogic(),
};

const DEFAULT_LOGIC = new BaseCharacterLogic();

export const getCharacterLogic = (type: CharacterType | null): ICharacterLogic => {
  if (!type) return DEFAULT_LOGIC;
  return REGISTRY[type] || DEFAULT_LOGIC;
};
