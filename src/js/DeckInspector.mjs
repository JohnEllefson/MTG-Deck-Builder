import { Deck } from "./Deck.mjs";
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export class DeckInspector {
  constructor() {
    this.decks = []; // List of Deck objects
    this.deckNames = {}; // Object to store unique names for each deck
    this.selectedDeck = null; // Track the selected deck
  }

  // Initialize the deck inspector, load decks from local storage, and render the UI
  init() {
    const savedDecks = getLocalStorage("decks");
    if (savedDecks) {
      this.decks = savedDecks;
    }
    this.renderDeckInspector();
  }

  // Method to create a new Deck and add it to the list
  createDeck(name = "New Deck") {
    const newDeck = new Deck();
    let uniqueName = name;
    let counter = 1;
    // Ensure unique name
    while (this.deckNames[uniqueName]) {
      uniqueName = `${name} ${counter}`;
      counter++;
    }
    this.deckNames[uniqueName] = true; // Store the unique deck name
    newDeck.name = uniqueName;
    newDeck.isFavorited = false; // Initialize the deck as not favorited
    this.decks.push(newDeck);
    this.saveDeck(); // Save the updated deck list
    this.renderDeckInspector();
  }

  // Method to select a deck, making it the active deck
  selectDeck(deck) {
    this.selectedDeck = deck;
    this.renderDeckInspector(); // Update the rendering to highlight the selected deck
    deck.cardList.renderCardList(); // Optionally, render the selected deck's card list in the center
  }

  // Method to rename the currently selected deck
  renameDeck(newName) {
    if (this.selectedDeck && newName) {
      let uniqueName = newName;
      let counter = 1;
      // Ensure unique name
      while (this.deckNames[uniqueName]) {
        uniqueName = `${newName} ${counter}`;
        counter++;
      }
      this.deckNames[uniqueName] = true;
      delete this.deckNames[this.selectedDeck.name]; // Remove the old name
      this.selectedDeck.name = uniqueName;
      this.saveDeck(); // Save changes to local storage
      this.renderDeckInspector();
    }
  }

  // Method to clone a deck
  cloneDeck(deck) {
    const clonedDeck = { ...deck, name: `${deck.name} Clone` }; // Clone the deck with a new name
    this.createDeck(clonedDeck.name); // Add the cloned deck to the list
  }

  // Method to delete a deck with confirmation
  deleteDeck(deck) {
    const confirmDelete = window.confirm(`Are you sure you want to delete the deck "${deck.name}"?`);
    if (confirmDelete) {
      this.decks = this.decks.filter((d) => d !== deck);
      delete this.deckNames[deck.name];
      this.saveDeck(); // Save changes
      this.renderDeckInspector();
    }
  }

  // Method to save the current deck state to local storage
  saveDeck() {
    setLocalStorage("decks", this.decks);
  }

  // Method to toggle favorite status of a deck
  toggleFavorite(deck) {
    deck.isFavorited = !deck.isFavorited; // Toggle favorite status
    this.saveDeck(); // Save the updated favorite status to local storage
    this.renderDeckInspector(); // Re-render the deck inspector to reflect changes
  }

  // Method to render the deck inspector UI
  renderDeckInspector() {
    const deckInspectorDiv = document.getElementById("deck-inspector");
    deckInspectorDiv.innerHTML = ""; // Clear current UI

    // Create the Deck Inspector outline
    const inspectorContainer = document.createElement("div");
    inspectorContainer.className = "deck-inspector-container";
    inspectorContainer.innerHTML = `<h2>Deck Inspector</h2>`; // Title

    // If no decks are available, display the buttons and disable Rename/Save
    if (this.decks.length === 0) {
      const noDecksMessage = document.createElement("p");
      noDecksMessage.textContent = "No decks available. Create one to get started!";
      inspectorContainer.appendChild(noDecksMessage);

      // Create buttons container
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "deck-inspector-buttons";

      // Create button (enabled)
      const createButton = document.createElement("button");
      createButton.textContent = "Create";
      createButton.addEventListener("click", () => this.createDeck()); // Create new deck
      buttonsContainer.appendChild(createButton);

      // Rename button (disabled)
      const renameButton = document.createElement("button");
      renameButton.textContent = "Rename";
      renameButton.disabled = true; // No decks available, so disable this button
      buttonsContainer.appendChild(renameButton);

      // Save button (disabled)
      const saveButton = document.createElement("button");
      saveButton.textContent = "Save";
      saveButton.disabled = true; // No decks available, so disable this button
      buttonsContainer.appendChild(saveButton);

      inspectorContainer.appendChild(buttonsContainer);
      deckInspectorDiv.appendChild(inspectorContainer);
      return;
    }

    // Sort decks: favorited first, then alphabetically by name
    this.decks.sort((a, b) => {
      if (a.isFavorited && !b.isFavorited) return -1; // Favorited decks first
      if (!a.isFavorited && b.isFavorited) return 1; // Non-favorited decks after
      return a.name.localeCompare(b.name); // Sort alphabetically by name
    });

    // If decks are available, render them
    this.decks.forEach((deck) => {
      const deckDiv = document.createElement("div");
      deckDiv.className = "deck-container";
      deckDiv.style.backgroundColor = deck === this.selectedDeck ? "#ddd" : "#fff"; // Highlight selected deck

      // Deck name and quantity
      const deckInfo = document.createElement("div");
      deckInfo.innerHTML = `<strong>${deck.name}</strong> (qty: ${deck.cardQuantity})`;
      deckDiv.appendChild(deckInfo);

      // Action icons: heart (favorite), clone, delete
      const heartIcon = document.createElement("img");
      heartIcon.src = deck.isFavorited ? "/images/icons/heart_solid.png" : "/images/icons/heart_boarder.png"; // Toggle heart icon
      heartIcon.addEventListener("click", () => this.toggleFavorite(deck)); // Toggle favorite status

      const cloneIcon = document.createElement("img");
      cloneIcon.src = "/images/icons/clone.png"; // Path to clone image
      cloneIcon.addEventListener("click", () => this.cloneDeck(deck)); // Use arrow function to bind context

      const trashIcon = document.createElement("img");
      trashIcon.src = "/images/icons/trash.png"; // Path to trash image
      trashIcon.addEventListener("click", () => this.deleteDeck(deck)); // Use arrow function to bind context

      // Append icons to deckDiv
      deckDiv.appendChild(heartIcon);
      deckDiv.appendChild(cloneIcon);
      deckDiv.appendChild(trashIcon);

      // Make the deck clickable to select it
      deckDiv.addEventListener("click", () => this.selectDeck(deck)); // Use arrow function to bind context

      // Add deckDiv to the inspector container
      inspectorContainer.appendChild(deckDiv);
    });

    // Create buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "deck-inspector-buttons";

    // Create button (enabled)
    const createButton = document.createElement("button");
    createButton.textContent = "Create";
    createButton.addEventListener("click", () => this.createDeck());
    buttonsContainer.appendChild(createButton);

    // Rename button (enabled only if a deck is selected)
    const renameButton = document.createElement("button");
    renameButton.textContent = "Rename";
    renameButton.disabled = !this.selectedDeck; // Enable only if a deck is selected
    renameButton.addEventListener("click", () => {
      const newName = prompt("Enter new name for the deck:");
      if (newName) this.renameDeck(newName);
    });
    buttonsContainer.appendChild(renameButton);

    // Save button (enabled only if a deck is selected)
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.disabled = !this.selectedDeck; // Enable only if a deck is selected
    saveButton.addEventListener("click", () => this.saveDeck());
    buttonsContainer.appendChild(saveButton);

    inspectorContainer.appendChild(buttonsContainer);

    // Append the entire inspector container to the deckInspectorDiv
    deckInspectorDiv.appendChild(inspectorContainer);
  }
}