import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';
import { Suite } from '../../../../SharedTypes/Enums';

export interface ICard {
    isRevealedToOthers: boolean;
    isRevealedToClient: boolean;
    imageString: string;
    value: number;
    suite: Suite;
}
export class Card extends Schema implements ICard {
    @type('boolean') public isRevealedToOthers: boolean;
    @type('boolean') public isRevealedToClient: boolean;
    @type('string') public imageString: string;
    @type('number') public value: number;
    @type('string') public suite: Suite;
    @type('number') public placement: number;

    constructor(isTotalReveal: boolean, isRevealed: boolean, value: number, suite: Suite, image: string, placement: number) {
        super();
        this.isRevealedToOthers = isTotalReveal;
        this.isRevealedToClient = isRevealed;
        this.value = value;
        this.suite = suite;
        this.imageString = image;
        this.placement = placement;
    }
}
export interface ITrainer {
    pokerHand: ArraySchema<Card>;
    pokeCards: ArraySchema<Card>;
    cardsInPlay: ArraySchema<Card>;
}

export enum TrainerField {
    pokerHand = 'pokerHand',
    pokeCards = 'pokeCards',
    cardsInPlay = 'cardsInPlay'
}
export class Trainer extends Schema implements ITrainer {
    @type([Card]) public pokerHand: ArraySchema<Card>;
    @type([Card]) public pokeCards: ArraySchema<Card>;
    @type([Card]) public cardsInPlay: ArraySchema<Card>;

    constructor() {
        super();
        this.pokerHand = new ArraySchema<Card>();
        this.pokeCards = new ArraySchema<Card>();
        this.cardsInPlay = new ArraySchema<Card>();
    }
}

export interface IGameState {
    pickupPile: ArraySchema<Card>;
    discardPile: ArraySchema<Card>;
    trainers: MapSchema<Trainer>;
    trainerSums: MapSchema<number>;
    draftPile: ArraySchema<Card>;
}

export enum GameStateField {
    trainers = 'trainers',
    discardPile = 'trainers',
    pickupPile = 'pickupPile'
}
export default class GameState extends Schema implements IGameState {

    @type([Card]) pickupPile: ArraySchema<Card>;
    @type([Card]) discardPile: ArraySchema<Card>;
    @type({ map: Trainer }) trainers: MapSchema<Trainer>;
    @type({map: 'number'}) trainerSums: MapSchema<number>;
    @type([Card]) draftPile: ArraySchema<Card>;

    //pairings
    @type(['string']) clientPairs: ArraySchema<string>;

    constructor() {
        super();
        this.clientPairs = new ArraySchema<string>();

        this.pickupPile = new ArraySchema<Card>();
        this.discardPile = new ArraySchema<Card>();
        this.draftPile = new ArraySchema<Card>();
        this.trainers = new MapSchema<Trainer>();
        this.trainerSums = new MapSchema<number>();

        //initialize Deck
        let k = 2
        for (let i = 2; i <= 14; i++) {
            for (const s of Object.values(Suite)) {
                const image = `sprite_${s.toString()}_${k.toString()}`;
                this.pickupPile.push(
                    new Card(false, false, k, s, image,-1)
                )
                if(k == 4) k = 2;
                k++;
            }
        }
    }
}
