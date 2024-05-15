import Phaser from 'phaser'
import type Server from '../services/Server';
import { IGameState } from '../../server/src/rooms/schema/GameState';
import GameTrainer from '../GameObjects/GameTrainer';
import { cardHeight, cardWidth, GAMEOBJECT_POINTER_UP, GameScenes, ScreenOrientation } from '../GameObjects/GameConst';
import { drawAllCards, drawCards, getCards, getOrientation, triggerCallbackAfterDelay } from '../GameObjects/GameUtils';
import { TrainerField, TrainerState, Trainer } from '../../server/src/rooms/schema/Trainer';
import { InPlay } from '../../SharedTypes/Enums';
import { MapSchema } from '@colyseus/schema';
import GameCard from '../GameObjects/GameCard';

export default class Game extends Phaser.Scene {

    private server?: Server
    private allGameTrainers: Map<string, GameTrainer> = new Map();
    private gameDraftPile: GameCard[] = [];
    private trainer!: GameTrainer;
    constructor() {
        super({ key: GameScenes.GAME });
    }

    async create(data: { server: Server }) {
        const { server } = data;

        this.server = server;
        if (!this.server) throw new Error('server instance missing');
        await server.join();


        this.server.onceStateChanged(this.createGameScene, this);
        this.server.stateChanged(this.serverDataUpdate, this);
    }

    update(_time: number, _delta: number): void {
        // if (this.startCountingDown && this.trainer.state == TrainerState.CHAMPION_BATTLE) {
        //     this.timer -= _delta / 1000;
        //     console.log(this.timer);

        //     if (this.timer <= 0) {
        //         this.startCountingDown = false;
        //         this.server?.fight();
        //     }
        // }
    }
    private createGameScene(state: IGameState) {
        if (!this.server?.sessionId) return;
        const { trainers } = state;
        console.log(this.server.sessionId);

        for (const [key, value] of trainers) {
            const trainer = new GameTrainer(this, value);
            this.allGameTrainers.set(key, trainer);
        }
        this.trainer = this.allGameTrainers.get(this.server.sessionId)!;

    }

