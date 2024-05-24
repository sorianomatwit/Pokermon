
import { Command } from '@colyseus/command';
import type Gym from '../rooms/Gym';
import { compareHands } from '../ServerUtils';
import { TrainerState } from '../../../Const';


export default class DetermineWinnerCommand extends Command<Gym> {

    execute() {
        const { trainers, pickOrder } = this.state;
        let allPokerHands = []
        for (let i = 0; i < pickOrder.length; i++) {
            const key = pickOrder[i];
            allPokerHands.push(trainers.get(key).pokerHand)
        }
        let winnerIndex = 0
        let tieList = []
        for (let i = 1; i < allPokerHands.length; i++) {
            const results = compareHands(allPokerHands[i], allPokerHands[winnerIndex])
            if (results == 0) {
                //tie  
                tieList.push(pickOrder[i]);
            } else if (results > 0) {
                //beat
                winnerIndex = i;
            }
        }
        if (tieList.findIndex((c) => c == pickOrder[winnerIndex]) > 0) {
            console.log("this impossible happened");
        }

        for (const [key, trainer] of trainers) {
            if (key == pickOrder[winnerIndex]) {
                console.log(`winner is ${pickOrder[winnerIndex]}`);

                trainer.state = TrainerState.WIN;
            } else {
                trainer.state = TrainerState.LOSE;
            }
        }

    }
}