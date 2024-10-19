import { loadHeaderFooter } from "./utils.mjs";
import { CardList } from "./CardList.mjs";
import { DeckInspector } from './DeckInspector.mjs';

loadHeaderFooter();

// Initialize DeckInspector
const deckInspector = new DeckInspector();
deckInspector.init(); // load saved decks and render the deck list

// Listen for the custom event when search results are ready from ExternalServices.mjs
document.addEventListener("search-results-ready", function (e) {
  const cards = e.detail; // Get the cards from the event detail
  const cardList = new CardList(cards); // Initialize CardList with the API results
  cardList.init(); // Initialize the card list
  cardList.renderCardList(); // Render the card list
});
