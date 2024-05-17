import { Command } from '@colyseus/command';
import GatherDraftCardsCommand from './GatherDraftCardsCommand';
import SetChampionOpponentsCommand from './SetChampionOpponentsCommand';
import type Gym from '../rooms/Gym';
import { type Payload } from '../ServerUtils';
import type Card from '../rooms/schema/Card';
import { InPlay, Suite, TrainerState } from '../../../Const';
import SetupTieBreakerCommand from './SetupTieBreakerCommand';


let fightCount = 0;
export default class DetermineBattleCommand extends Command<Gym, Payload> {

    private determinePower(clientCard: Card, opponentCard: Card): number {
        let clientHasAdvantage: boolean =
            (clientCard.suite == Suite.ELECTRIC && opponentCard.suite == Suite.FLYING) ||
            (clientCard.suite == Suite.FLYING && opponentCard.suite == Suite.GRASS) ||
            (clientCard.suite == Suite.GRASS && opponentCard.suite == Suite.GROUND) ||
            (clientCard.suite == Suite.GROUND && opponentCard.suite == Suite.ELECTRIC);
        let clientMultiplier = (clientHasAdvantage) ? 2 : 1;
        return clientCard.value * clientMultiplier;
    }

    execute(data: Payload) {
        const { client } = data;
        const trainer = this.state.trainers.get(client.sessionId);
        const opponent = this.state.trainers.get(trainer.opponentId);
        if (!trainer.isReadyToFight) return;
        fightCount++;
        let clientCard = trainer.cardsInPlay[InPlay.BATTLE];
        let opponentCard = opponent.cardsInPlay[InPlay.BATTLE];
        console.log(`${client.sessionId} opponent is ${trainer.opponentId}`);

        const clientPower = this.determinePower(clientCard, opponentCard);
        const opponentPower = this.determinePower(opponentCard, clientCard);

        const hasClientWon = clientPower > opponentPower;
        trainer.isReadyToFight = false;
        console.log(`${trainer.id} v ${opponent.id} ${hasClientWon}`);
        if (hasClientWon) {
            trainer.opponentId = "";
            if (trainer.state == TrainerState.BASE_BATTLE && this.state.trainers.size > 2) {
                trainer.setState(TrainerState.CHAMPION_BATTLE);

                this.room.dispatcher.dispatch(new SetChampionOpponentsCommand(), { client: client })
            } else {
                let val = this.state.trainerRankings.get(client.sessionId) + 1;
                this.state.trainerRankings.set(client.sessionId, val);
                console.log(`${client.sessionId} is the champion`);

                trainer.setState(TrainerState.DELETE);
            }

        } else if (clientPower == opponentPower) {
            
            this.room.dispatcher.dispatch(new SetupTieBreakerCommand(), { client: client });
            return;
        } else {
            trainer.opponentId = "";
            trainer.setState(TrainerState.DELETE);
        }

        if (trainer.state == TrainerState.DELETE) {
            console.log(fightCount);
            this.room.dispatcher.dispatch(new GatherDraftCardsCommand(), { client: client });
        }
    }
}