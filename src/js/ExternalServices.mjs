import { DeckInspector } from "./DeckInspector.mjs";
import { CardList } from "./CardList.mjs";
import { Deck } from "./Deck.mjs";
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export let deckInspector = new DeckInspector();
window.deckInspector = deckInspector; // Make deckInspector globally accessible
export let cardListMTG = new CardList([]);

document.addEventListener("DOMContentLoaded", async function () {
  deckInspector.init();

  let mainViewSelection = "MTG_Cards"; // Default to MTG API search

  await initializeDropdowns();

// Listener: Main view selection
document
  .getElementById("mainViewSelection")
  .addEventListener("change", (e) => {
    const mainViewSelection = e.target.value;

    // Get references to the dropdowns and submit button
    const cardName = document.getElementById("card-name");
    const cardType = document.getElementById("card-type");
    const cardSubtype = document.getElementById("card-subtype");
    const cardSet = document.getElementById("card-set");
    const cardFormat = document.getElementById("card-format");
    const submitButton = document.querySelector("#search-form button[type='submit']");

    if (mainViewSelection === "Deck_Contents") {
      // Disable dropdowns and submit button
      [cardName, cardType, cardSubtype, cardSet, cardFormat, submitButton].forEach((element) => {
        element.disabled = true;
        element.classList.add("disabled-dropdown");
      });
    } else {
      // Enable dropdowns and submit button
      [cardName, cardType, cardSubtype, cardSet, cardFormat, submitButton].forEach((element) => {
        element.disabled = false;
        element.classList.remove("disabled-dropdown");
      });
    }

    // Existing logic to display deck contents or MTG cards
    if (mainViewSelection === "Deck_Contents") {
      let selectedDeck = reassignDeck();
      if (selectedDeck) {
        if (selectedDeck.cardList.cards.length > 0) {
          selectedDeck.cardList.renderCardList();
        } else {
          document.getElementById("card-results").innerHTML = "";
        }
      } else {
        document.getElementById("card-results").innerHTML = "";
      }
    } else {
      if (cardListMTG.cards.length > 0) {
        updateMTGCardList(cardListMTG);
        cardListMTG.renderCardList();
      } else {
        document.getElementById("card-results").innerHTML = "";
      }
    }
  });

  // Listener: Search form submission
  document
    .getElementById("search-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const cardName = document.getElementById("card-name").value;
      const cardType = document.getElementById("card-type").value;
      const cardSubtype = document.getElementById("card-subtype").value;
      const cardSet = document.getElementById("card-set").value;
      const cardFormat = document.getElementById("card-format").value;

      document.getElementById("card-results").innerHTML = "";

      if (mainViewSelection === "MTG_Cards") {
        let query = `https://api.magicthegathering.io/v1/cards?`;
        if (cardName) query += `name=${cardName}&`;
        if (cardType) query += `type=${cardType}&`;
        if (cardSubtype) query += `subtypes=${cardSubtype}&`;

        const sets = getLocalStorage("MTG_Sets");
        const selectedSet = sets.find(set => set.name === cardSet);
        if (selectedSet) query += `set=${selectedSet.code}&`;
        
        if (cardFormat) query += `gameFormat=${cardFormat}&`;

        try {
          const response = await fetch(query);
          if (!response.ok) throw new Error("Failed to fetch cards");
          const data = await response.json();
          let cards = data.cards;
          cards = cards.filter((card) => card.imageUrl);

          // Save the cards gathered from the API to the cardListMTG
          cardListMTG = new CardList(cards);
          // Loop through all cards and update the quantities object to be 0
          cardListMTG.cards.forEach((card) => {
            cardListMTG.quantities[card.multiverseid] = 0;
          });
          // Update the cardListMTG to match the quantites of the selected deck
          updateMTGCardList(cardListMTG);

          if (cardListMTG.cards.length === 0) {
            document.getElementById("card-results").innerHTML =
              "<p>No cards with images found.</p>";
          } else {
            const event = new CustomEvent("search-results-ready", {
              detail: cardListMTG,
            });
            document.dispatchEvent(event);
          }
        } catch (error) {
          console.error("Error fetching cards:", error);
          document.getElementById("card-results").innerHTML =
            "<p>Error fetching cards. Please try again.</p>";
        }
      }
    });

  // Listener: Search form - result from search ready
  document.addEventListener("search-results-ready", (event) => {
    const cardList = event.detail;
    cardList.renderCardList();
  });

  // Listener: a card plus or minus button was clicked, update the
  // deck inspector accordingly
  document.addEventListener("deck-inspector-update", (event) => {
    const card = event.detail.card;
    const change = event.detail.change;

    // Ensure selectedDeck is an instance of Deck
    let selectedDeck = reassignDeck();

    if (selectedDeck) {
      const existingCard = selectedDeck.cardList.cards.find(
        (c) => c.multiverseid === card.multiverseid,
      );

      if (existingCard) {

        // If the photo icon was clicked, update the deck image
        if (change === 2) {

          selectedDeck.deckImage = card.imageUrl;
          deckInspector.updateDeck(selectedDeck);
          updateMTGCardList(cardListMTG);
          deckInspector.renderDeckInspector();
          return;
        }

        selectedDeck.cardList.quantities[card.multiverseid] += change;

        if (selectedDeck.cardList.quantities[card.multiverseid] <= 0) {
          selectedDeck.removeCard(existingCard);
          delete selectedDeck.cardList.quantities[card.multiverseid];
        } else {
          selectedDeck.updateCardQuantity(change);
        }
      } else if (change > 0) {
        selectedDeck.addCard(card);
        selectedDeck.cardList.quantities[card.multiverseid] = 1;
      }

      if (selectedDeck.deckImage === card.imageUrl && change < 0) {
        selectedDeck.checkDeckImage(card);
      }

      // Save deck data to local storage and render the deck inspector
      deckInspector.updateDeck(selectedDeck);
    }

    updateMTGCardList(cardListMTG);

    // Dispatch an event to notify that the deck inspector is ready
    const evt = new CustomEvent("deck-and-main-update", {});
    document.dispatchEvent(evt);

  });
});

  // Listener: Update the deck inspector and main view
  document.addEventListener("deck-and-main-update", () => {
    const mainViewSelection = document.getElementById("mainViewSelection").value;
    // If the selected deck has any cards in it, render the card list
    if (mainViewSelection === "Deck_Contents") {
      // Ensure selectedDeck is an instance of Deck
      let selectedDeck = reassignDeck();
      if (selectedDeck) {
        if (deckInspector.selectedDeck.cardList.cards.length > 0) {
          deckInspector.selectedDeck.cardList.renderCardList(); // Show selected deck contents
        } else {
          document.getElementById("card-results").innerHTML = "";
        }
      } else {
        document.getElementById("card-results").innerHTML = "No decks selected";
      }
    } else { // If the MTG card list has cards, render them
      if (cardListMTG.cards.length > 0) {
        updateMTGCardList(cardListMTG);
        cardListMTG.renderCardList();
      } else {
        document.getElementById("card-results").innerHTML = "";
      }
    }
  });

