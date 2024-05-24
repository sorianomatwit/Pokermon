import { Command } from '@colyseus/command';
import type Gym from '../rooms/Gym';
import { type PayloadIndex } from '../ServerUtils';
import { TrainerState } from '../../../Const';



export default class DeleteCommand extends Command<Gym, PayloadIndex> {

    execute(data: PayloadIndex) {
        const { client, index } = data;
        const trainerRank = this.state.trainerRankings.get(client.sessionId);
        const card = this.state.draftPile[index];
        if (client.sessionId == this.state.activePlayer && card) {
            card.isRevealedToClient = false;
            card.isRevealedToEveryone = false;
            this.state.pickupPile.push(card);

            this.state.draftPile.splice(index, 1);
            const nextIndex = trainerRank + 1;
            if (nextIndex < this.state.pickOrder.length) {
                this.state.activePlayer = this.state.pickOrder[nextIndex];
            } else {
                for (const [_, trainer] of this.state.trainers) {
                    trainer.setState(TrainerState.DRAFT);
                }
            }
        }

    }
}