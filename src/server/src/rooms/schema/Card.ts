import { Schema, type } from '@colyseus/schema';
import { Suite } from '../../../../Const';

export default class Card extends Schema {
    @type('boolean') public isRevealedToEveryone: boolean;
    @type('boolean') public isRevealedToClient: boolean;
    @type('string') public imageString: string;
    @type('number') public value: number;
    @type('string') public suite: Suite;
    @type('number') public placement: number;

    constructor(value: number, suite: Suite, image: string, placement: number) {
        super();
        this.isRevealedToEveryone = false;
        this.isRevealedToClient = false;
        this.value = value;
        this.suite = suite;
        this.imageString = image;
        this.placement = placement;
    }
}