import type Card from "../../server/src/rooms/schema/Card";

export default class GameCard {
    public sprite: Phaser.GameObjects.Sprite;
    private isShowing = false;
    constructor(private scene: Phaser.Scene, public cardData: Card) {
        this.sprite = this.scene.add.sprite(0, 0, 'back');
        this.show(cardData.isRevealedToEveryone);
    }

    public setPosition = (x: number, y: number) => this.sprite.setPosition(x, y);

    public show(isShow: boolean) {
        this.isShowing = isShow;
        if (isShow) {
            this.sprite.setTexture(this.cardData.imageString);
        } else this.sprite.setTexture('back');
    }

    public setCard(card: Card) { 
        this.cardData = card;
        this.show(this.isShowing);
    }

}