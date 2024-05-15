import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { ArraySchema } from '@colyseus/schema';
import { Card } from '../src/rooms/schema/Card';
import { Client } from 'colyseus';
import SetOpponentsCommand from './SetOpponentsCommand';
import { InPlay } from '../../SharedTypes/Enums';

type Payload = {
    client: Client,
}

export default class CalculateSumCommand extends Command<Gym, Payload> {
    
    execute(data: Payload) {
        const { client } = data;
        const cards = this.state.trainers.get(client.sessionId).cardsInPlay;
        this.state.trainerSums.set(
            client.sessionId,
            cards[InPlay.SUMONE].value + cards[InPlay.SUMTWO].value
        )
        if (this.state.trainerSums.size == this.state.trainers.size) {
            return new SetOpponentsCommand();
        }
    }
}