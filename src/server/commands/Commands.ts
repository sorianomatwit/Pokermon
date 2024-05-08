import { Command } from "@colyseus/command";
import { Client } from 'colyseus';
import Gym from "../src/rooms/Gym";
import { Message } from "../../SharedTypes/Enums";
import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema';
import { Card } from "../src/rooms/schema/GameState";

type numberPayload = {
    client: Client,

    num: number
}
type booleanPayLoad = {
    client: Client,

    bool: boolean
}

export class SelectPokeCardCommand extends Command<Gym, numberPayload> {

    execute(data: numberPayload) {

        const { client, num: index } = data;
        console.log(`${client.sessionId} selected ${index}`);

        const currentTrainer = this.state.trainers.get(client.sessionId);
        if (!currentTrainer.pokeCards[index]) {
            console.error(`NO CARD TO REMOVED INVALID INDEX ${index}`);
            return;
        }
        currentTrainer.cardsInPlay.push(currentTrainer.pokeCards[index]);
        currentTrainer.cardsInPlay[0].placement = 0;
        currentTrainer.cardsInPlay[0].isRevealedToClient = true;
        currentTrainer.pokeCards.deleteAt(index);
        //Transition to phase 2 DeaL 2 cards and Reveal only 1
        this.room.dealCards(currentTrainer.cardsInPlay, 2);
        currentTrainer.cardsInPlay[2].isRevealedToOthers = true;
        currentTrainer.cardsInPlay[2].isRevealedToClient = true;

    }
}

export class isSwappingPokeCard extends Command<Gym, booleanPayLoad> {

    execute(data: booleanPayLoad) {

        const { client, bool } = data;
        const currentTrainer = this.state.trainers.get(client.sessionId);

        if (bool) {
            console.log("swapping");
            const temp = currentTrainer.cardsInPlay[0];
            temp.isRevealedToClient = false;
            temp.isRevealedToOthers = false;
            currentTrainer.cardsInPlay[0] = currentTrainer.cardsInPlay[1];
            currentTrainer.cardsInPlay[0].isRevealedToClient = true;
            currentTrainer.cardsInPlay[0].isRevealedToOthers = false;
            currentTrainer.cardsInPlay[1] = temp;
        }

        //calculate order 
        this.state.trainerSums.set(
            client.sessionId,
            currentTrainer.cardsInPlay[1].value + currentTrainer.cardsInPlay[2].value
        )

        if(this.state.trainerSums.size == this.state.trainers.size){
            
            
        }
    }
}