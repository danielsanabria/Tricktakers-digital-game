import { CharacterType } from '../../game/core/types';
import { IScoringLogic } from './scoring_Interface';
import { BaseScoring } from './BaseScoring';
import { CollectorScoring } from './score_Collector';
import { RulerScoring } from './score_Ruler';
import { AlchemistScoring } from './score_Alchemist';
import { ResistanceScoring } from './score_Resistance';
import { KingScoring } from './score_King';
import { SamuraiScoring } from './score_Samurai';
import { TimeTravelerScoring } from './score_TimeTraveler';
import { BerserkerScoring } from './score_Berserker';
import { HermitScoring } from './score_Hermit';
import { GamblerScoring } from './score_Gambler';
import { AdventurerScoring } from './score_Adventurer';
import { PhantomThiefScoring } from './score_PhantomThief';
import { StrategistScoring } from './score_Strategist';

const scoringRegistry: Partial<Record<CharacterType, IScoringLogic>> = {
    [CharacterType.KING]: new KingScoring(),
    [CharacterType.STRATEGIST]: new StrategistScoring(),
    [CharacterType.GAMBLER]: new GamblerScoring(),
    [CharacterType.RESISTANCE]: new ResistanceScoring(),
    [CharacterType.ADVENTURER]: new AdventurerScoring(),
    [CharacterType.ALCHEMIST]: new AlchemistScoring(),
    [CharacterType.SAMURAI]: new SamuraiScoring(),
    [CharacterType.HERMIT]: new HermitScoring(),
    [CharacterType.COLLECTOR]: new CollectorScoring(),
    [CharacterType.TIME_TRAVELER]: new TimeTravelerScoring(),
    [CharacterType.BERSERKER]: new BerserkerScoring(),
    [CharacterType.RULER]: new RulerScoring(),
    [CharacterType.PHANTOM_THIEF]: new PhantomThiefScoring(),
};

const baseScoring = new BaseScoring();

export const getScoringLogic = (charType: CharacterType | null): IScoringLogic => {
    if (!charType) return baseScoring;
    return scoringRegistry[charType] || baseScoring;
};
