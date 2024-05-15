import { ArraySchema, Schema, type } from '@colyseus/schema';
import { Card } from './Card';

export enum TrainerState {
    CHOOSE = "CHOOSE",
    SWAP = "SWAP",
    BASE_BATTLE = "BASE_BATTLE",
    CHAMPION_BATTLE = "CHAMPION_BATTLE",
    TIEBREAKER = "TIEBREAKER",
    DELETE = "DELETE",
    DRAFT = "DRAFT"
}


export enum TrainerField {
    pokerHand = 'pokerHand',
    pokeCards = 'pokeCards',
    cardsInPlay = 'cardsInPlay',
    state = 'state'
}
export class Trainer extends Schema {
    @type([Card]) public pokerHand: ArraySchema<Card>;
    @type([Card]) public pokeCards: ArraySchema<Card>;
    @type([Card]) public cardsInPlay: ArraySchema<Card>;
    @type('string') public state: TrainerState;
    @type('string') public opponentId: string; 
    @type('string') public id: string;
    @type('boolean') public isReadyToFight = false;

    constructor(id: string) {
        super();
        this.id = id;
        this.pokerHand = new ArraySchema<Card>();
        this.pokeCards = new ArraySchema<Card>();
        this.cardsInPlay = new ArraySchema<Card>();
        this.state = TrainerState.CHOOSE;
        this.opponentId = "";
    }
}