import GameCard from './GameCard';
import GameTrainer from './GameTrainer';
import { cardWidth, ScreenOrientation, TrainerField, TrainerOrientation } from './GameConst';
import { Scene } from "phaser";

export function getOrientation(
    screenPlacement: ScreenOrientation,
    maxCards: number,
    _xMultiplier: number,
    _yMultiplier: number,
    gameWidth: number,
    gameHeight: number
): TrainerOrientation {

    //NOTE DEFAULT IS ScreenOrientation.BOTTOM
    let _xStart = gameWidth * _xMultiplier - (cardWidth * maxCards) / 2;
    let _yStart = gameHeight * _yMultiplier;
    let angle = 0;
    if (screenPlacement == ScreenOrientation.LEFT) {// left
        _xStart = gameWidth * (1 - _yMultiplier);
        _yStart = gameHeight * _xMultiplier - (cardWidth * maxCards) / 2;
        angle = 90;
    } else if (screenPlacement == ScreenOrientation.TOP) {// top
        _xStart = gameWidth * _xMultiplier - (cardWidth * maxCards) / 2;
        _yStart = gameHeight * (1 - _yMultiplier);
        angle = 180;
    } else if (screenPlacement === ScreenOrientation.RIGHT) {// right
        _xStart = gameWidth * _yMultiplier;
        _yStart = gameHeight * _xMultiplier - (cardWidth * maxCards) / 2;
        angle = -90;
    }
    return {
        xPosition: _xStart,
        yPosition: _yStart,
        _angle: angle,
        screenPlacement: screenPlacement
    }

}

export function getCards(field: TrainerField, trainer: GameTrainer) {
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


export function drawAllCards(
    scene: Scene,
    pKey: string,
    trainers: Map<string, GameTrainer>,
    field: TrainerField,
    _xMultiplier: number,
    _yMultiplier: number
) {

    let i = 0;
    for (const [key, gameTrainer] of trainers) {
        let cards: GameCard[] = getCards(field, gameTrainer);
        const maxCards = (field === TrainerField.cardsInPlay) ? 3 : 5;
        const buffer = 10;
        const isPlayer = key == pKey;
        const { width, height } = scene.scale
        let screenPlacement = (isPlayer) ? ScreenOrientation.BOTTOM : i;
        const orientation
            = getOrientation(screenPlacement, maxCards, _xMultiplier, _yMultiplier, width, height);
        if (!isPlayer) i++;
        drawCards(isPlayer, orientation, cards, buffer);
    }
}

export function drawCards(isClient: boolean, orientation: TrainerOrientation, cards: GameCard[], buffer: number) {
    const { _angle, xPosition, yPosition, screenPlacement } = orientation;
    for (let k = 0; k < cards.length; k++) {
        const card = cards[k];
        card.sprite.visible = true;
        card.sprite.setAngle(_angle);
        let xPlacement = (cardWidth + buffer) * card.cardData.placement;
        let yPlacement = 0;
        const isLeft = screenPlacement == ScreenOrientation.LEFT;
        const isRight = screenPlacement == ScreenOrientation.RIGHT
        if (isLeft || isRight) {// left or right
            xPlacement = 0;
            yPlacement = (cardWidth + buffer) * card.cardData.placement;
        }
        const showCard = (card.cardData.isRevealedToEveryone) || (isClient && card.cardData.isRevealedToClient)
        
        card.show(showCard);
        
        card.sprite.setInteractive();

        card.setPosition(
            Math.floor(xPosition + xPlacement),
            Math.floor(yPosition + yPlacement)
        )
    }
}

export function triggerCallbackAfterDelay(callback: () => void, delayInSeconds: number): void {
    setTimeout(callback, delayInSeconds * 1000); // Convert seconds to milliseconds
}

