import { CardDetails } from "./CardDetails.mjs";
import { deckInspector } from "./ExternalServices.mjs";

export class CardList {
  constructor(cards) {
    this.cards = cards.map((card) => new CardDetails(card)); // Store each CardDetails object
    this.quantities = {}; // To store quantities for each card

    // Keep track of event listeners so they can be removed later
    this.plusButtonListeners = {};
    this.minusButtonListeners = {};

/*     document.addEventListener("deck-inspector-ready", async () => {
      if (deckInspector && deckInspector.selectedDeck) {
        this.init(); // Initialize card list only after deckInspector is ready
      } else {
        console.warn("Deck Inspector not initialized or no deck selected.");
      }
    }); */

    this.init(); // Initialize the card list
  }

  // Initialize and filter out cards that don't have an image URL, and update the quantities object
  init() {
    const uniqueCardsMap = new Map(); // Map to store unique cards by multiverseid

    // Filter out cards that don't have an image URL
    this.cards = this.cards.filter((card) => {
      if (card.imageUrl) {
        // If card has an image, process it for the quantities object
        if (uniqueCardsMap.has(card.multiverseid)) {
          // If card is already in the map, increment the quantity
          this.quantities[card.multiverseid] += 1;
        } else {
          // If card is not in the map, add it and initialize the quantity to 1
          uniqueCardsMap.set(card.multiverseid, card);
          this.quantities[card.multiverseid] = 1;
        }
        return true;
      } else {
        console.warn(`Card ${card.name} has no image and will be excluded.`);
        return false;
      }
    });

    // Replace the cards array with only the unique cards
    this.cards = Array.from(uniqueCardsMap.values());
  }

  // Render each card in the list using the cardListTemplate
  renderCardList() {
    const cardResultsDiv = document.getElementById("card-results");
    cardResultsDiv.innerHTML = ""; // Clear any existing content

    if (this.cards.length === 0) {
      // If no cards, display a message
      cardResultsDiv.innerHTML = "<p>No cards available.</p>";
      return;
    }

    // Render each card with quantity controls
    this.cards.forEach((card) => {
      cardResultsDiv.innerHTML += cardListTemplate(card, this.quantities); // Use the template for each card
    });

    // After rendering, set up the quantity control functionality
    this.cards.forEach((card) => {
      const plusButton = document.getElementById(`plus-${card.multiverseid}`);
      const minusButton = document.getElementById(`minus-${card.multiverseid}`);
      const quantityInput = document.getElementById(
        `quantity-${card.multiverseid}`,
      );

      // Only initialize the quantity if it doesn't already exist
      if (this.quantities[card.multiverseid] === undefined) {
        this.quantities[card.multiverseid] = 0; // Initialize quantity to 0 if not present
      }
      quantityInput.value = this.quantities[card.multiverseid]; // Set input to the current quantity

      // Remove existing event listeners if they exist
      if (this.plusButtonListeners[card.multiverseid]) {
        plusButton.removeEventListener(
          "click",
          this.plusButtonListeners[card.multiverseid],
        );
      }
      if (this.minusButtonListeners[card.multiverseid]) {
        minusButton.removeEventListener(
          "click",
          this.minusButtonListeners[card.multiverseid],
        );
      }

      // Add new event listeners and store references to remove them later
      this.plusButtonListeners[card.multiverseid] = () => {

        // Dispatch an event to notify that the deck inspector is ready
        // for the card list to be updated.
        const event = new CustomEvent("deck-inspector-update", {
          detail: {
            card: card,
            change: 1,
          },
        });
        console.log('Dispatching custom-event:', event);  // Add a log
        document.dispatchEvent(event);
      };

      this.minusButtonListeners[card.multiverseid] = () => {
        if (this.quantities[card.multiverseid] > 0) {

          // Dispatch an event to notify that the deck inspector is ready
          // for the card list to be updated.
          const event = new CustomEvent("deck-inspector-update", {
            detail: {
              card: card,
              change: -1,
            },
          });
          console.log('Dispatching custom-event:', event);  // Add a log
          document.dispatchEvent(event);
        }
      };

      plusButton.addEventListener(
        "click",
        this.plusButtonListeners[card.multiverseid],
      );
      minusButton.addEventListener(
        "click",
        this.minusButtonListeners[card.multiverseid],
      );
    });
  }
}

// Template function to render the card details and quantity controls
export function cardListTemplate(card, quantities) {
  return `
      <div class="card-container">
        ${card.renderCard()} <!-- Render card details using the CardDetails class -->

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px;">
          <button id="minus-${card.multiverseid}">-</button>
          <input id="quantity-${card.multiverseid}" type="text" value="${quantities[card.multiverseid] || 1}" style="width: 40px; text-align: center;" readonly>
          <button id="plus-${card.multiverseid}">+</button>
        </div>
      </div>
    `;
}
