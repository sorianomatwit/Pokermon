
import { Command } from '@colyseus/command';
import type Gym from '../rooms/Gym';
import { determineWinner } from '../ServerUtils';
import { TrainerState } from '../../../Const';


export default class DetermineWinnerCommand extends Command<Gym> {

    execute() {
        const { trainers, pickOrder } = this.state;
        let allPokerHands = []
        for (let i = 0; i < pickOrder.length; i++) {
            const key = pickOrder[i];
            allPokerHands.push(trainers.get(key).pokerHand)
        }
        const winnerIndex = determineWinner(allPokerHands);

        for (const [key, trainer] of trainers) {
            if(key == pickOrder[winnerIndex]){
                console.log(`winner is ${pickOrder[winnerIndex]}`);
                
                trainer.state = TrainerState.WIN;
            } else {
                trainer.state = TrainerState.LOSE;
            }
        }
        
    }
}