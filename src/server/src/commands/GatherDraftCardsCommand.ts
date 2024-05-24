import { Command } from '@colyseus/command';
import {type Payload } from '../ServerUtils';
import type Gym from '../rooms/Gym';



export default class GatherDraftCardsCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { client } = data;
        const key = client.sessionId;
        const trainer = this.state.trainers.get(key);
        const rank = this.state.trainerRankings.get(key);
        for (let i = trainer.cardsInPlay.length - 1; i >= 0; i--) {
            const card = trainer.cardsInPlay[i];
            this.state.draftPile.push(card);
            card.isRevealedToEveryone = true;
            card.placement = this.state.draftPile.length - 1;
        }

        this.state.pickOrder[rank] = key;
        let playerCount = 0;
        for (let index = 0; index < this.state.pickOrder.length; index++) {
            if (this.state.pickOrder[index].length > 0) {
                playerCount++;
            }
        }
        if (playerCount == this.state.pickOrder.length){
            this.state.activePlayer = this.state.pickOrder[0];
        }
        
    }
}