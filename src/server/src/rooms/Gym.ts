import { Client, Room } from 'colyseus';
import GameState from './schema/GameState';
import { Dispatcher } from '@colyseus/command';
import { Message } from '../../../SharedTypes/Enums';
import { ArraySchema } from '@colyseus/schema';
import SelectPokeCardCommand from '../../commands/SelectPokeCardCommand';
import SwappingPokeCard from '../../commands/SwappingCardCommand';
import { Trainer } from './schema/Trainer';
import { Card } from './schema/Card';
import DetermineWinnerCommand from '../../commands/DetermineWinnerCommand';

export default class Gym extends Room<GameState> {
    public dispatcher = new Dispatcher(this);

    onCreate(): void | Promise<any> {
        this.maxClients = 4;
        this.setState(new GameState());

        //initialize messages
        //TrainerSelectedPokeCard
        this.onMessage(Message.SelectPokeCard, (client: Client, message: { index: number }) => {
            this.dispatcher.dispatch(new SelectPokeCardCommand(), {
                client: client,
                num: message.index  
            })
        });

        this.onMessage(Message.SwapPokeCard, (client: Client, message: { swap: boolean }) => {
            this.dispatcher.dispatch(new SwappingPokeCard(), {
                client: client,
                bool: message.swap
            })
        });

        this.onMessage(Message.TrainerBattle, (client: Client) => {
            console.log("fight message");
            
            this.dispatcher.dispatch(new DetermineWinnerCommand(), {client: client});
        })
    }
    onJoin(client: Client, options: any) {

        this.state.trainers.set(client.sessionId, new Trainer(client.sessionId));
        //Deal 5 cards
        console.log(`${client.sessionId} joined!`);

        const currentTrainer = this.state.trainers.get(client.sessionId);
        this.dealCards(currentTrainer.pokeCards, 5);
        console.log(this.state.pickupPile.length);

    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
        const currentTrainer = this.state.trainers.get(client.sessionId);
        this.retrieveAllCards(currentTrainer.pokeCards);
        this.retrieveAllCards(currentTrainer.pokerHand);
        this.retrieveAllCards(currentTrainer.cardsInPlay);

        this.state.trainers.delete(client.sessionId);
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
        this.state.trainers.clear();
    }

    public dealCards(cards: ArraySchema<Card>, amount: number = 1) {
        for (let i = 0; i < amount; i++) {

            const rIndex = Math.floor(Math.random() * this.state.pickupPile.length)
            cards.push(this.state.pickupPile[rIndex]);
            const place = cards.length - 1;
            cards[place].placement = place;
            this.state.pickupPile.deleteAt(rIndex);
        }

    }

    private retrieveAllCards(cards: ArraySchema<Card>) {
        for (let i = cards.length - 1; i >= 0; i--) {
            this.state.pickupPile.push(cards[i]);
            cards[i].isRevealedToClient = false;
            cards[i].isRevealedToEveryone = false;
            cards.deleteAt(i);
        }
    }
}