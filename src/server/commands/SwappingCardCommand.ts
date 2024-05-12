import { Client } from "colyseus";
import Gym from "../src/rooms/Gym";
import { Command } from "@colyseus/command";
import CalculateSumCommand from "./CalculateSumCommand";
import { InPlay } from "../../SharedTypes/Enums";

type Payload = {
    client: Client,

    bool: boolean
}
export default class SwappingPokeCard extends Command<Gym, Payload> {

    execute(data: Payload) {

        const { client, bool } = data;
        const currentTrainer = this.state.trainers.get(client.sessionId);
        if (!currentTrainer) return;

        if (bool) {
            console.log("swapping");
            const temp = currentTrainer.cardsInPlay[0];

            temp.isRevealedToClient = false;
            temp.isRevealedToEveryone = false;
            currentTrainer.cardsInPlay[InPlay.BATTLE] = currentTrainer.cardsInPlay[1];
            currentTrainer.cardsInPlay[InPlay.BATTLE].isRevealedToClient = true;
            currentTrainer.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone = false;
            currentTrainer.cardsInPlay[InPlay.SUMONE] = temp;
        }
        currentTrainer.cardsInPlay[InPlay.BATTLE].placement = InPlay.BATTLE;
        currentTrainer.cardsInPlay[InPlay.SUMONE].placement = InPlay.SUMONE;
        this.room.dispatcher.dispatch(new CalculateSumCommand(), {
            cards: currentTrainer.cardsInPlay,
            sessionId: client.sessionId
        })
    }
}