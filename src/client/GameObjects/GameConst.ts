export type TrainerOrientation = {
    xPosition: number,
    yPosition: number,
    _angle: number,
    screenPlacement: ScreenOrientation
}

export const cardWidth = 67;

export enum ScreenOrientation {
    LEFT = 0,
    TOP = 1,
    RIGHT = 2,
    BOTTOM = 3,
}

export enum GameScenes {
    GAME = 'game',
    BOOTSTRAP = 'bootstrap',
}