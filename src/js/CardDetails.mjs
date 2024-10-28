// CardDetails Class to handle card details and rendering
export class CardDetails {
  constructor(cardData) {
    this.name = cardData.name || "Unknown";
    this.manaCost = cardData.manaCost || "N/A";
    this.cmc = cardData.cmc || "N/A";

    // Ensure colors are an array before joining
    if (typeof cardData.colors === "string") {
      this.colors = cardData.colors
        .split(",")
        .map((color) => color.trim())
        .join(", ");
    } else {
      this.colors = cardData.colors ? cardData.colors.join(", ") : "Colorless";
    }

    // Ensure subtypes are an array before joining
    if (typeof cardData.subtypes === "string") {
      this.subtypes = cardData.subtypes
        .split(",")
        .map((subtype) => subtype.trim())
        .join(", ");
    } else {
      this.subtypes = cardData.subtypes ? cardData.subtypes.join(", ") : "N/A";
    }

    this.type = cardData.type || "N/A";
    this.rarity = cardData.rarity || "N/A";
    this.set = cardData.set || "N/A";
    this.setName = cardData.setName || "N/A";
    this.text = cardData.text || "N/A";
    this.flavor = cardData.flavor || "No flavor text";
    this.power = cardData.power || "N/A";
    this.toughness = cardData.toughness || "N/A";
    this.imageUrl = cardData.imageUrl;
    this.multiverseid = cardData.multiverseid || "N/A";

    // Ensure legalities are properly formatted
    if (typeof cardData.legalities === "string") {
      this.legalities = cardData.legalities
        .split(",")
        .map((legality) => {
          if (legality.trim() === "N/A") {
            return "N/A";
          }
          const [format, status] = legality.split(":");
          return `${format.trim()}: ${status.trim()}`;
        })
        .join(", ");
    } else {
      this.legalities = cardData.legalities
        ? cardData.legalities
            .map((legality) => `${legality.format}: ${legality.legality}`)
            .join(", ")
        : "N/A";
    }
  }

  // Return HTML for limited card details (used in CardList)
  renderCard() {
    return cardDetailsTemplate(this);
  }

  // Return HTML for full card details (used in modal)
  renderFullCardDetails() {
    return cardFullDetailsTemplate(this);
  }
}

// Limited card details template for use in CardList
export function cardDetailsTemplate(card) {
  return `
      <div class="card-container" style="text-align: center;">
        <h3 class="card-name">${card.name}</h3>
        <img src="${card.imageUrl}" alt="${card.name}" style="width: 200px; height: 280px; display: block; margin: 0 auto;">
        <p class="card-details">Mana Cost: ${card.manaCost}</p>
        <p class="card-details">Power: ${card.power}</p>
        <p class="card-details">Toughness: ${card.toughness}</p>
      </div>
    `;
}

// Full card details template for use in the modal
export function cardFullDetailsTemplate(card) {
  return `
      <div class="card-container" style="text-align: center;">
        <h3 class="card-name">${card.name}</h3>
        <img src="${card.imageUrl}" alt="${card.name}" style="width: 300px; height: auto;">
        <p class="card-details">Mana Cost: ${card.manaCost}</p>
        <p class="card-details">Converted Mana Cost: ${card.cmc}</p>
        <p class="card-details">Type: ${card.type}</p>
        <p class="card-details">Subtypes: ${card.subtypes}</p>
        <p class="card-details">Rarity: ${card.rarity}</p>
        <p class="card-details">Set: ${card.setName}</p>
        <p class="card-details">Power: ${card.power}</p>
        <p class="card-details">Toughness: ${card.toughness}</p>
        <p class="card-details">Text: ${card.text}</p>
        <p class="card-details">Flavor Text: ${card.flavor}</p>
        <p class="card-details">Colors: ${card.colors}</p>
        <p class="card-details">Legalities: ${card.legalities}</p>
      </div>
    `;
}
