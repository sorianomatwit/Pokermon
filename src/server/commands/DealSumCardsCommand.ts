import { Command } from "@colyseus/command";
import Gym from "../src/rooms/Gym";
import { Trainer, TrainerState } from "../src/rooms/schema/Trainer";
import { InPlay } from "../../SharedTypes/Enums";

type Payload = {
    sessionId:string,
    trainer: Trainer
}

export default class DealSumCardsCommand extends Command < Gym, Payload > {
    execute(data: Payload) {
        const { sessionId, trainer } = data;
        this.room.dealCards(trainer.cardsInPlay, 2);
        trainer.cardsInPlay[InPlay.SUMTWO].isRevealedToEveryone = true;
        trainer.cardsInPlay[InPlay.SUMTWO].isRevealedToClient = true;        
        trainer.state = TrainerState.SWAP;
    }
}