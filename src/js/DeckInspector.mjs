import { Deck } from "./Deck.mjs";
import { CardList } from "./CardList.mjs";
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export class DeckInspector {
  constructor() {
    this.decks = []; // List of Deck objects
    this.deckNames = {}; // Object to store unique names for each deck
    this.selectedDeck = null; // Track the selected deck

    // To store event listeners for removal later
    this.selectListeners = {};
    this.heartListeners = {};
    this.cloneListeners = {};
    this.trashListeners = {};
  }

  init() {
    const savedDecks = getLocalStorage("decks");
    if (savedDecks) {
      this.decks = savedDecks.map(deck => {
        const newDeck = new Deck();
        newDeck.name = deck.name;
        newDeck.isFavorited = deck.isFavorited;
        newDeck.cardList = new CardList(deck.cardList.cards.map(card => ({ ...card })));
        newDeck.cardList.quantities = { ...deck.cardList.quantities };
        newDeck.cardQuantity = deck.cardQuantity;
        newDeck.deckImage = deck.deckImage;
        if (deck.hasOwnProperty("description")) {
          newDeck.description = deck.description;
        }
        return newDeck;
      });
      
      // Update the deckNames object to maintain consistency
      this.decks.forEach(deck => {
        this.deckNames[deck.name] = true;
      });

      // Read in the selected deck name from local storage
      const loadedSelectedDeckName = getLocalStorage("selectedDeckName");
      if (loadedSelectedDeckName) {
        this.selectedDeck = this.decks.find(deck => deck.name === loadedSelectedDeckName);
      } else {
        this.selectedDeck = this.decks[0];
      } 
    }

/*     // Load in the selected deck name from local storage
    const loadedSelectedDeckName = getLocalStorage("selectedDeckName");
    if (loadedSelectedDeckName) {
      this.selectedDeck = this.decks.find(deck => deck.name === loadedSelectedDeckName);
    }

    if (!this.selectedDeck) {
      // If no selected deck is found, set the selected deck to the first deck in the list
      if (this.decks.length > 0) {
        this.selectedDeck = this.decks[0];
      }
    } */

    this.renderDeckInspector();
  }

  // 
  updateDeck(newDeck) {
    this.saveDeck();
    this.renderDeckInspector();
    console.log(`Deck "${newDeck.name}" updated successfully.`);
  }

  createDeck(name = "New Deck") {
    const newDeck = new Deck();
    let uniqueName = name;
    let counter = 1;
    while (this.deckNames[uniqueName]) {
      uniqueName = `${name} ${counter}`;
      counter++;
    }
    this.deckNames[uniqueName] = true;
    newDeck.name = uniqueName;
    newDeck.isFavorited = false;
    newDeck.cardList = new CardList([]);
    newDeck.cardQuantity = 0;
    newDeck.deckImage = null;
    if (this.decks.length === 0) {
      this.selectedDeck = newDeck;
    }

    this.decks.push(newDeck);
    this.saveDeck();
    this.renderDeckInspector();
  }

  selectDeck(deck) {
    this.selectedDeck = deck;
    this.saveDeck();
    this.renderDeckInspector();

    if (
      !this.selectedDeck.cardList ||
      !(this.selectedDeck.cardList instanceof CardList)
    ) {
      this.selectedDeck.cardList = new CardList(
        this.selectedDeck.cardList.cards || [],
      );
      this.selectedDeck.cardList.quantities = {
        ...this.selectedDeck.cardList.quantities,
      };
    }

    this._renderMainView();
  }

  renameDeck(newName) {
    if (this.selectedDeck && newName) {
      let uniqueName = newName;
      let counter = 1;
      while (this.deckNames[uniqueName]) {
        uniqueName = `${newName} ${counter}`;
        counter++;
      }
      this.deckNames[uniqueName] = true;
      delete this.deckNames[this.selectedDeck.name];
      this.selectedDeck.name = uniqueName;
      this.saveDeck();
      this.renderDeckInspector();
    }
  }

  cloneDeck(deck) {
    const clonedDeck = new Deck();
    clonedDeck.name = `${deck.name} Clone`;
    clonedDeck.cardList = new CardList(
      deck.cardList.cards.map((card) => ({ ...card })),
    );
    clonedDeck.cardList.quantities = { ...deck.cardList.quantities };
    clonedDeck.cardQuantity = deck.cardQuantity;
    clonedDeck.isFavorited = false;
    clonedDeck.deckImage = deck.deckImage || null;

    if (deck.hasOwnProperty("description")) {
      clonedDeck.description = deck.description;
    }

    this.decks.push(clonedDeck);
    this.saveDeck();
    this.renderDeckInspector();
  }

  deleteDeck(deck) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the deck "${deck.name}"?`,
    );
    if (confirmDelete) {
      this.decks = this.decks.filter((d) => d !== deck); // Remove the deck
      delete this.deckNames[deck.name]; // Remove the deck name from the object
      if (this.selectedDeck === deck && this.decks.length > 0) { // If the selected deck is deleted, select the first deck
        this.selectedDeck = this.decks[0];
      } else {
        this.selectedDeck = "";
      }

      this.saveDeck();
      this.renderDeckInspector();
      this._renderMainView();
    }
  }

  saveDeck() {
    setLocalStorage("decks", this.decks);

    if (this.selectedDeck) {
      setLocalStorage("selectedDeckName", this.selectedDeck.name);
    } else {
      setLocalStorage("selectedDeckName", "");
    }
  }

  toggleFavorite(deck) {
    deck.isFavorited = !deck.isFavorited;
    this.saveDeck();
    this.renderDeckInspector();
  }

  // New method to remove existing event listeners
  _removeEventListeners(deck) {
    if (this.selectListeners[deck.name]) {
      deck.element.removeEventListener(
        "click",
        this.selectListeners[deck.name],
      );
    }
    if (this.heartListeners[deck.name]) {
      deck.heartIcon.removeEventListener(
        "click",
        this.heartListeners[deck.name],
      );
    }
    if (this.cloneListeners[deck.name]) {
      deck.cloneIcon.removeEventListener(
        "click",
        this.cloneListeners[deck.name],
      );
    }
    if (this.trashListeners[deck.name]) {
      deck.trashIcon.removeEventListener(
        "click",
        this.trashListeners[deck.name],
      );
    }
  }

  renderDeckInspector() {
    const deckInspectorDiv = document.getElementById("deck-inspector");
    deckInspectorDiv.innerHTML = this.deckInspectorTemplate();
  
    // Add event listeners for dynamically created elements
    document.querySelectorAll(".deck-container").forEach((deckDiv, index) => {
      const deck = this.decks[index];
  
      deckDiv.querySelector(".heart-icon").addEventListener("click", () => {
        this.toggleFavorite(deck);
      });
  
      deckDiv.querySelector(".clone-icon").addEventListener("click", () => {
        this.cloneDeck(deck);
      });
  
      deckDiv.querySelector(".trash-icon").addEventListener("click", (event) => {
        event.stopPropagation();
        this.deleteDeck(deck);
      });
  
      deckDiv.addEventListener("click", () => this.selectDeck(deck));
    });
  
    // Event listener for Create button
    document.querySelector(".create-button").addEventListener("click", () => {
      this.createDeck();
    });
  
    // Event listener for Rename button
    const renameButton = document.querySelector(".rename-button");
    if (this.selectedDeck && renameButton) {
      renameButton.addEventListener("click", () => {
        const newName = prompt("Enter new name for the deck:");
        if (newName) this.renameDeck(newName);
      });
    }
  }
  
  _renderMainView() {
    const evt = new CustomEvent("deck-and-main-update", {});
    document.dispatchEvent(evt);

  } 

  // Template for deck inspector
  deckInspectorTemplate() {
    return `
      <div class="deck-image-container"> 
        <img src="${(this.selectedDeck && this.selectedDeck.deckImage) 
        ? this.selectedDeck.deckImage : ""}" 
        style="${(this.selectedDeck && this.selectedDeck.deckImage) 
          ? "" : "visibility: hidden;"}">
      </div>
      <div class="deck-inspector-container">
      <h2 style="text-align: center;">Deck Inspector</h2>
      <div class="deck-list-container">
        ${this.decks.length === 0
        ? `<p>No decks available. Create one to get started!</p>`
        : this.decks
          .sort((a, b) => {
            if (a.isFavorited && !b.isFavorited) return -1;
            if (!a.isFavorited && b.isFavorited) return 1;
            return a.name.localeCompare(b.name);
          })
          .map((deck) => {
            return `
            <div class="deck-container" style="background-color: ${
              deck === this.selectedDeck ? "#ddd" : "#fff"
            }">
              <div><strong>${deck.name}</strong> (qty: ${deck.cardQuantity})</div>
              <div>
              <img src="${
                deck.isFavorited
                ? "/images/icons/heart_solid.png"
                : "/images/icons/heart_border.png"
              }" class="heart-icon" />
              <img src="/images/icons/clone.png" class="clone-icon" />
              <img src="/images/icons/trash.png" class="trash-icon" />
              </div>
            </div>
            `;
          })
          .join('')}
      </div>
      <div class="deck-inspector-buttons">
        <button style="flex: 1;" class="create-button">Create</button>
        <button style="flex: 1;" class="rename-button" ${
        !this.selectedDeck ? "disabled" : ""
        }>Rename</button>
      </div>
      </div>
    `;
  }
}