import { Command } from '@colyseus/command';
import SetOpponentsCommand from './SetOpponentsCommand';
import { type Payload } from '../ServerUtils';
import type Gym from '../rooms/Gym';
import { InPlay } from '../../../Const';



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