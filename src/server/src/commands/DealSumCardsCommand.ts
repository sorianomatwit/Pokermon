import { Command } from "@colyseus/command";
import { type Payload } from "../ServerUtils";
import type Gym from "../rooms/Gym";
import { InPlay, TrainerState } from "../../../Const";


export default class DealSumCardsCommand extends Command<Gym, Payload> {
    execute(data: Payload) {

        const { client } = data;
        const trainer = this.room.state.trainers.get(client.sessionId);
        this.state.resetAllCardsVisibility(client.sessionId);
        this.room.dealCards(trainer.cardsInPlay, 2);
        trainer.cardsInPlay[InPlay.BATTLE].isRevealedToClient = true;
        trainer.cardsInPlay[InPlay.SUMTWO].isRevealedToEveryone = true;
        trainer.setState(TrainerState.SWAP);
    }
}