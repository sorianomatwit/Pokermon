import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { TrainerState } from '../src/rooms/schema/Trainer';

type Payload = {
    client: Client,
    index: number
}

export default class DeleteCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { client, index } = data;
        const trainerRank = this.state.trainerRankings.get(client.sessionId);
        const card = this.state.draftPile[index];
        if (client.sessionId == this.state.activePlayer && card) {
            this.state.draftPile.deleteAt(index);
            card.isRevealedToClient = false;
            card.isRevealedToEveryone = false;
            this.state.pickupPile.push(card);
            const nextIndex = trainerRank + 1;
            console.log(`${nextIndex} cap ${ this.state.pickOrder.length}`);
            
            if (nextIndex < this.state.pickOrder.length) {
                this.state.activePlayer = this.state.pickOrder[nextIndex];
            } else {
                for (const [_,trainer] of this.state.trainers) {
                    trainer.setState(TrainerState.DRAFT);
                }
            }
        } else console.error(`${client.sessionId} rank ${trainerRank} doesn't exist active is ${this.state.activePlayer}`)

    }
}