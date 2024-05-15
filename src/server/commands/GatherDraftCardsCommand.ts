import { Client } from 'colyseus';
import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';

type Payload = {
    client: Client
}

export default class GatherDraftCardsCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { client } = data;

        for (const [key,_] of this.state.trainerRankings) {
            const trainer = this.state.trainers.get(key);
            for (let i = trainer.cardsInPlay.length - 1; i >= 0; i--) {
                const card = trainer.cardsInPlay[i];
                this.state.draftPile.push(card);
                card.isRevealedToEveryone = true;
                card.placement = this.state.draftPile.length - 1;

                trainer.cardsInPlay.deleteAt(i);
            }
        }
        console.log(`draft: ${this.state.draftPile.length}`);

        for (const [key, value] of this.state.trainerRankings) {
            this.state.pickOrder[value] = key;
        }
        this.state.activePlayer = this.state.pickOrder[0];
        console.log(this.state.pickOrder[3]);
        
    }
}