import { Command } from "@colyseus/command";
import DealSumCardsCommand from './DealSumCardsCommand';
import { type PayloadIndex } from "../ServerUtils";
import type Gym from "../rooms/Gym";
import { InPlay } from "../../../Const";



export default class SelectPokeCardCommand extends Command<Gym, PayloadIndex> {

    execute(data: PayloadIndex) {

        const { client, index } = data;
        
        const trainer = this.state.trainers.get(client.sessionId);
        if (!trainer.pokeCards[index]) {
            console.error(`NO CARD TO REMOVED INVALID INDEX ${index}`);
            return;
        }
        trainer.cardsInPlay.push(trainer.pokeCards[index]);
        trainer.cardsInPlay[InPlay.BATTLE].placement = 0;
        trainer.pokeCards.deleteAt(index);
        this.room.dispatcher.dispatch(new DealSumCardsCommand(), { client: client });
    }
}
