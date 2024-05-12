import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { ArraySchema } from '@colyseus/schema';
import { Card } from '../src/rooms/schema/Card';
import { Client } from 'colyseus';
import SetOpponentsCommand from './SetOpponentsCommand';
import { InPlay } from '../../SharedTypes/Enums';

type Payload = {
    sessionId: string,
    cards: ArraySchema<Card>
}

export default class CalculateSumCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { sessionId, cards } = data;
        this.state.trainerSums.set(
            sessionId,
            cards[InPlay.SUMONE].value + cards[InPlay.SUMTWO].value
        )
        if (this.state.trainerSums.size == this.state.trainers.size) {
            return new SetOpponentsCommand();
        }
    }
}