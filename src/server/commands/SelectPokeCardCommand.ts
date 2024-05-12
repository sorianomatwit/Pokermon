import { Command } from "@colyseus/command";
import { Client } from 'colyseus';
import Gym from "../src/rooms/Gym";
import DealSumCardsCommand from './DealSumCardsCommand';
import { InPlay } from "../../SharedTypes/Enums";
import { TrainerState } from "../src/rooms/schema/Trainer";

type Payload = {
    client: Client,

    num: number
}

export default class SelectPokeCardCommand extends Command<Gym, Payload> {

    execute(data: Payload) {

        const { client, num: index } = data;
        console.log(`${client.sessionId} selected ${index}`);

        const trainer = this.state.trainers.get(client.sessionId);
        if (!trainer.pokeCards[index]) {
            console.error(`NO CARD TO REMOVED INVALID INDEX ${index}`);
            return;
        }
        trainer.cardsInPlay.push(trainer.pokeCards[index]);
        trainer.cardsInPlay[InPlay.BATTLE].placement = 0;
        trainer.cardsInPlay[InPlay.BATTLE].isRevealedToClient = true;
        trainer.pokeCards.deleteAt(index);
        this.room.dispatcher.dispatch(new DealSumCardsCommand(), {sessionId: client.sessionId, trainer: trainer});
    }
}
