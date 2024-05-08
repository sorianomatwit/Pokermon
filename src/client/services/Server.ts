import { Client, Room } from 'colyseus.js';
import Phaser from 'phaser';
import { Message } from '../../SharedTypes/Enums';
import { IGameState } from '../../server/src/rooms/schema/GameState';
import { Schema } from '@colyseus/schema';


export enum ServerEvents {
    OnceStateChange = 'once-state-changed',
    StateChange = 'state-changed'
}
export default class Server {
    private client: Client;
    private events: Phaser.Events.EventEmitter;
    private room?: Room<IGameState & Schema>;
    public sessionID?: string;
    constructor() {
        this.client = new Client('http://localhost:2567');
        this.events = new Phaser.Events.EventEmitter();
    }

    public async join() {
        this.room = await this.client.joinOrCreate<IGameState & Schema>("gym");

        this.sessionID = this.room.sessionId;
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



    public TrainerSelectPokeCard(index: number) {
        if (!this.room) return;
        this.room.send(Message.SelectPokeCard, { index: index });
    }

    public SwapWithHidden(isSwapping: boolean){
        if (!this.room) return;
        this.room.send(Message.SwapPokeCard, { swap: isSwapping });
    }

}