import { CardDetails } from "./CardDetails.mjs";

export class CardList {
  constructor(cards) {
    this.cards = cards.map((card) => new CardDetails(card)); // Store each CardDetails object
    this.quantities = {}; // To store quantities for each card
  }

  // Initialize and render the card list
  init() {
    // Filter out cards that don't have an image URL
    this.cards = this.cards.filter((card) => {
      if (card.imageUrl) {
        return true; // Keep the card if an image URL exists
      } else {
        console.warn(`Card ${card.name} has no image and will be excluded.`);
        return false; // Exclude the card if the image URL is missing or invalid
      }
    });
  }

  // Render each card in the list using the cardListTemplate
  renderCardList() {
    const cardResultsDiv = document.getElementById("card-results");
    cardResultsDiv.innerHTML = ""; // Clear any existing content

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

      this.quantities[card.multiverseid] = 0; // Initialize quantity to 0

      plusButton.addEventListener("click", () => {
        this.quantities[card.multiverseid] += 1;
        quantityInput.value = this.quantities[card.multiverseid];
      });

      minusButton.addEventListener("click", () => {
        if (this.quantities[card.multiverseid] > 0) {
          this.quantities[card.multiverseid] -= 1;
          quantityInput.value = this.quantities[card.multiverseid];
        }
      });
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
          <input id="quantity-${card.multiverseid}" type="text" value="${quantities[card.multiverseid] || 0}" style="width: 40px; text-align: center;" readonly>
          <button id="plus-${card.multiverseid}">+</button>
        </div>
      </div>
    `;
}
