
import { CharacterType } from '../types';
import { ICharacterLogic, BaseCharacterLogic } from './logic_Interface';
import { KingLogic } from './logic_King';
import { StrategistLogic } from './logic_Strategist';
import { GamblerLogic } from './logic_Gambler';
import { SummonerLogic } from './logic_Summoner';
import { NinjaLogic } from './logic_Ninja';
import { ResistanceLogic } from './logic_Resistance';
import { AdventurerLogic } from './logic_Adventurer';
import { AlchemistLogic } from './logic_Alchemist';
import { SamuraiLogic } from './logic_Samurai';
import { HermitLogic } from './logic_Hermit';
import { CollectorLogic } from './logic_Collector';
import { TimeTravelerLogic } from './logic_TimeTraveler';
import { BerserkerLogic } from './logic_Berserker';
import { RulerLogic } from './logic_Ruler';
import { PhantomThiefLogic } from './logic_PhantomThief';

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
