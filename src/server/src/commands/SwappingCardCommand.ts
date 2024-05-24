import { Command } from "@colyseus/command";
import Gym from "../rooms/Gym";
import { InPlay } from "../../../Const";
import { Payload } from "../ServerUtils";
import SetOpponentsCommand from "./SetOpponentsCommand";

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
            trainer.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone = false;
            trainer.cardsInPlay[InPlay.BATTLE].isRevealedToClient = false;
            trainer.cardsInPlay[InPlay.SUMONE].isRevealedToEveryone = false;
            trainer.cardsInPlay[InPlay.SUMONE].isRevealedToClient = true;
            trainer.cardsInPlay[InPlay.BATTLE] = trainer.cardsInPlay[InPlay.SUMONE];
            trainer.cardsInPlay[InPlay.SUMONE] = temp;
        }
        trainer.cardsInPlay[InPlay.BATTLE].placement = InPlay.BATTLE;
        trainer.cardsInPlay[InPlay.SUMONE].placement = InPlay.SUMONE;
        
        this.state.trainerSums.set(
            client.sessionId,
            trainer.cardsInPlay[InPlay.SUMONE].value + trainer.cardsInPlay[InPlay.SUMTWO].value
        )
        if (this.state.trainerSums.size == this.state.trainers.size) {
            return new SetOpponentsCommand();
        }

    }
}