    private serverDataUpdate(state: IGameState) {

        if (!this.server?.sessionId) return;
        const { trainers, draftPile } = state;
        this.updateTrainers(trainers);
        for (let i = 0; i < draftPile.length; i++) {
            const card = draftPile[i];
            if (this.gameDraftPile[i]) {
                this.gameDraftPile[i].sprite.destroy();
            }
            this.gameDraftPile[i] = new GameCard(this, card);
        }
        // const cards = getCards(TrainerField.cardsInPlay, this.trainer); 

        // if (cards.length > 0) {
        //     console.log(`E0: ${cards[InPlay.BATTLE].cardData.isRevealedToEveryone}, 1: ${cards[InPlay.SUMONE].cardData.isRevealedToEveryone}, 2: ${cards[InPlay.SUMTWO].cardData.isRevealedToEveryone}`);
        //     console.log(`C0: ${cards[InPlay.BATTLE].cardData.isRevealedToClient}, 1: ${cards[InPlay.SUMONE].cardData.isRevealedToClient}, 2: ${cards[InPlay.SUMTWO].cardData.isRevealedToClient}`);
        // }
        // const serverTrainer = state.trainers.get(this.server.sessionId);
        // if (serverTrainer && serverTrainer?.cardsInPlay.length > 0) {
        //     console.log(`SE0: ${serverTrainer.cardsInPlay[InPlay.BATTLE].isRevealedToEveryone}, 1: ${serverTrainer.cardsInPlay[InPlay.SUMONE].isRevealedToEveryone}, 2: ${serverTrainer.cardsInPlay[InPlay.SUMTWO].isRevealedToEveryone}`);
        //     console.log(`SC0: ${serverTrainer.cardsInPlay[InPlay.BATTLE].isRevealedToClient}, 1: ${serverTrainer.cardsInPlay[InPlay.SUMONE].isRevealedToClient}, 2: ${serverTrainer.cardsInPlay[InPlay.SUMTWO].isRevealedToClient}`);
        // } else if(!serverTrainer) console.error("no trainer");
        //resetInput on all cards
        for (const [_, gameTrainer] of this.allGameTrainers) {
            const allCards = [
                ...this.gameDraftPile,
                ...getCards(TrainerField.pokeCards, gameTrainer),
                ...getCards(TrainerField.pokerHand, gameTrainer),
                ...getCards(TrainerField.cardsInPlay, gameTrainer)
            ]
            for (let i = 0; i < allCards.length; i++) {
                const card = allCards[i];
                card.sprite.off(GAMEOBJECT_POINTER_UP);
                card.sprite.visible = false;
            }
        }

        switch (this.trainer.state) {
            case TrainerState.CHOOSE:
                //draw Choose and Select PokeCard Input
                this.drawChooseScreen(this.server.sessionId);
                break;
            case TrainerState.SWAP:
                // draw card in play and show button to either swap to no
                this.drawSwapScreen(this.server.sessionId);
                break;
            case TrainerState.BASE_BATTLE:
            case TrainerState.CHAMPION_BATTLE:
                if (!state.doneFighting.get(this.server.sessionId))
                    this.drawBattleScreen(this.server.sessionId);
                break;
            case TrainerState.TIEBREAKER:
                this.drawTieBreakerScreen(this.server.sessionId);
                break;
            case TrainerState.DELETE:
                console.log(`${this.server.sessionId} goes ${state.trainerRankings.get(this.server.sessionId)}`);

                this.drawDeleteScreen(this.server.sessionId)
                break;
            case TrainerState.DRAFT:
                this.drawDraftScreen(this.server.sessionId);
                break;
            default:
                break;
        }

    }
    updateTrainers(trainers: MapSchema<Trainer>) {

        if (trainers.size > this.allGameTrainers.size) {
            for (const [key, trainer] of trainers) {
                if (this.allGameTrainers.has(key)) {
                    this.allGameTrainers.get(key)?.setTrainer(trainer);

                } else {
                    this.allGameTrainers.set(key, new GameTrainer(this, trainer));
                    //TODO Check if this is where the bug of a 5th player happens
                }
            }
        }
        else {
            for (const [key] of this.allGameTrainers) {
                const trainer = trainers.get(key);
                if (trainer) {
                    this.allGameTrainers.get(key)?.setTrainer(trainer);
                } else {

                    this.allGameTrainers.delete(key);
                }
            }
        }
    }
    drawChooseScreen(sessionId: string) {

        //draw
        drawAllCards(this, sessionId, this.allGameTrainers, TrainerField.pokeCards, .5, .85);
        this.add.text
        //add input
        const pokeCards = getCards(TrainerField.pokeCards, this.trainer);
        for (let i = 0; i < pokeCards.length; i++) {
            const card = pokeCards[i];
            card.sprite.on(GAMEOBJECT_POINTER_UP, () => {
                this.server?.selectPokeCard({ index: i });
            });
        }

    }

    drawSwapScreen(sessionId: string) {
        //draw
        drawAllCards(this, sessionId, this.allGameTrainers, TrainerField.cardsInPlay, .5, .85);

        //add input
        const cardInPlay = getCards(TrainerField.cardsInPlay, this.trainer);
        for (let i = 0; i < cardInPlay.length; i++) {
            const card = cardInPlay[i];
            card.sprite.on(GAMEOBJECT_POINTER_UP, () => {
                this.server?.swapWithHidden({ swap: (i == InPlay.SUMONE) })
            });
        }
    }

