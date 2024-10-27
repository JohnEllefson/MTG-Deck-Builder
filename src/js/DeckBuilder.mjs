import {
  loadHeaderFooter,
  getLocalStorage,
  setLocalStorage,
} from "./utils.mjs";
import { CardList } from "./CardList.mjs";
import { DeckInspector } from "./DeckInspector.mjs";

// Load header and footer
loadHeaderFooter();

// Initialize DeckInspector
const deckInspector = new DeckInspector();
deckInspector.init(); // Load saved decks and render the deck list

// Load test card data from TestCards.json
fetch("/json/TestCards.json")
  .then((response) => response.json())
  .then((data) => {
    // Retrieve existing decks from local storage
    const existingDecks = getLocalStorage("decks") || [];

    // Load the decks from the test data
    data.decks.forEach((deckData) => {
      // Convert card data fields to arrays where necessary
      deckData.cards.forEach((card) => {
        // Ensure colors are an array
        if (typeof card.colors === "string") {
          card.colors = card.colors.split(",").map((color) => color.trim());
        }

        // Ensure subtypes are an array
        if (typeof card.subtypes === "string") {
          card.subtypes = card.subtypes
            .split(",")
            .map((subtype) => subtype.trim());
        }

        // Ensure legalities are an array of objects if provided as a string
        if (typeof card.legalities === "string") {
          card.legalities = card.legalities.split(",").map((legality) => {
            const [format, status] = legality.split(":");
            return { format: format.trim(), legality: status.trim() };
          });
        }
      });

      // Check if this deck already exists in local storage
      const deckExists = existingDecks.some(
        (existingDeck) => existingDeck.name === deckData.name,
      );

      if (!deckExists) {
        const cardList = new CardList(deckData.cards); // Create a CardList from deck cards
        // cardList.init(); // Initialize the card list

        // Create the deck and assign the cardList to it
        const deck = {
          name: deckData.name,
          cardList: cardList,
          cardQuantity: deckData.cards.length,
          isFavorited: false,
          deckImage: deckData.cards.length > 0 ? deckData.cards[0].imageUrl : null,
        };

        deckInspector.decks.push(deck); // Add the deck to the DeckInspector

        // Generate a quantities object for the CardList
        const quantities = {};
        deckData.cards.forEach((card) => {
          quantities[card.multiverseid] = 1;
        });

        // Add the new deck to the list of existing decks in local storage
        existingDecks.push({
          name: deckData.name,
          cardList: {
            cards: deckData.cards,
            quantities: quantities, // Add the quantities object from CardList
          },
          cardQuantity: deckData.cards.length,
          isFavorited: false,
          deckImage: deckData.cards.length > 0 ? deckData.cards[0].imageUrl : null,
        });
      }
    });

    // Save the updated decks list to local storage
    setLocalStorage("decks", existingDecks);

    // Save the selected deck name to local storage
    setLocalStorage("selectedDeckName", existingDecks[0].name);

    // Re-render the DeckInspector with the test decks
    deckInspector.renderDeckInspector();
  })
  .catch((error) => console.error("Error loading test card data:", error));