import Phaser from 'phaser'
import type Server from '../services/Server';
import { IGameState, Trainer, Card, TrainerField } from '../../server/src/rooms/schema/GameState';
import { ArraySchema } from '@colyseus/schema';
import { allSprites } from './Assets';

enum GamePhase {
    ONE,
    TWO,
    THREE
}

class GameCard {
    static cardCount = 0;
    public sprite: Phaser.GameObjects.Sprite;

    constructor(public scene: Phaser.Scene, public cardData: Card) {

        this.sprite = this.scene.add.sprite(0, 0, 'back')
        GameCard.cardCount++;
    }

    public setPosition = (x: number, y: number) => this.sprite.setPosition(x, y);

    public show(isShow: boolean) {
        if (isShow) {
            this.sprite.setTexture(this.cardData.imageString);
        } else this.sprite.setTexture('back');
    }

    public setCard(card: Card) {
        this.cardData = card;
    }

}

class GameTrainer {
    public pokeCards: GameCard[] = [];
    public pokerHand: GameCard[] = [];
    public cardsInPlay: GameCard[] = [];
    constructor(private scene: Phaser.Scene, trainer: Trainer) {
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
    setTrainer(trainer: Trainer) {

        //TODO make a transfer function  
        if (trainer.pokeCards.length > this.pokeCards.length)
            this.addToHand(trainer.pokeCards, this.pokeCards);
        else this.setHand(trainer.pokeCards, this.pokeCards);

        if (trainer.pokerHand.length > this.pokerHand.length)
            this.addToHand(trainer.pokerHand, this.pokerHand);
        else this.setHand(trainer.pokerHand, this.pokerHand);

        if (trainer.cardsInPlay.length > this.cardsInPlay.length)
            this.addToHand(trainer.cardsInPlay, this.cardsInPlay);
        else this.setHand(trainer.cardsInPlay, this.cardsInPlay);

        if (this.cardsInPlay.length > 0) {
            this.cardsInPlay.forEach(c => console.log(c.cardData));

        }

    }

    private addToHand(serverHand: ArraySchema<Card>, clientHand: GameCard[]) {
        serverHand.forEach((c: Card, index: number) => {
            clientHand[index] = new GameCard(this.scene, c);
        });
    }
    private setHand(serverHand: ArraySchema<Card>, clientHand: GameCard[]) {
        for (let i = clientHand.length - 1; i >= 0; i--) {
            if (i < serverHand.length) {
                const c = clientHand[i];
                c.setCard(serverHand[i]);
            } else {
                //TODO don't destroy image have it move position but still remove it from array   
                clientHand[i].sprite.destroy();
                clientHand.splice(i, 1);

            }
        }

    }
}
export default class Game extends Phaser.Scene {

    private server?: Server
    private trainersDisplay: Map<string, GameTrainer> = new Map();
    private currentPhase: GamePhase = GamePhase.ONE;

    constructor() {
        super({ key: 'game' });
    }

    preload() {
        this.load.image(allSprites);

    }
    async create(data: { server: Server }) {
        const { server } = data;

        this.server = server;
        if (!this.server) throw new Error('server instance missing');
        await server.join();


        this.server.onceStateChanged(this.createGameScene, this);
        this.server.stateChanged(this.updateGameVars, this);
    }

    private createGameScene(state: IGameState) {

        const { trainers } = state;

        for (const [key, value] of trainers) {
            console.log("new trainer");
            const trainer = new GameTrainer(this, value);
            this.trainersDisplay.set(key, trainer);
        }

    }

