import { AIDifficulty } from '../../game/core/types';
import { AIContext } from './aiTypes';
import { getBeginnerAiMove } from './beginnerAI';
import { getIntermediateAiMove } from './intermediateAI';
import { getExpertAiMove } from './expertAI';

/**
 * Main AI move dispatcher.
 * Selects and runs the appropriate AI engine based on chosen difficulty.
 */
export function getOptimalAiMove(context: AIContext): string {
    const difficulty = context.difficulty || AIDifficulty.INTERMEDIATE;

    switch (difficulty) {
        case AIDifficulty.BEGINNER:
            return getBeginnerAiMove(context);

        case AIDifficulty.EXPERT:
            return getExpertAiMove(context);

        case AIDifficulty.INTERMEDIATE:
        default:
            return getIntermediateAiMove(context);
    }
}

export * from './aiTypes';
export * from './aiCharacterGoals';
export * from './beginnerAI';
export * from './intermediateAI';
export * from './expertAI';
