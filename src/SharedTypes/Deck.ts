import { Card } from "./Card";
import CardCollection from "./CardCollection";
import { Suite } from "./Enums";

export default class Deck extends CardCollection {
    private discardPile: Card[] = [];
    constructor() {
        super(52);
        for (const s of Object.values(Suite)) {
            for (let i = 2; i <= 14; i++) {
                this._cards.push(
                    new Card(
                        false,
                        false,
                        i,
                        s,
                        `sprite_${s.toString()}_${i.toString()}`,
                    )
                )
            }
        }
    }

    public deal(cards: CardCollection, amount: number = 1): Card[] {
        const cardsDealt: Card[] = [];
        if (this.cards.length < amount) this.recycleDeck();
        for (let i = 0; i < amount; i++) {
            const rIndex = Math.floor(Math.random() * 52);
            const card = this.cards[rIndex];
            if (cards.addCard(card)) {
                this.removeCard(rIndex);
                cardsDealt.push(card);
            }
        }
        return cardsDealt;
    }

    public addToDiscardPile(card: Card) {
        this.discardPile.push(card);
    }

    private recycleDeck() {
        for (let i = 0; i < this.discardPile.length; i++) {
            this.addCard(this.discardPile[i]);
        }
        this.discardPile = [];
    }
}