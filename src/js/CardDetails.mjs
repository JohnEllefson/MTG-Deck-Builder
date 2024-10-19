// CardDetails Class to handle card details and rendering
export class CardDetails {
  constructor(cardData) {
    this.name = cardData.name || "Unknown";
    this.manaCost = cardData.manaCost || "N/A";
    this.cmc = cardData.cmc || "N/A"; // Converted Mana Cost
    this.colors = cardData.colors ? cardData.colors.join(", ") : "Colorless";
    this.type = cardData.type || "N/A";
    this.subtypes = cardData.subtypes ? cardData.subtypes.join(", ") : "N/A";
    this.rarity = cardData.rarity || "N/A";
    this.set = cardData.set || "N/A";
    this.setName = cardData.setName || "N/A";
    this.text = cardData.text || "N/A";
    this.flavor = cardData.flavor || "No flavor text";
    this.power = cardData.power || "N/A";
    this.toughness = cardData.toughness || "N/A";
    this.imageUrl = cardData.imageUrl;
    this.multiverseid = cardData.multiverseid || "N/A";
    this.legalities = cardData.legalities
      ? cardData.legalities
          .map((legality) => `${legality.format}: ${legality.legality}`)
          .join(", ")
      : "N/A";
  }

  // Return HTML for card details
  renderCard() {
    return cardDetailsTemplate(this);
  }
}

// Card details template
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
