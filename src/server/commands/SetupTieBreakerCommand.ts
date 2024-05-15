import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { TrainerState } from '../src/rooms/schema/Trainer';
import { InPlay, Message } from '../../SharedTypes/Enums';
import TieBreakerCommand from './TieBreakerCommand';
import { Client } from 'colyseus';

type Payload = {
    client: Client
}

export default class SetupTieBreakerCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        console.log("set up tie vars");

        const { client } = data;
        const trainer = this.state.trainers.get(client.sessionId)!;
        if (!trainer) return;
        this.room.state.resetAllCardsVisibility(client.sessionId);

        trainer.setState(TrainerState.TIEBREAKER);
        for (let i = 0; i < trainer.cardsInPlay.length; i++) {
            trainer.cardsInPlay[i].isRevealedToClient = true;
            trainer.cardsInPlay[i].placement = i;
        }
        //phantom update
        const temp = trainer.cardsInPlay[InPlay.SUMONE];
        trainer.cardsInPlay[InPlay.SUMONE] = trainer.cardsInPlay[InPlay.SUMTWO];
        trainer.cardsInPlay[InPlay.SUMTWO] = temp;
        console.log(`E0: ${trainer.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone} 1: ${trainer.cardsInPlay[InPlay.SUMONE].isRevealedToEveryone} 2: ${trainer.cardsInPlay[InPlay.SUMTWO].isRevealedToEveryone}`);
        console.log(`C0: ${trainer.cardsInPlay[InPlay.BATTLE].isRevealedToClient} 1: ${trainer.cardsInPlay[InPlay.SUMONE].isRevealedToClient} 2: ${trainer.cardsInPlay[InPlay.SUMTWO].isRevealedToClient}`);
    }
}