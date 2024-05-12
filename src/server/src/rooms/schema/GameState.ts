import { Schema, type, ArraySchema, MapSchema } from '@colyseus/schema';
import { Suite } from '../../../../SharedTypes/Enums';
import { Card } from './Card';
import { Trainer } from './Trainer';



export interface IGameState {
    pickupPile: ArraySchema<Card>;
    discardPile: ArraySchema<Card>;
    trainers: MapSchema<Trainer>;
    trainerSums: MapSchema<number>;
    draftPile: ArraySchema<Card>;
    trainerDraftOrder: MapSchema<number>;

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
    @type({ map: 'number' }) trainerSums: MapSchema<number>;
    @type({ map: 'number' }) trainerDraftOrder: MapSchema<number>;
    @type([Card]) draftPile: ArraySchema<Card>;


    constructor() {
        super();

        this.pickupPile = new ArraySchema<Card>();
        this.discardPile = new ArraySchema<Card>();
        this.draftPile = new ArraySchema<Card>();
        this.trainers = new MapSchema<Trainer>();
        this.trainerSums = new MapSchema<number>();
        this.trainerDraftOrder = new MapSchema<number>();

        //initialize Deck
        let k = 2
        for (let i = 2; i <= 14; i++) {
            for (const s of Object.values(Suite)) {
                const image = `sprite_ele_${k.toString()}`;
                const value = 4//i;
                const suite = Suite.ELECTRIC//s;
                this.pickupPile.push(
                    new Card(i, s, image, -1)
                )
                if (k == 4) k = 2;
                k++;
            }
        }

        //battle init
    }
}
