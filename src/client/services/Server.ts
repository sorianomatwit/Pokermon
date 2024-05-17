import { Client, Room } from 'colyseus.js';
import Phaser from 'phaser';
import { IGameState, Message } from '../../Const';
import { Schema } from '@colyseus/schema';


export enum ServerEvents {
    OnceStateChange = 'once-state-changed',
    StateChange = 'state-changed'
}
export default class Server {
    private client: Client;
    private events: Phaser.Events.EventEmitter;
    public room!: Room<IGameState & Schema>;
    public sessionId?: string;
    constructor() {
        this.client = new Client('http://localhost:2567');
        this.events = new Phaser.Events.EventEmitter();
    }

    public async join() {
        this.room = await this.client.joinOrCreate<IGameState & Schema>("gym");

        this.sessionId = this.room.sessionId;
        this.room.onStateChange.once((state) => {
            this.events.emit(ServerEvents.OnceStateChange, state);
        })

        this.room.onStateChange((state) => {
            this.events.emit(ServerEvents.StateChange, state);
        })


    }

    public onceStateChanged(callBack: (state: any) => void, context?: any) {
        this.events.once(ServerEvents.OnceStateChange, callBack, context);
    }
    public stateChanged(callBack: (state: any) => void, context?: any) {
        this.events.on(ServerEvents.StateChange, callBack, context);
    }


    public sendMessage<T>(message: Message, payload?: T) {
        if (!this.room) return;
        this.room.send(message, payload);
    }


}