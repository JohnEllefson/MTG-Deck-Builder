import { CardList } from "./CardList.mjs";

export class Deck {
  constructor() {
    this.cardList = new CardList([]); // Initialize an empty CardList
    this.cardQuantity = 0; // Track the total number of cards in the deck
    this.deckImage = null; // Store a reference to a card image
    this.name = null; // Store the name of the deck
    this.isFavorited = false; // Track if the deck is favorited
  }

  // Method to add a card to the deck
  addCard(card) {
    if (!this.cardList) {
      this.cardList = new CardList([]);
    }
    this.cardList.cards.push(card);
    this.updateCardQuantity(1);

    if (!this.deckImage && card.imageUrl) {
      this.deckImage = card.imageUrl;
    }
  }

  // Method to remove a card from the deck
  removeCard(card) {
    const cardIndex = this.cardList.cards.findIndex(
      (c) => c.multiverseid === card.multiverseid,
    );

    if (cardIndex > -1) {
      this.cardList.cards.splice(cardIndex, 1); // Remove the card
      this.updateCardQuantity(-1); // Decrement the total card quantity
      this.checkDeckImage(card); // Check if deck image needs to be updated
    }
  }

  // Method to set a custom deck image
  setDeckImage(imageUrl) {
    this.deckImage = imageUrl;
  }

  // Method to update the total number of cards in the deck
  updateCardQuantity(change) {
    this.cardQuantity += change;

    if (this.cardQuantity < 0) {
      this.cardQuantity = 0;
    }
  }

  // Method to check if the deck image needs to be reset when a card is removed
  checkDeckImage(removedCard) {
    if (this.deckImage === removedCard.imageUrl) {
      // If the removed card was the deck image, reset the image
      if (this.cardList.cards.length > 0) {
        // If there are cards left, search the card list to see if the removed card
        // is still in the deck.
        const searchCard = this.cardList.cards.find(
          (card) => card.multiverseid === removedCard.multiverseid,
        );
        if (searchCard) { // Card was found, leave the image as it is
          return;
        } else { // Card was not found, set the deck image to the first card's image
          this.deckImage = this.cardList.cards[0].imageUrl;
        }
      } else {
        this.deckImage = null; // No cards left, clear the deck image
      }
    }
  }
}
