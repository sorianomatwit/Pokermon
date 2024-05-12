export enum Suite {
    GRASS = "GRASS",
    FLYING = "FLYING",
    GROUND = "GROUND",
    ELECTRIC = "ELECTRIC"
}

export enum Message {
    SelectPokeCard = 'SelectPokeCard',
    SwapPokeCard = 'SwapPokeCard',
    TrainerBattle = 'TrainerBattle',
    ChampionsBattle = 'ChampionsBattle',
    DiscardDraft = 'DiscardDraft',
    PokerDraft = 'PokerDraft'
}
export enum InPlay {
    BATTLE = 0,
    SUMONE = 1,
    SUMTWO = 2
}