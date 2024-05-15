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
        const trainer = this.state.trainers.get(client.sessionId);
        if (!trainer) return;
        if (bool) {
            const temp = trainer.cardsInPlay[InPlay.BATTLE];
            trainer.cardsInPlay[InPlay.BATTLE] = trainer.cardsInPlay[1];
            trainer.cardsInPlay[InPlay.BATTLE].isRevealedToClient = true;
            trainer.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone = false;
            trainer.cardsInPlay[InPlay.SUMONE] = temp;
            trainer.cardsInPlay[InPlay.SUMONE].isRevealedToEveryone = false;
        }
        trainer.cardsInPlay[InPlay.BATTLE].placement = InPlay.BATTLE;
        trainer.cardsInPlay[InPlay.SUMONE].placement = InPlay.SUMONE;
        this.room.dispatcher.dispatch(new CalculateSumCommand(), {client: client})

    }
}