    drawBattleScreen(sessionId: string) {
        const { width, height } = this.scale;
        const trainer = this.allGameTrainers.get(sessionId)!;
        const orientation = getOrientation(
            ScreenOrientation.BOTTOM,
            1,
            .5,
            .85,
            width,
            height
        );
        drawCards(true, orientation, [trainer.cardsInPlay[InPlay.BATTLE]], 10);
        if (trainer.opponentId.length > 0) {
            const opponent = this.allGameTrainers.get(trainer.opponentId)!;
            const oppOrientation = getOrientation(
                ScreenOrientation.TOP,
                1,
                .5,
                .85,
                width,
                height
            );
            drawCards(false, oppOrientation, [opponent.cardsInPlay[InPlay.BATTLE]], 10);
            triggerCallbackAfterDelay(() => {
                this.server?.fight(this.time.now);
            }, 5)
        } else {
            console.log("waiting for opponent");

        }
    }

    drawTieBreakerScreen(sessionId: string) {
        const { width, height } = this.scale;
        const trainer = this.allGameTrainers.get(sessionId)!;
        const opponent = this.allGameTrainers.get(trainer.opponentId)!;
        const orientation = getOrientation(
            ScreenOrientation.BOTTOM,
            1,
            .5,
            .85,
            width,
            height
        );
        const oppOrientation = getOrientation(
            ScreenOrientation.TOP,
            1,
            .5,
            .85,
            width,
            height
        );

        drawCards(true, orientation, trainer.cardsInPlay, 10);
        drawCards(false, oppOrientation, opponent.cardsInPlay, 10);

        const cardInPlay = getCards(TrainerField.cardsInPlay, this.trainer);
        for (let i = 0; i < cardInPlay.length; i++) {
            const card = cardInPlay[i];
            card.sprite.on(GAMEOBJECT_POINTER_UP, () => {
                this.server?.tieBreaker({ index: i });
            });
        }

    }

    drawDeleteScreen(sessionId: string) {
        //draw  
        console.log("delete");
        const buffer = 5;
        const { width, height } = this.scale;
        const orientation = getOrientation(
            ScreenOrientation.BOTTOM,
            1,
            .5,
            .85,
            width,
            height
        );
        let xPosition = (width / 2) - ((cardWidth + buffer) * 3 / 2);
        let yPosition = (height / 2) - ((cardHeight + buffer) * Math.floor(this.gameDraftPile.length / 3)) / 2;
        drawCards(true, orientation, this.trainer.pokerHand, 10)
        for (let i = 0; i < this.gameDraftPile.length; i++) {
            const card = this.gameDraftPile[i];
            card.sprite.visible = true;

            let xPlacement = (cardWidth + buffer) * (card.cardData.placement % 3);
            let yPlacement = Math.floor(card.cardData.placement / 3) * (cardHeight + buffer);

            card.sprite.setInteractive();

            card.setPosition(
                Math.floor(xPosition + xPlacement),
                Math.floor(yPosition + yPlacement)
            )

            //add input
            card.sprite.on(GAMEOBJECT_POINTER_UP, () => {
                this.server?.deleteCard({ index: i });
            })

        }
    }
    drawDraftScreen(sessionId: string) {
        //draw  
        console.log("draft");
        const buffer = 5;
        const { width, height } = this.scale;
        const orientation = getOrientation(
            ScreenOrientation.BOTTOM,
            1,
            .5,
            .85,
            width,
            height
        );
        let xPosition = (width / 2) - ((cardWidth + buffer) * 3 / 2);
        let yPosition = (height / 2) - ((cardHeight + buffer) * Math.floor(this.gameDraftPile.length / 3)) / 2;
        drawCards(true, orientation, this.trainer.pokerHand, 10)
        for (let i = 0; i < this.gameDraftPile.length; i++) {
            const card = this.gameDraftPile[i];
            card.sprite.visible = true;

            let xPlacement = (cardWidth + buffer) * (card.cardData.placement % 3);
            let yPlacement = Math.floor(card.cardData.placement / 3) * (cardHeight + buffer);

            card.sprite.setInteractive();

            card.setPosition(
                Math.floor(xPosition + xPlacement),
                Math.floor(yPosition + yPlacement)
            )

            //add input
            card.sprite.on(GAMEOBJECT_POINTER_UP, () => {
                this.server?.draftCard({index: i});
            })

        }
    }
}