    private updateGameVars(state: IGameState) {

        if (!this.server?.sessionID) return;
        const { trainers } = state;
        if (trainers.size > this.trainersDisplay.size) {
            for (const [key, trainer] of trainers) {
                if (this.trainersDisplay.has(key)) {
                    this.trainersDisplay.get(key)?.setTrainer(trainer);
                } else this.trainersDisplay.set(key, new GameTrainer(this, trainer));
            }
        }
        else {
            for (const [key] of this.trainersDisplay) {
                const trainer = trainers.get(key);
                if (trainer) {
                    this.trainersDisplay.get(key)?.setTrainer(trainer);
                } else {
                    this.trainersDisplay.delete(key);
                }
            }
        }

        if(this.currentPhase == GamePhase.ONE)
            this.drawCards(TrainerField.pokeCards, .5, .85);
        //else this.visibleCards(TrainerField.pokeCards, false);
        if (this.currentPhase !== GamePhase.THREE) {
            this.drawCards(TrainerField.cardsInPlay, .5, .6);
        }

            //Check input 
            let currentTrainer = this.trainersDisplay.get(this.server.sessionID);
            if (!currentTrainer) return;
            let cards: GameCard[] = [];
            cards = this.getCards(TrainerField.pokeCards, currentTrainer);
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                card.sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                    if (this.currentPhase == GamePhase.ONE) {
                        this.server?.TrainerSelectPokeCard(i);
                        console.log(card.cardData);

                        this.currentPhase = GamePhase.TWO;
                    }
                });

            }
            cards = this.getCards(TrainerField.cardsInPlay, currentTrainer);
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                card.sprite.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                    if (this.currentPhase == GamePhase.TWO) {
                        console.log(`trigger ${i == 1}`);

                        this.server?.SwapWithHidden(i == 1);
                        this.currentPhase = GamePhase.THREE;
                    }
                });
            }
        }
    visibleCards(field: TrainerField, isVisible: boolean) {
        if (!this.server?.sessionID) return;

        for (const [key, gameTrainer] of this.trainersDisplay) {
            let cards: GameCard[] = this.getCards(field, gameTrainer);
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                card.sprite.visible = isVisible;
            }
        }
    }


    private getOrientation(
            key: string,
            index: number,
            maxCards: number,
            _xMultiplier: number,
            _yMultiplier: number,
        ): TrainerOrientation {
        if (!this.server?.sessionID) return { cardWidth: -1, isKey: false, _xStart: -1, _yStart: -1, buffer: -1, _angle: -1 };
        const { width, height } = this.scale;

        const cardWidth = this.textures.get('back').getSourceImage().width;
        let _xStart = width * _xMultiplier - (cardWidth * maxCards) / 2;
        let _yStart = height * _yMultiplier;
        let angle = 0;
        const isKey = key === this.server.sessionID;
        if (!isKey) {
            if (index == 0) {// left
                _xStart = width * (1 - _yMultiplier);
                _yStart = height * _xMultiplier - (cardWidth * maxCards) / 2;
                angle = 90;
            } else if (index == 1) {// top
                _xStart = width * _xMultiplier - (cardWidth * maxCards) / 2;
                _yStart = height * (1 - _yMultiplier);
                angle = 180;
            } else {// right
                _xStart = width * _yMultiplier;
                _yStart = height * _xMultiplier - (cardWidth * maxCards) / 2;
                angle = -90;
            }
        }
        return {
            isKey: isKey,
            _xStart: _xStart,
            _yStart: _yStart,
            _angle: angle,
            buffer: 10,
            cardWidth: cardWidth
        }

    }
    private getCards(field: TrainerField, trainer: GameTrainer) {
        let cards: GameCard[] = [];

        switch (field) {
            case TrainerField.pokeCards:
                cards = trainer.pokeCards;
                break;
            case TrainerField.pokerHand:
                cards = trainer.pokerHand;
                break;
            case TrainerField.cardsInPlay:
                cards = trainer.cardsInPlay;
                break;
            default:
                throw new Error("TRIED TO ACCESS FIELD NOT SET UP");
                break;
        }
        return cards;
    }
    private drawCards(field: TrainerField, _xMultiplier: number, _yMultiplier: number) {
        if (!this.server?.sessionID) return;

        let i = 0;
        for (const [key, gameTrainer] of this.trainersDisplay) {
            let cards: GameCard[] = this.getCards(field, gameTrainer);
            const maxCards = (field === TrainerField.cardsInPlay) ? 3 : 5;

            const { isKey, _xStart, _yStart, _angle, buffer, cardWidth }
                = this.getOrientation(key, i, maxCards, _xMultiplier, _yMultiplier);
            if (!isKey) i++;

            for (let k = 0; k < cards.length; k++) {
                const card = cards[k];
                card.sprite.setAngle(_angle);
                let xPlacement = (cardWidth + buffer) * card.cardData.placement;
                let yPlacement = 0;
                card.show(card.cardData.isRevealedToOthers);
                if (!isKey) {
                    if (i == 1 || i == 3) {// left or right
                        xPlacement = 0;
                        yPlacement = (cardWidth + buffer) * card.cardData.placement;
                    }
                } else {//only happens for client
                    card.show(card.cardData.isRevealedToClient);
                }
                card.sprite.setInteractive();

                card.setPosition(
                    Math.floor(_xStart + xPlacement),
                    Math.floor(_yStart + yPlacement)
                )

            }
        }

    }
}

type TrainerOrientation = {
    isKey: boolean,
    buffer: number,
    _xStart: number,
    _yStart: number,
    _angle: number,
    cardWidth: number
}


