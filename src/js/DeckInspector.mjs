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

    // Load in the selected deck name from local storage
    const loadedSelectedDeckName = getLocalStorage("selectedDeckName");
    if (loadedSelectedDeckName) {
      this.selectedDeck = this.decks.find(deck => deck.name === loadedSelectedDeckName);
    }

    if (!this.selectedDeck) {
      // If no selected deck is found, set the selected deck to the first deck in the list
      if (this.decks.length > 0) {
        this.selectedDeck = this.decks[0];
      }
    }

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
    deckInspectorDiv.innerHTML = "";

    const inspectorContainer = document.createElement("div");
    inspectorContainer.className = "deck-inspector-container";
    inspectorContainer.innerHTML = `<h2 style="text-align: center;">Deck Inspector</h2>`;

    if (this.decks.length === 0) {
      const noDecksMessage = document.createElement("p");
      noDecksMessage.textContent =
        "No decks available. Create one to get started!";
      inspectorContainer.appendChild(noDecksMessage);

      const buttonsContainerOuter = document.createElement("div");
      buttonsContainerOuter.className = "deck-inspector-buttons";

      const createButton = document.createElement("button");
      createButton.textContent = "Create";
      createButton.addEventListener("click", () => this.createDeck());
      buttonsContainerOuter.appendChild(createButton);

      const renameButtonOuter = document.createElement("button");
      renameButtonOuter.textContent = "Rename";
      renameButtonOuter.disabled = true;
      buttonsContainerOuter.appendChild(renameButtonOuter);

      const saveButtonOuter = document.createElement("button");
      saveButtonOuter.textContent = "Save";
      saveButtonOuter.disabled = true;
      buttonsContainerOuter.appendChild(saveButtonOuter);

      inspectorContainer.appendChild(buttonsContainerOuter);
      deckInspectorDiv.appendChild(inspectorContainer);
      return;
    }

    this.decks.sort((a, b) => {
      if (a.isFavorited && !b.isFavorited) return -1;
      if (!a.isFavorited && b.isFavorited) return 1;
      return a.name.localeCompare(b.name);
    });

    this.decks.forEach((deck) => {
      const deckDiv = document.createElement("div");
      deckDiv.className = "deck-container";
      deckDiv.style.backgroundColor =
        deck === this.selectedDeck ? "#ddd" : "#fff";
      deck.element = deckDiv;

      const deckInfo = document.createElement("div");
      deckInfo.innerHTML = `<strong>${deck.name}</strong> (qty: ${deck.cardQuantity})`;
      deckDiv.appendChild(deckInfo);

      const heartIcon = document.createElement("img");
      heartIcon.src = deck.isFavorited
        ? "/images/icons/heart_solid.png"
        : "/images/icons/heart_border.png";
      deck.heartIcon = heartIcon;

      const cloneIcon = document.createElement("img");
      cloneIcon.src = "/images/icons/clone.png";
      deck.cloneIcon = cloneIcon;

      const trashIcon = document.createElement("img");
      trashIcon.src = "/images/icons/trash.png";
      deck.trashIcon = trashIcon;

      // Remove old event listeners before adding new ones
      this._removeEventListeners(deck);

      // Add event listeners and store them for removal later
      this.trashListeners[deck.name] = (event) => {
        event.stopPropagation(); // Prevent the event from bubbling up to the parent <div>
        this.deleteDeck(deck);
      };
      trashIcon.addEventListener("click", this.trashListeners[deck.name]);

      this.selectListeners[deck.name] = () => this.selectDeck(deck);
      deckDiv.addEventListener("click", this.selectListeners[deck.name]);

      this.heartListeners[deck.name] = () => this.toggleFavorite(deck);
      heartIcon.addEventListener("click", this.heartListeners[deck.name]);

      this.cloneListeners[deck.name] = () => this.cloneDeck(deck);
      cloneIcon.addEventListener("click", this.cloneListeners[deck.name]);

 /*      this.trashListeners[deck.name] = () => this.deleteDeck(deck);
      trashIcon.addEventListener("click", this.trashListeners[deck.name]); */

      deckDiv.appendChild(heartIcon);
      deckDiv.appendChild(cloneIcon);
      deckDiv.appendChild(trashIcon);
      inspectorContainer.appendChild(deckDiv);
    });

    const buttonsContainerInner = document.createElement("div");
    buttonsContainerInner.className = "deck-inspector-buttons";

    const createButtonInner = document.createElement("button");
    createButtonInner.textContent = "Create";
    createButtonInner.addEventListener("click", () => this.createDeck());
    buttonsContainerInner.appendChild(createButtonInner);

    const renameButtonInner = document.createElement("button");
    renameButtonInner.textContent = "Rename";
    renameButtonInner.disabled = !this.selectedDeck;
    renameButtonInner.addEventListener("click", () => {
      const newName = prompt("Enter new name for the deck:");
      if (newName) this.renameDeck(newName);
    });
    buttonsContainerInner.appendChild(renameButtonInner);

    const saveButtonInner = document.createElement("button");
    saveButtonInner.textContent = "Save";
    saveButtonInner.disabled = !this.selectedDeck;
    saveButtonInner.addEventListener("click", () => this.saveDeck());
    buttonsContainerInner.appendChild(saveButtonInner);

    inspectorContainer.appendChild(buttonsContainerInner);
    deckInspectorDiv.appendChild(inspectorContainer);
  }

  _renderMainView() {
/*     const mainViewSelection = document.getElementById("mainViewSelection").value;
    if (mainViewSelection === "Deck_Contents") {
      if (this.selectedDeck) {
        if (this.selectedDeck.cardList.cards.length > 0) {
          this.selectedDeck.cardList.renderCardList();
        } else {
          document.getElementById("card-results").innerHTML =
            "<p>No cards in the selected deck.</p>";
        }
      } else {
        document.getElementById("card-results").innerHTML =
          "<p>No deck selected.</p>";
      }
    } */

    const evt = new CustomEvent("deck-and-main-update", {});
    document.dispatchEvent(evt);

  } 
}
