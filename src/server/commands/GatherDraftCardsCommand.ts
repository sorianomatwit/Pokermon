import { Client } from 'colyseus';
import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { TrainerState } from '../src/rooms/schema/Trainer';

type Payload = {
    client: Client
}

export default class GatherDraftCardsCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { client } = data;
        const trainer = this.state.trainers.get(client.sessionId);
        

        for (let i = trainer.cardsInPlay.length - 1; i >= 0; i--) {
            const card = trainer.cardsInPlay[i];
            this.state.draftPile.push(card);
            card.isRevealedToEveryone = true;
            card.placement = this.state.draftPile.length - 1;
            trainer.cardsInPlay.deleteAt(i);
        }

        for (const [key, value] of this.state.trainerDraftOrder) {
            console.log(`${key} going ${value}`);
            
        }
    }
}