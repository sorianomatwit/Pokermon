import Phaser from 'phaser'
import type Server from '../services/Server';
import { IGameState } from '../../server/src/rooms/schema/GameState';
import GameTrainer from '../GameObjects/GameTrainer';
import { GameScenes, ScreenOrientation } from '../GameObjects/GameConst';
import { drawAllCards, drawCards, getCards, getOrientation } from '../GameObjects/GameUtils';
import { TrainerField, TrainerState } from '../../server/src/rooms/schema/Trainer';
import { InPlay } from '../../SharedTypes/Enums';

export default class Game extends Phaser.Scene {

    private server?: Server
    private allGameTrainers: Map<string, GameTrainer> = new Map();
    private trainer!: GameTrainer;
    private GAMEOBJECT_POINTER_UP = Phaser.Input.Events.GAMEOBJECT_POINTER_UP;
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

    }
    private createGameScene(state: IGameState) {
        if (!this.server?.sessionId) return;
        const { trainers } = state;

        for (const [key, value] of trainers) {
            console.log("new trainer");
            const trainer = new GameTrainer(this, value);
            this.allGameTrainers.set(key, trainer);
        }
        this.trainer = this.allGameTrainers.get(this.server.sessionId)!;

    }

    private serverDataUpdate(state: IGameState) {

        if (!this.server?.sessionId) return;
        const { trainers } = state;
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
        //resetInput on all cards
        for (const [_, gameTrainer] of this.allGameTrainers) {
            const allCards = [
                ...getCards(TrainerField.pokeCards, gameTrainer),
                ...getCards(TrainerField.pokerHand, gameTrainer),
                ...getCards(TrainerField.cardsInPlay, gameTrainer)
            ]
            for (let i = 0; i < allCards.length; i++) {
                const card = allCards[i];
                card.sprite.off(this.GAMEOBJECT_POINTER_UP);
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
                this.drawBattleScreen(this.server.sessionId);
                break;
            case TrainerState.CHAMPION_BATTLE:
            case TrainerState.TIEBREAKER:
            case TrainerState.DELETE:
            case TrainerState.DRAFT:
            default:
                break;
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
            card.sprite.on(this.GAMEOBJECT_POINTER_UP, () => {
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
            card.sprite.on(this.GAMEOBJECT_POINTER_UP, () => {
                this.server?.SwapWithHidden({ swap: (i == InPlay.SUMONE) })
            });
        }
    }

    drawBattleScreen(sessionId: string) {
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
        drawCards(true, orientation, [trainer.cardsInPlay[InPlay.BATTLE]], 0);
        drawCards(false, oppOrientation, [opponent.cardsInPlay[InPlay.BATTLE]], 0);

        if (trainer.state == TrainerState.CHAMPION_BATTLE) {
            console.log("i Won");
        } else if (trainer.state == TrainerState.TIEBREAKER) {
            //TODO swap to tie breaker scene
            console.log("tie");
        } else {
            console.log("I LOST");
        }
    }


}



