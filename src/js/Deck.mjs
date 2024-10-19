import { CardList } from './CardList.mjs';

export class Deck {
  constructor() {
    this.cardList = new CardList([]); // Initialize an empty CardList
    this.cardQuantity = 0; // Track the total number of cards in the deck
    this.deckImage = null; // Store a reference to a card image
  }

  // Method to add a card to the deck
  addCard(card) {
    this.cardList.cards.push(card); // Add the card to the CardList
    this._updateCardQuantity(1); // Increment the total card quantity

    if (!this.deckImage && card.imageUrl) {
      this.deckImage = card.imageUrl; // Set the deck image if not already set
    }
  }

  // Method to remove a card from the deck
  removeCard(card) {
    const cardIndex = this.cardList.cards.findIndex(
      (c) => c.multiverseid === card.multiverseid
    );

    if (cardIndex > -1) {
      this.cardList.cards.splice(cardIndex, 1); // Remove the card
      this._updateCardQuantity(-1); // Decrement the total card quantity
      this._checkDeckImage(card); // Check if deck image needs to be updated
    }
  }

  // Method to set a custom deck image
  setDeckImage(imageUrl) {
    this.deckImage = imageUrl;
  }

  // Method to update the total number of cards in the deck
  _updateCardQuantity(change) {
    this.cardQuantity += change; // Increment or decrement the total number of cards

    if (this.cardQuantity < 0) {
      this.cardQuantity = 0; // Prevent negative total card quantity
    }
  }

  // Method to check if the deck image needs to be reset when a card is removed
  _checkDeckImage(removedCard) {
    if (this.deckImage === removedCard.imageUrl) {
      // If the removed card was the deck image, reset the image
      if (this.cardList.cards.length > 0) {
        this.deckImage = this.cardList.cards[0].imageUrl; // Set to the first card's image
      } else {
        this.deckImage = null; // No cards left, clear the deck image
      }
    }
  }
}