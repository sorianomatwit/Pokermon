import { Client } from 'colyseus';
import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { InPlay, Suite } from '../../SharedTypes/Enums';
import { TrainerState } from '../src/rooms/schema/Trainer';
import SetupTieBreakerCommand from './setupTieBreakerCommand';

type Payload = {
    client: Client
}

export default class DetermineWinnerCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { client } = data;
        const sessionId = client.sessionId;
        const trainer = this.state.trainers.get(sessionId)!;
        const opponent = this.state.trainers.get(trainer.opponentId)!;

        let clientCard = trainer.cardsInPlay[InPlay.BATTLE];
        let opponentCard = opponent.cardsInPlay[InPlay.BATTLE];
        clientCard.isRevealedToEveryone = true;

        //type advantage determination
        let clientHasAdvantage: boolean =
            (clientCard.suite == Suite.ELECTRIC && opponentCard.suite == Suite.FLYING) ||
            (clientCard.suite == Suite.FLYING && opponentCard.suite == Suite.GRASS) ||
            (clientCard.suite == Suite.GRASS && opponentCard.suite == Suite.GROUND) ||
            (clientCard.suite == Suite.GROUND && opponentCard.suite == Suite.ELECTRIC);
        let opponentHasAdvantage: boolean =
            (opponentCard.suite == Suite.ELECTRIC && clientCard.suite == Suite.FLYING) ||
            (opponentCard.suite == Suite.FLYING && clientCard.suite == Suite.GRASS) ||
            (opponentCard.suite == Suite.GRASS && clientCard.suite == Suite.GROUND) ||
            (opponentCard.suite == Suite.GROUND && clientCard.suite == Suite.ELECTRIC);

        let clientMultiplier = (clientHasAdvantage) ? 2 : 1;
        let opponentMultiplier = (opponentHasAdvantage) ? 2 : 1;

        const clientPower = clientCard.value * clientMultiplier;
        const opponentPower = opponentCard.value * opponentMultiplier;
        console.log(`${clientCard.suite}${clientCard.value} v ${opponentCard.suite}${opponentCard.value}`);
        console.log(`${clientPower} v ${opponentPower}`);
        
        const hasClientWon = clientPower > opponentPower;
        if (clientPower == opponentPower) {
            trainer.state = TrainerState.TIEBREAKER;
            this.room.dispatcher.dispatch(new SetupTieBreakerCommand(), {sessionId: sessionId});
        } else if(hasClientWon){
            trainer.state = TrainerState.CHAMPION_BATTLE;
        }
    }
}