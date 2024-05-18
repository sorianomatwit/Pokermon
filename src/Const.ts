import { ArraySchema, MapSchema } from '@colyseus/schema';
import Card from './server/src/rooms/schema/Card';
import Trainer from './server/src/rooms/schema/Trainer';
import Phaser from 'phaser';
export enum Suite {
    GRASS = "grass",
    FLYING = "flying",
    GROUND = "ground",
    ELECTRIC = "electric"
}

export enum Message {
    SelectPokeCard = 'SelectPokeCard',
    SwapPokeCard = 'SwapPokeCard',
    TrainerBattle = 'TrainerBattle',
    TieBreakerBattle = 'TieBreakerBattle',
    ChampionsBattle = 'ChampionsBattle',
    DeleteCard = 'DeleteCard',
    DraftCard = 'DraftCard'
}
export enum InPlay {
    BATTLE = 0,
    SUMONE = 1,
    SUMTWO = 2
}

export enum TrainerState {
    CHOOSE = "CHOOSE",
    SWAP = "SWAP",
    BASE_BATTLE = "BASE_BATTLE",
    CHAMPION_BATTLE = "CHAMPION_BATTLE",
    TIEBREAKER = "TIEBREAKER",
    DELETE = "DELETE",
    DRAFT = "DRAFT",
    WIN = "WIN",
    LOSE = "LOSE",
    LOGIN = "LOGIN"
}



export interface IGameState {
    pickupPile: ArraySchema<Card>;
    trainers: MapSchema<Trainer>;
    draftPile: ArraySchema<Card>;
    trainerRankings: MapSchema<number>;
    activePlayer: string;
}

export enum GameStateField {
    trainers = 'trainers',
    trainerRankings = 'trainerRankings',
    pickupPile = 'pickupPile',
    draftPile = 'draftPile',
    activePlayer = 'activePlayer',

}

