import { type ArraySchema } from '@colyseus/schema';
import GameCard from './GameCard';
import type Card from '../../server/src/rooms/schema/Card';
import type Trainer from '../../server/src/rooms/schema/Trainer';
import { type TrainerState } from '../../Const';

export default class GameTrainer {
    public pokeCards: GameCard[] = [];
    public pokerHand: GameCard[] = [];
    public cardsInPlay: GameCard[] = [];
    public state: TrainerState;
    public opponentId: string = "";
    public isReadyToFight = false;
    constructor(private scene: Phaser.Scene, private trainer: Trainer) {
        this.state = trainer.state;
        this.isReadyToFight = trainer.isReadyToFight;
        trainer.pokeCards.forEach((c: Card, index: number) => {
            this.pokeCards[index] = new GameCard(this.scene, c);
        });
        trainer.pokerHand.forEach((c: Card, index: number) => {
            this.pokerHand[index] = new GameCard(this.scene, c);
        });
        trainer.cardsInPlay.forEach((c: Card, index: number) => {
            this.cardsInPlay[index] = new GameCard(this.scene, c);
        });
    }
    get sessionId(): string {
        return this.trainer.id;
    }
    destroy() {
        const allCards = [
            ...this.pokeCards,
            ...this.pokerHand,
            ...this.cardsInPlay
        ]
        for (let i = 0; i < allCards.length; i++) {
            const card = allCards[i];
            card.sprite.destroy();
        }
    }
    setTrainer(trainer: Trainer) {
        this.trainer = trainer;
        this.state = trainer.state;
        this.isReadyToFight = trainer.isReadyToFight;

        this.opponentId = trainer.opponentId;
        if (trainer.pokeCards.length > this.pokeCards.length)
            this.addToHand(trainer.pokeCards, this.pokeCards);
        else this.setHand(trainer.pokeCards, this.pokeCards);

        if (trainer.pokerHand.length > this.pokerHand.length)
            this.addToHand(trainer.pokerHand, this.pokerHand);
        else this.setHand(trainer.pokerHand, this.pokerHand);

        if (trainer.cardsInPlay.length > this.cardsInPlay.length) {

            this.addToHand(trainer.cardsInPlay, this.cardsInPlay);
        }
        else {

            this.setHand(trainer.cardsInPlay, this.cardsInPlay);
        }

    }

    private addToHand(serverHand: ArraySchema<Card>, clientHand: GameCard[]) {
        serverHand.forEach((c: Card, index: number) => {
            if (clientHand[index]) clientHand[index].sprite.destroy();
            clientHand[index] = new GameCard(this.scene, c);
        });
    }
    private setHand(serverHand: ArraySchema<Card>, clientHand: GameCard[]) {
        for (let i = clientHand.length - 1; i >= 0; i--) {
            if (i < serverHand.length) {

                clientHand[i].setCard(serverHand[i]);
            } else {

                //TODO don't destroy image have it move position but still remove it from array   
                clientHand[i].sprite.destroy();
                clientHand.splice(i, 1);

            }
        }

    }
}