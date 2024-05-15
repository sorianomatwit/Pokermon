import { Client } from 'colyseus';
import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { InPlay } from '../../SharedTypes/Enums';
import DetermineWinnerCommand from './DetermineWinnerCommand';
import { TrainerState } from '../src/rooms/schema/Trainer';

type Payload = {
    client: Client,
    index: number
}

export default class TieBreakerCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { client, index } = data;
        const trainer = this.state.trainers.get(client.sessionId)!;
        const opponent = this.state.trainers.get(trainer.opponentId)!;
        const temp = trainer.cardsInPlay[index];
        trainer.cardsInPlay[index] = trainer.cardsInPlay[InPlay.BATTLE];
        trainer.cardsInPlay[InPlay.BATTLE] = temp;
        trainer.isReadyToFight = true;
        const readyToFight = trainer.isReadyToFight && opponent.isReadyToFight;
        console.log("tie selected");
        if (readyToFight) {
            console.log("launch tie fight");
            trainer.setState(trainer.previousState);
            opponent.setState(opponent.previousState);
            this.room.dispatcher.dispatch(new DetermineWinnerCommand(), { client: client });
        }
        console.log(`E0: ${trainer.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone} 1: ${trainer.cardsInPlay[InPlay.SUMONE].isRevealedToEveryone} 2: ${trainer.cardsInPlay[InPlay.SUMTWO].isRevealedToEveryone}`);
        console.log(`C0: ${trainer.cardsInPlay[InPlay.BATTLE].isRevealedToClient} 1: ${trainer.cardsInPlay[InPlay.SUMONE].isRevealedToClient} 2: ${trainer.cardsInPlay[InPlay.SUMTWO].isRevealedToClient}`);

    }
}