import Phaser from 'phaser'
import type Server from '../services/Server';
import type IGameState from '../../server/src/rooms/schema/GameState';
import GameTrainer from '../GameObjects/GameTrainer';
import { cardHeight, cardWidth, GAMEOBJECT_POINTER_UP, GameScenes, ScreenOrientation, TrainerField, type TrainerOrientation } from '../GameObjects/GameConst';
import { drawAllCards, drawCards, getCards, getOrientation, triggerCallbackAfterDelay } from '../GameObjects/GameUtils';
import type Trainer from '../../server/src/rooms/schema/Trainer';
import { MapSchema } from '@colyseus/schema';
import GameCard from '../GameObjects/GameCard';
import { InPlay, Message, TrainerState } from '../../Const';

export default class Game extends Phaser.Scene {

    private server?: Server
    private allGameTrainers: Map<string, GameTrainer> = new Map();
    private gameDraftPile: GameCard[] = [];
    private trainer!: GameTrainer;
    private orientation!: TrainerOrientation;
    private oppOrientation!: TrainerOrientation;
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
        const { width, height } = this.scale;

        this.orientation = getOrientation(
            ScreenOrientation.BOTTOM,
            1,
            .5,
            .85,
            width,
            height
        );
        this.oppOrientation = getOrientation(
            ScreenOrientation.TOP,
            1,
            .5,
            .85,
            width,
            height
        );
    }

    update(_time: number, _delta: number): void {
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

        if (draftPile.length > this.gameDraftPile.length) {
            for (let k = 0; k < draftPile.length; k++) {
                const card = draftPile[k];
                if (k >= this.gameDraftPile.length) {
                    this.gameDraftPile[k] = new GameCard(this, card);
                }
            }
        } else {
            for (let j = this.gameDraftPile.length - 1; j >= 0; j--) {
                if (j < draftPile.length) {
                    const card = draftPile[j];
                    this.gameDraftPile[j].setCard(card);
                } else {
                    this.gameDraftPile[j].sprite.destroy();
                    this.gameDraftPile.splice(j, 1);
                }
            }
        }
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
                //TESTING
                card.sprite.on(GAMEOBJECT_POINTER_UP, () => {
                    console.log(`${card.cardData.value} ${card.cardData.suite} ${_}`);
                })
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
                this.drawBattleScreen(this.server.sessionId);
                break;
            case TrainerState.TIEBREAKER:
                this.drawTieBreakerScreen(this.server.sessionId);
                break;
            case TrainerState.DELETE:
                console.log(`${this.server.sessionId} goes ${state.trainerRankings.get(this.server.sessionId)}`);
                this.drawSelection((i) => {
                    this.server?.sendMessage(Message.DeleteCard, { index: i });
                })
                break;
            case TrainerState.DRAFT:
                this.drawSelection((i) => {
                    this.server?.sendMessage(Message.DraftCard, { index: i });
                })
                break;
            case TrainerState.WIN:
                console.log(`I won`);
                break;
            case TrainerState.LOSE:
                console.log(`i lost`);
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

                }
            }
        }
        else {

            for (const [key, gameTrainer] of this.allGameTrainers) {
                const trainer = trainers.get(key);
                if (trainer) {

                    gameTrainer.setTrainer(trainer);
                } else {
                    gameTrainer.destroy();
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
                this.server?.sendMessage(Message.SelectPokeCard, { index: i });
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
                this.server?.sendMessage(Message.SwapPokeCard, { swap: (i == InPlay.SUMONE) });
            });
        }
    }
    drawBattleScreen(sessionId: string) {
        const trainer = this.allGameTrainers.get(sessionId)!;

        drawCards(true, this.orientation, [trainer.cardsInPlay[InPlay.BATTLE]], 10);
        if (trainer.opponentId.length > 0 && this.allGameTrainers.get(trainer.opponentId)?.isReadyToFight) {
            const opponent = this.allGameTrainers.get(trainer.opponentId)!;

            drawCards(false, this.oppOrientation, [opponent.cardsInPlay[InPlay.BATTLE]], 10);
            triggerCallbackAfterDelay(() => {
                this.server?.sendMessage(Message.TrainerBattle);
            }, 5)
        } else {
            console.log("waiting for opponent");
        }
    }
    drawTieBreakerScreen(sessionId: string) {
        const trainer = this.allGameTrainers.get(sessionId)!;
        const opponent = this.allGameTrainers.get(trainer.opponentId)!;

        drawCards(true, this.orientation, trainer.cardsInPlay, 10);
        drawCards(false, this.oppOrientation, opponent.cardsInPlay, 10);

        const cardInPlay = getCards(TrainerField.cardsInPlay, this.trainer);
        for (let i = 0; i < cardInPlay.length; i++) {
            const card = cardInPlay[i];
            card.sprite.on(GAMEOBJECT_POINTER_UP, () => {
                this.server?.sendMessage(Message.TieBreakerBattle, { index: i });
            });
        }

    }
    drawSelection(callback: (i: number) => void) {
        //draw  
        const buffer = 10;
        const { width, height } = this.scale;
        let xPosition = (width / 2) - ((cardWidth + buffer) * 3) / 2;
        let yPosition = (height / 2) - ((cardHeight + buffer) * 4) * .5;
        drawCards(true, this.orientation, this.trainer.pokerHand, 10)
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
            card.sprite.on(GAMEOBJECT_POINTER_UP, () => {
                callback(i)
            })
        }
    }
}