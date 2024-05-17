import { Client } from "colyseus";
import Card from "./rooms/schema/Card";
import { ArraySchema } from '@colyseus/schema';

enum PokerHand {
    RoyalFlush = 10,
    StraightFlush = 9,
    FourOfAKind = 8,
    FullHouse = 7,
    Flush = 6,
    Straight = 5,
    ThreeOfAKind = 4,
    TwoPair = 3,
    OnePair = 2,
    HighCard = 1
}

function compareHands(hand1: ArraySchema<Card>, hand2: ArraySchema<Card>): number {
    const rank1 = determineHand(hand1);
    const rank2 = determineHand(hand2);

    if (rank1 > rank2) return 1;
    if (rank1 < rank2) return -1;

    // If hands have the same rank, compare the highest card values
    const values1 = hand1.map(c => c.value).sort((a, b) => b - a);
    const values2 = hand2.map(c => c.value).sort((a, b) => b - a);

    for (let i = 0; i < values1.length; i++) {
        if (values1[i] > values2[i]) return 1;
        if (values1[i] < values2[i]) return -1;
    }

    // Hands are completely equal
    return 0;
};

function determineWinner(hands: ArraySchema<Card>[]): number {
    let winnerIndex = 0;

    for (let i = 1; i < hands.length; i++) {
        if (compareHands(hands[i], hands[winnerIndex]) > 0) {
            winnerIndex = i;
        }
    }

    return winnerIndex;
};

function determineHand(cards: ArraySchema<Card>): PokerHand {
    if (isRoyalFlush(cards)) return PokerHand.RoyalFlush;
    if (isStraightFlush(cards)) return PokerHand.StraightFlush;
    if (isFourOfAKind(cards)) return PokerHand.FourOfAKind;
    if (isFullHouse(cards)) return PokerHand.FullHouse;
    if (isFlush(cards)) return PokerHand.Flush;
    if (isStraight(cards)) return PokerHand.Straight;
    if (isThreeOfAKind(cards)) return PokerHand.ThreeOfAKind;
    if (isTwoPair(cards)) return PokerHand.TwoPair;
    if (isOnePair(cards)) return PokerHand.OnePair;
    return PokerHand.HighCard;
};

function isRoyalFlush(cards: ArraySchema<Card>): boolean {
    return isStraightFlush(cards) && Math.min(...cards.map(c => c.value)) === 10;
};

function isStraightFlush(cards: ArraySchema<Card>): boolean {
    return isFlush(cards) && isStraight(cards);
};

function isFourOfAKind(cards: ArraySchema<Card>): boolean {
    const values = cards.map(c => c.value);
    return hasNOfAKind(values, 4);
};

function isFullHouse(cards: ArraySchema<Card>): boolean {
    const values = cards.map(c => c.value);
    const uniqueValues = Array.from(new Set(values));
    return uniqueValues.length === 2 && (values.filter(v => v === uniqueValues[0]).length === 3 || values.filter(v => v === uniqueValues[1]).length === 3);
};

function isFlush(cards: ArraySchema<Card>): boolean {
    return cards.every(c => c.suite === cards[0].suite);
};

function isStraight(cards: ArraySchema<Card>): boolean {
    const values = cards.map(c => c.value).sort((a, b) => a - b);
    for (let i = 1; i < values.length; i++) {
        if (values[i] !== values[i - 1] + 1) {
            return false;
        }
    }
    return true;
};

function isThreeOfAKind(cards: ArraySchema<Card>): boolean {
    const values = cards.map(c => c.value);
    return hasNOfAKind(values, 3);
};

function isTwoPair(cards: ArraySchema<Card>): boolean {
    const values = cards.map(c => c.value);
    const uniqueValues = Array.from(new Set(values));
    return uniqueValues.length === 3;
};

function isOnePair(cards: ArraySchema<Card>): boolean {
    const values = cards.map(c => c.value);
    const uniqueValues = Array.from(new Set(values));
    return uniqueValues.length === 4;
};

function hasNOfAKind(values: number[], n: number): boolean {
    const counts = values.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);
    return Object.values(counts).some(count => count === n);
};

type Payload = {
    client: Client,
}
type PayloadIndex = Payload & {
    index: number
}

export { determineHand, determineWinner, compareHands, PokerHand, Payload, PayloadIndex };