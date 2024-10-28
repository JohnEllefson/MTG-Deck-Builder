import { CardDetails } from "./CardDetails.mjs";

export class CardList {
  constructor(cards) {
    this.cards = cards.map((card) => new CardDetails(card));
    this.quantities = {};

    // Keep track of event listeners so they can be removed later
    this.photoButtonListeners = {};
    this.plusButtonListeners = {};
    this.minusButtonListeners = {};
    this.imageClickListeners = {};

    this.init();
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

    const mainViewSelection =
      document.getElementById("mainViewSelection").value;

    // After rendering, set up the quantity control functionality
    this.cards.forEach((card) => {
      const photoButton = document.getElementById(
        `card-photo-button-${card.multiverseid}`,
      );
      const plusButton = document.getElementById(`plus-${card.multiverseid}`);
      const minusButton = document.getElementById(`minus-${card.multiverseid}`);
      const quantityInput = document.getElementById(
        `quantity-${card.multiverseid}`,
      );
      const cardImage = document.getElementById(
        `card-image-${card.multiverseid}`,
      );

      // Disable the photo button and make it invisible if the main view is set to MTG_Cards
      if (mainViewSelection === "MTG_Cards") {
        photoButton.disabled = true;
        photoButton.style.display = "none";
      }

      // Only initialize the quantity if it doesn't already exist
      if (this.quantities[card.multiverseid] === undefined) {
        this.quantities[card.multiverseid] = 0; // Initialize quantity to 0 if not present
      }
      quantityInput.value = this.quantities[card.multiverseid]; // Set input to the current quantity

      // Highlight the card container if quantity > 0
      const cardContainer = document.getElementById(
        `card-container-${card.multiverseid}`,
      );
      if (this.quantities[card.multiverseid] > 0) {
        cardContainer.classList.add("highlight-border");
      } else {
        cardContainer.classList.remove("highlight-border");
      }

      // Remove existing event listeners if they exist
      if (this.photoButtonListeners[card.multiverseid]) {
        photoButton.removeEventListener(
          "click",
          this.photoButtonListeners[card.multiverseid],
        );
      }
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
      if (this.imageClickListeners[card.multiverseid]) {
        cardImage.removeEventListener(
          "click",
          this.imageClickListeners[card.multiverseid],
        );
      }

      // Photo button listener
      this.photoButtonListeners[card.multiverseid] = () => {
        const event = new CustomEvent("deck-inspector-update", {
          detail: {
            card: card,
            change: 2,
          },
        });
        document.dispatchEvent(event);
      };
      photoButton.addEventListener(
        "click",
        this.photoButtonListeners[card.multiverseid],
      );

      // Plus button listener
      this.plusButtonListeners[card.multiverseid] = () => {
        const event = new CustomEvent("deck-inspector-update", {
          detail: {
            card: card,
            change: 1,
          },
        });
        document.dispatchEvent(event);
      };
      plusButton.addEventListener(
        "click",
        this.plusButtonListeners[card.multiverseid],
      );

      // Minus button listener
      this.minusButtonListeners[card.multiverseid] = () => {
        if (this.quantities[card.multiverseid] > 0) {
          const event = new CustomEvent("deck-inspector-update", {
            detail: {
              card: card,
              change: -1,
            },
          });
          document.dispatchEvent(event);
        }
      };
      minusButton.addEventListener(
        "click",
        this.minusButtonListeners[card.multiverseid],
      );

      // Card image click listener for modal
      this.imageClickListeners[card.multiverseid] = () => {
        showModal(card);
      };
      cardImage.addEventListener(
        "click",
        this.imageClickListeners[card.multiverseid],
      );
    });
  }
}

// Template function to render the card details and quantity controls
export function cardListTemplate(card, quantities) {
  return `
      <div id="card-container-${card.multiverseid}" class="card-container">
        <div id="card-photo-button-${card.multiverseid}" class="photo-icon"><img src="/images/icons/camera.png" /></div>
        <div id="card-image-${card.multiverseid}" class="clickable-card-image">
          ${card.renderCard()} <!-- Render the card image and details -->
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px;">
          <button id="minus-${card.multiverseid}" class="minus-button">-</button>
          <input id="quantity-${card.multiverseid}" type="text" value="${quantities[card.multiverseid] || 0}" style="width: 40px; text-align: center;" readonly>
          <button id="plus-${card.multiverseid}" class="plus-button">+</button>
        </div>
      </div>
    `;
}

// Function to display the modal with full card details
function showModal(card) {
  const modal = document.getElementById("card-modal");
  const modalCardDetails = document.getElementById("modal-card-details");

  // Populate the modal with full card details
  modalCardDetails.innerHTML = card.renderFullCardDetails();

  // Display the modal
  modal.style.display = "flex";

  // Close the modal when the close button is clicked
  document.getElementById("close-modal").addEventListener("click", () => {
    modal.style.display = "none";
  });
}
