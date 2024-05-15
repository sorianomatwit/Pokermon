import { Client } from 'colyseus';
import Gym from '../src/rooms/Gym';
import { Command } from '@colyseus/command';
import { TrainerState } from '../src/rooms/schema/Trainer';
import { InPlay } from '../../SharedTypes/Enums';


export default class SetOpponentsCommand extends Command<Gym> {

    execute() {
        console.log("setting opps");

        const { trainers, trainerSums } = this.state;

        const trainerEntries = Array.from(trainerSums.entries());

        trainerEntries.sort((a, b) => a[1] - b[1]);
        const keys = trainerEntries.map(([key, _]) => key);
        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            let val = (k > 1) ? 1 : 0;
            this.state.trainerDraftOrder.set(key, val);
            console.log(`${key} going ${val} with ${this.state.trainerSums.get(key)}`);
            

        }
        //Swap if tie (3rd and 2nd)
        const thirdPlace = 1;
        const secondPlace = 2;
        if (trainerSums.get(keys[thirdPlace])! === trainerSums.get(keys[secondPlace])!) {
            const p1Cards = trainers.get(keys[thirdPlace])!.cardsInPlay;
            const p2Cards = trainers.get(keys[secondPlace])!.cardsInPlay;
            const allCards = [
                p1Cards[InPlay.SUMONE],
                p1Cards[InPlay.SUMTWO],
                p2Cards[InPlay.SUMONE],
                p2Cards[InPlay.SUMTWO]
            ]
            allCards.sort((a, b) => a.value - b.value);
            //p2 does not have the highest card
            if (p2Cards.findIndex((c) => c.value == allCards[allCards.length - 1].value) == -1) {
                //swap
                const temp = trainerEntries[thirdPlace];
                trainerEntries[thirdPlace] = trainerEntries[secondPlace];
                trainerEntries[secondPlace] = temp;
            }
        }
        for (let i = 0; i < keys.length; i += 2) {
            const key = keys[i];
            const oppKey = keys[i + 1];
            const trainer = trainers.get(key)!;
            const opponent = trainers.get(oppKey)!;
            trainer.opponentId = oppKey;
            trainer.state = TrainerState.BASE_BATTLE;
            opponent.opponentId = key;
            opponent.state = TrainerState.BASE_BATTLE;
            trainer.isReadyToFight = true;
            opponent.isReadyToFight = true;
            this.state.resetAllCardsVisibility(key);
            this.state.resetAllCardsVisibility(oppKey);

            trainer.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone = true;
            opponent.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone = true;
        }
        trainerSums.clear();
    }
}