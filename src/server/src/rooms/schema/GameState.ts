import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';
import { Suite } from '../../../../SharedTypes/Enums';
import { Card } from './Card';
import { Trainer } from './Trainer';



export interface IGameState {
    pickupPile: ArraySchema<Card>;
    trainers: MapSchema<Trainer>;
    draftPile: ArraySchema<Card>;
    trainerRankings: MapSchema<number>;
    activePlayer: string;
    doneFighting: MapSchema<boolean>;

}

export enum GameStateField {
    trainers = 'trainers',
    discardPile = 'trainers',
    pickupPile = 'pickupPile'
}
export default class GameState extends Schema implements IGameState {

    @type([Card]) pickupPile: ArraySchema<Card>;
    @type({ map: Trainer }) trainers: MapSchema<Trainer>;
    @type({ map: 'boolean' }) doneFighting: MapSchema<boolean>;
    @type({ map: 'number' }) trainerRankings: MapSchema<number>;
    @type([Card]) draftPile: ArraySchema<Card>;
    @type('string') activePlayer: string;

    @type({ map: 'number' }) trainerSums: MapSchema<number>;
    @type(['string']) championsIds: ArraySchema<string>;
    @type(['string']) pickOrder: ArraySchema<string>;


    constructor() {
        super();

        this.pickupPile = new ArraySchema<Card>();
        this.draftPile = new ArraySchema<Card>();
        this.trainers = new MapSchema<Trainer>();
        this.trainerRankings = new MapSchema<number>();
        this.doneFighting = new MapSchema<boolean>();

        this.trainerSums = new MapSchema<number>();
        this.championsIds = new ArraySchema<string>();

        this.activePlayer = "";
        this.pickOrder = new ArraySchema<string>(...["","","",""]);

        //initialize Deck
        let k = 2
        for (let i = 2; i <= 14; i++) {
            for (const s of Object.values(Suite)) {
                const image = `sprite_ele_${k.toString()}`;
                const value = i;
                const suite = s;
                this.pickupPile.push(
                    new Card(value, suite, image, -1)
                )
                if (k == 4) k = 2;
                k++;
            }
        }

    }

    public resetAllCardsVisibility(key: string) {
        const trainer = this.trainers.get(key);
        const allCards = [
            ...trainer.pokeCards,
            ...trainer.pokerHand,
            ...trainer.cardsInPlay
        ]
        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            card.isRevealedToClient = false;
            card.isRevealedToEveryone = false;
        }
    }

}
