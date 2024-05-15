import { Client } from 'colyseus';
import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { InPlay, Suite } from '../../SharedTypes/Enums';
import { TrainerState } from '../src/rooms/schema/Trainer';
import SetupTieBreakerCommand from './setupTieBreakerCommand';
import { Card } from '../src/rooms/schema/Card';
import GatherDraftCardsCommand from './GatherDraftCardsCommand';
import SetChampionOpponentsCommand from './SetChampionOpponentsCommand';

type Payload = {
    client: Client
}
let fightCount = 0;
export default class DetermineWinnerCommand extends Command<Gym, Payload> {

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
        if (trainer.state == TrainerState.DELETE) {
            console.log(`triggered battle even tho finished ${client.sessionId} ${this.state.doneFighting.get(client.sessionId)}`);
            return;
        }
        fightCount++;
        let clientCard = trainer.cardsInPlay[InPlay.BATTLE];
        let opponentCard = opponent.cardsInPlay[InPlay.BATTLE];


        const clientPower = this.determinePower(clientCard, opponentCard);
        const opponentPower = this.determinePower(opponentCard, clientCard);

        const hasClientWon = clientPower > opponentPower;
        trainer.isReadyToFight = false;
        console.log(`${trainer.id} v ${opponent.id} ${hasClientWon}`);

        if (hasClientWon) {

            if (trainer.state == TrainerState.BASE_BATTLE) {
                trainer.setState(TrainerState.CHAMPION_BATTLE);

                this.room.dispatcher.dispatch(new SetChampionOpponentsCommand(), { client: client })
            } else {
                let val = this.state.trainerRankings.get(client.sessionId) + 1;
                this.state.trainerRankings.set(client.sessionId, val);
                trainer.setState(TrainerState.DELETE);
            }
        } else if (clientPower == opponentPower) {
            this.room.dispatcher.dispatch(new SetupTieBreakerCommand(), { client: client });
            return;
        } else {
            trainer.setState(TrainerState.DELETE);
        }
        //@ts-expect-error
        let outcome = trainer.state == TrainerState.DELETE;
        this.state.doneFighting.set(client.sessionId, outcome);

        let count = 0;
        for (const [key, value] of this.state.doneFighting) {
            if (value) count++;
        }
        if (count == this.state.trainers.size) {
            console.log(fightCount);

            this.room.dispatcher.dispatch(new GatherDraftCardsCommand(), { client: client });
        }
    }
}