import Phaser from 'phaser';
import Server from '../services/Server';
import { GameScenes } from '../GameObjects/GameConst';
import GameTrainer from '../GameObjects/GameTrainer';
import { allSprites } from './Assets';


export default class Bootstrap extends Phaser.Scene {
    private server !: Server;
    constructor() {
        super({ key: GameScenes.BOOTSTRAP });
    }

    init() {
        this.server = new Server();
    }
    preload() {
        this.load.image(allSprites);
    }
    create() {
        this.scene.launch(GameScenes.GAME, {
            server: this.server,
        });
    }
}