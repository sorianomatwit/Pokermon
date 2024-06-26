import { Command } from '@colyseus/command';
import Gym from '../rooms/Gym';
import { InPlay, TrainerState } from '../../../Const';


export default class SetOpponentsCommand extends Command<Gym> {

    execute() {
        console.log("making matching");
        //calculate sums
        const { trainers, trainerSums } = this.state;


        const trainerEntries = Array.from(trainerSums.entries());

        trainerEntries.sort((a, b) => a[1] - b[1]);
        const keys = trainerEntries.map(([key, _]) => key);
        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            let val = (k > 1) ? 1 : 0;
            this.state.trainerRankings.set(key, val);
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
            trainer.setState(TrainerState.BASE_BATTLE);
            opponent.opponentId = key;
            opponent.setState(TrainerState.BASE_BATTLE);
            trainer.isReadyToFight = true;
            opponent.isReadyToFight = true;
            trainer.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone = true;
            trainer.cardsInPlay.reverse();
            trainer.cardsInPlay.reverse();
            opponent.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone = true;
            opponent.cardsInPlay.reverse();
            opponent.cardsInPlay.reverse();
        }
        trainerSums.clear();
    }
}