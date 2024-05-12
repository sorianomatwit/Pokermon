import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { TrainerState } from '../src/rooms/schema/Trainer';

type Payload = {
    sessionId: string
}

export default class SetupTieBreakerCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { sessionId } = data;
        const trainer = this.state.trainers.get(sessionId)!;
        trainer.state = TrainerState.TIEBREAKER;
        const cards = trainer.cardsInPlay;
        for (let i = 0; i < cards.length; i++) {
            cards[i].isRevealedToClient = true;
            cards[i].isRevealedToEveryone = false;
            cards[i].placement = i;
        }
 
    }
}