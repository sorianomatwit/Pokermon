import { Command } from "@colyseus/command";
import CalculateSumCommand from "./CalculateSumCommand";
import Gym from "../rooms/Gym";
import { InPlay } from "../../../Const";
import { Payload } from "../ServerUtils";

type boolPayload = Payload & {
    bool: boolean
}
export default class SwappingPokeCard extends Command<Gym, boolPayload> {

    execute(data: boolPayload) {
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