import Deck from "./Deck";
import Trainer from "./Trainer";

export default class GameSequence {
    public allTrainers: Trainer[] = []; 
	public GameDeck : Deck = new Deck();
    phaseOne() {
		//Phase 1 Deal PokeCards
		/**
		 * @TODO 
		 * 1. get a list of players that have connected
		 * 2. remove cards from deck and add that cards to pokeCard cardCollection in player
		 */


	}
	phaseTwo() {
		//Phase 2 swap?
		/**
		 * @TODO 
         * (CLIENT INPUT)
		 * 1. have player pick one of their pokeCards (remove from pokeCard hand and add to cardsInPlay)
		 * 2. reveal pokeCard to player (only player)
		 * 3. deal two cards to each player reveal only one to everyone
         * (CLIENT INPUT)
		 * 4. prompt player to switch hidden card with pokecard ( switch indexes 2 and 0)
		 * 5. if swapped hide pokecard to everyone reveal hidden card to player
		 *  
		 */



	}
	phaseThree() {
		//Phase 3 battle
		/**
		 * @TODO 
		 * 1. reveal hidden cards to everyone ( still hide battle card)
		 * 2. sum reveal cards(2) and order the player from greatest to least 
         * 3. have player 1 and 2 battle and player 3 and 4 battle (happen simultaneously on their own screens)
         * 4. only show players their opponent
         * (CLIENT INPUT) *battle button*
         * 5. reveal battle card to opponent
         * 6. calculate outcome of battle
         * 7. reveal to everyone winners
         * (CLIENT INPUT) *battle button*
         * 8. have winners battle (show battle to everyone)
         * 9. show final winner
         * 10. order selection list based off winners
         * 11. empty everyone cardInPlayer cardCollection into a selectionBucket cardCollection
         * (CLIENT INPUT) *select button*
         * 11. ready to select
		 */
	}
    phaseFour() {
		//Phase 4 selection
		/**
		 * @TODO
         * (CLIENT INPUT)
         * 1. reveal pokerHand list to player (have player swipe away to select) 
         * (CLIENT INPUT)
		 * 2. reverse selection list each player removes one card 4th -> 1st
         * (CLIENT INPUT)
         * 3. each player selects a card and add to their pokerHand cardCollection (remove form selectionBUCket add to pokerHand)
         * 
		 */
	}
} 