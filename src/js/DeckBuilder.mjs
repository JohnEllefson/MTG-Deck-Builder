import { loadHeaderFooter } from "./utils.mjs";
import { CardList } from './CardList.mjs'; // Import the CardList class

loadHeaderFooter();

// Listen for the custom event when search results are ready from ExternalServices.mjs
document.addEventListener('search-results-ready', function (e) {
  const cards = e.detail; // Get the cards from the event detail
  const cardList = new CardList(cards); // Initialize CardList with the API results
  cardList.init(); // Render the list of cards
});