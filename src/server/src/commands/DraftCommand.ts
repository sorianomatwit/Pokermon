import { Command } from '@colyseus/command';
import DetermineWinnerCommand from './DetermineWinnerCommand';
import type Gym from '../rooms/Gym';
import { TrainerState } from '../../../Const';
import { type PayloadIndex } from '../ServerUtils';


export default class DraftCommand extends Command<Gym, PayloadIndex> {

    execute(data: PayloadIndex) {
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
            } else if (trainer.pokerHand.length < 5) {
                for (let i = this.state.draftPile.length - 1; i >= 0; i--) {
                    const dCard = this.state.draftPile[i]
                    dCard.isRevealedToClient = false;
                    dCard.isRevealedToEveryone = false;
                    this.state.pickupPile.push(dCard);
                    this.state.draftPile.deleteAt(i)
                }
                for (const [_, trainer] of this.state.trainers) {
                    trainer.cardsInPlay.clear();
                    trainer.setState(TrainerState.CHOOSE);
                }
            } else {
                return new DetermineWinnerCommand()
            }
        } else console.error(`${client.sessionId}: ${index} doesn't exist active is ${this.state.activePlayer}`)
    }
}