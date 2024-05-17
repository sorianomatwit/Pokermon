import { Command } from '@colyseus/command';
import type Gym from '../rooms/Gym';
import { type Payload } from '../ServerUtils';



export default class SetChampionOpponentsCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { client } = data;
        this.state.championsIds.push(client.sessionId)
        if(this.state.championsIds.length == 2){
            const p1 = this.state.championsIds[0];
            const p2 = this.state.championsIds[1];
            this.state.trainers.get(p1).isReadyToFight = true;
            this.state.trainers.get(p2).isReadyToFight = true;
            this.state.trainers.get(p1).opponentId = p2;
            this.state.trainers.get(p2).opponentId = p1;
            this.state.championsIds.clear();
            this.state.trainerRankings.set(p1, 2);
            this.state.trainerRankings.set(p2, 2);
        }
    }
}