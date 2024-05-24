import { Client } from 'colyseus';
import { Command } from '@colyseus/command';
import Gym from '../rooms/Gym';
import { InPlay } from '../../../Const';
import { PayloadIndex } from '../ServerUtils';



export default class TieBreakerCommand extends Command<Gym, PayloadIndex> {

    execute(data: PayloadIndex) {
        const { client, index } = data;
        const trainer = this.state.trainers.get(client.sessionId)!;
        const opponent = this.state.trainers.get(trainer.opponentId)!;
        const oldBattleCard = trainer.cardsInPlay[InPlay.BATTLE];
        const newBattleCard = trainer.cardsInPlay[index];
        newBattleCard.placement = InPlay.BATTLE;
        oldBattleCard.placement = index;

        trainer.cardsInPlay[InPlay.BATTLE] = newBattleCard;
        trainer.cardsInPlay[index] = oldBattleCard;

        trainer.isReadyToFight = true;

        trainer.cardsInPlay[InPlay.SUMONE].isRevealedToClient = false;
        trainer.cardsInPlay[InPlay.SUMTWO].isRevealedToClient = false;
        trainer.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone = true;
        trainer.setState(trainer.previousState);

    }
}