async function initializeDropdowns() {
  const typeKey = "MTG_Types";
  const subtypeKey = "MTG_Subtypes";
  const setKey = "MTG_Sets";
  const formatKey = "MTG_Formats";

  const types = getLocalStorage(typeKey);
  const subtypes = getLocalStorage(subtypeKey);
  const sets = getLocalStorage(setKey);
  const formats = getLocalStorage(formatKey);

  if (!types || !subtypes || !sets || !formats) {
    const [typesData, subtypesData, setsData, formatsData] = await Promise.all([
      fetch("https://api.magicthegathering.io/v1/types").then((res) =>
        res.json(),
      ),
      fetch("https://api.magicthegathering.io/v1/subtypes").then((res) =>
        res.json(),
      ),
      fetch("https://api.magicthegathering.io/v1/sets").then((res) =>
        res.json(),
      ),
      fetch("https://api.magicthegathering.io/v1/formats").then((res) =>
        res.json(),
      ),
    ]);

    setLocalStorage(typeKey, typesData.types);
    setLocalStorage(subtypeKey, subtypesData.subtypes);
    setLocalStorage(setKey, setsData.sets);
    setLocalStorage(formatKey, formatsData.formats);

    populateDropdown("card-type", typesData.types);
    populateDropdown("card-subtype", subtypesData.subtypes);
    populateDropdown(
      "card-set",
      setsData.sets.map((set) => set.name),
    );
    populateDropdown("card-format", formatsData.formats);
  } else {
    populateDropdown("card-type", types);
    populateDropdown("card-subtype", subtypes);
    populateDropdown(
      "card-set",
      sets.map((set) => set.name),
    );
    populateDropdown("card-format", formats);
  }
}

function populateDropdown(elementId, options) {
  const selectElement = document.getElementById(elementId);
  options.forEach((option) => {
    const optElement = document.createElement("option");
    optElement.value = option;
    optElement.textContent = option;
    selectElement.appendChild(optElement);
  });
}

// Ensure selectedDeck is an instance of Deck
function reassignDeck() {
  // Create a deep copy of all elements of the DeckIspector object
  deckInspector = new DeckInspector();
  deckInspector.init(); // Load saved decks

  // Search through each deck and find the one that has been selected
  let matchingDeck = deckInspector.decks.find((deck) => deck.name === deckInspector.selectedDeck.name);
return matchingDeck;
}

// Update the cardListMTG with the cards gathered from the API. Check to see if
// the cardListMTG is empty, if it is then check to see which cards also exist in
// the selected deck and update the quantities object accordingly.
function updateMTGCardList(cardList) {
  if (cardList.cards.length >= 0) {    
    // Set all card quantities to 0
    cardList.cards.forEach((card) => {
      cardList.quantities[card.multiverseid] = 0;
    });
    // Ensure selectedDeck is an instance of Deck
    if (!(deckInspector instanceof DeckInspector)) {
      deckInspector = new DeckInspector();
      deckInspector.init(); // Load saved decks
    }
    // Check if any of the cards in cardlist match those found
    // in the selected deck and update the quantities object.
    if (deckInspector.selectedDeck) {
      cardList.cards.forEach((card) => {
        const existingCard = deckInspector.selectedDeck.cardList.cards.find(
          (c) => c.multiverseid === card.multiverseid,
        );
        if (existingCard) {
          cardList.quantities[existingCard.multiverseid] =
            deckInspector.selectedDeck.cardList.quantities[existingCard.multiverseid];
        }
      });
    } 
  } 
}