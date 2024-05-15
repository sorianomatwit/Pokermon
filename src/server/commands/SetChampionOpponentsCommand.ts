import { Client } from 'colyseus';
import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';

type Payload = {
    client: Client
}

export default class SetChampionOpponentsCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        const { client } = data;
        this.state.championsIds.push(client.sessionId)
        if(this.state.championsIds.length == 2){
            const p1 = this.state.championsIds[0];
            const p2 = this.state.championsIds[1];
            this.state.trainers.get(p1).opponentId = p2;
            this.state.trainers.get(p2).opponentId = p1;
            this.state.championsIds.clear();
            this.state.trainerDraftOrder.set(p1, 2);
            this.state.trainerDraftOrder.set(p2, 2);
        }
    }
}