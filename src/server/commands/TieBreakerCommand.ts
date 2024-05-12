import { Client } from 'colyseus';
import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';

type Payload = {
    client: Client,
    index: number
}

export default class TieBreakerCommand extends Command<Gym, Payload> {

    execute(data: Payload) {
        //const { client, index } = data;



    }
}