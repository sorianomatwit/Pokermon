import { Command } from '@colyseus/command';
import { type Payload } from '../ServerUtils';
import type Gym from '../rooms/Gym';
import { InPlay, TrainerState } from '../../../Const';



export default class SetupTieBreakerCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        console.log("TIE!!!");

        const { client } = data;
        const trainer = this.state.trainers.get(client.sessionId)!;
        if (!trainer) return;

        trainer.setState(TrainerState.TIEBREAKER);
        this.room.state.resetAllCardsVisibility(client.sessionId);

        const temp = trainer.cardsInPlay[InPlay.SUMONE];
        trainer.cardsInPlay[InPlay.SUMONE] = trainer.cardsInPlay[InPlay.SUMTWO];
        trainer.cardsInPlay[InPlay.SUMTWO] = temp;
        
        for (let i = 0; i < trainer.cardsInPlay.length; i++) {
            trainer.cardsInPlay[i].isRevealedToClient = true;
            trainer.cardsInPlay[i].placement = i;
        }

    }
}