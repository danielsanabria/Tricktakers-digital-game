import { Card, CardType, Suit } from './types';

export const calculateAlchemyValue = (cards: Card[]): { value: number, isStrong: boolean, elements: string[] } => {
    const sum = cards.reduce((acc, c) => acc + (c.type === CardType.RARE ? 11 : (c.type === CardType.WHITE_FLAG ? 0 : c.value)), 0);
    const lastDigit = sum % 10;
    const value = (sum === 10) ? 10 : lastDigit;

    const elements: string[] = [];
    if (cards.length === 3) {
        // 3 of a kind
        const uniqValues = new Set(cards.filter(c => c.type === CardType.NUMBER).map(c => c.value));
        if (uniqValues.size === 1) elements.push('3_OF_A_KIND');

        // Flush
        const uniqSuits = new Set(cards.filter(c => c.suit !== Suit.COLORLESS).map(c => c.suit));
        if (uniqSuits.size === 1) elements.push('FLUSH');

        // Straight
        const vals = cards.filter(c => c.type === CardType.NUMBER).map(c => c.value).sort((a, b) => a - b);
        if (vals.length === 3 && vals[2] === vals[1] + 1 && vals[1] === vals[0] + 1) {
            elements.push('STRAIGHT');
        }
    }

    return { value, isStrong: value === 10, elements };
};
