import { ArraySchema, Schema, type } from '@colyseus/schema';
import Card from './Card';
import { TrainerState } from '../../../../Const';
export default class Trainer extends Schema {
    @type([Card]) public pokerHand: ArraySchema<Card>;
    @type([Card]) public pokeCards: ArraySchema<Card>;
    @type([Card]) public cardsInPlay: ArraySchema<Card>;
    @type('string') public previousState: TrainerState;
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
        this.previousState = TrainerState.CHOOSE;
        this.opponentId = "";
    }

    setState(newState: TrainerState) {
        this.previousState = this.state;
        this.state = newState;
    }

}