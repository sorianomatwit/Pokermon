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



    public selectPokeCard(payload: {index: number}) {
        
        if (!this.room) return;
        this.room.send(Message.SelectPokeCard, payload);
    }

    public SwapWithHidden(payload: { swap: boolean }){
        if (!this.room) return;
        this.room.send(Message.SwapPokeCard, payload);
    }

    public fight() {
        console.log("fight");
        
        if (!this.room) return;
        this.room.send(Message.TrainerBattle);
    }

}