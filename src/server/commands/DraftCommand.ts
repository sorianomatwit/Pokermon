import { Client } from 'colyseus';
import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { TrainerState } from '../src/rooms/schema/Trainer';

type Payload = {
    client: Client,
    index: number
}
export default class DraftCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { client, index } = data;
        const trainerRank = this.state.trainerRankings.get(client.sessionId)!;
        const trainer = this.state.trainers.get(client.sessionId);
        const card = this.state.draftPile[index];
        if (client.sessionId == this.state.activePlayer && card) {
            card.isRevealedToEveryone = false;
            card.isRevealedToClient = true;
            card.placement = trainer?.pokerHand.length;
            trainer?.pokerHand.push(card);
            this.state.draftPile.deleteAt(index);
            const nextIndex = trainerRank - 1;

            if (nextIndex >= 0) {
                this.state.activePlayer = this.state.pickOrder[nextIndex];
            } else {
                for (let i = this.state.draftPile.length  - 1; i >= 0; i--) {
                    const dCard = this.state.draftPile[i]
                    dCard.isRevealedToClient = false;
                    dCard.isRevealedToEveryone = false;
                    this.state.pickupPile.push(dCard);
                    this.state.draftPile.deleteAt(i)
                }
                for (const [_, trainer] of this.state.trainers) {
                    trainer.setState(TrainerState.CHOOSE);
                }
            }
        } else console.error(`${client.sessionId}: ${index} doesn't exist active is ${this.state.activePlayer}`)
    }
}