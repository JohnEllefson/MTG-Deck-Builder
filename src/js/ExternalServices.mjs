document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Fetch and populate card types
    console.log("Fetching card types...");
    const typeResponse = await fetch(
      "https://api.magicthegathering.io/v1/types",
    );
    if (!typeResponse.ok) throw new Error("Failed to fetch card types");
    const typeData = await typeResponse.json();
    const types = typeData.types;
    const typeSelect = document.getElementById("card-type");
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching card types:", error);
  }

  try {
    // Fetch and populate card subtypes
    console.log("Fetching card subtypes...");
    const subtypeResponse = await fetch(
      "https://api.magicthegathering.io/v1/subtypes",
    );
    if (!subtypeResponse.ok) throw new Error("Failed to fetch card subtypes");
    const subtypeData = await subtypeResponse.json();
    const subtypes = subtypeData.subtypes;
    const subtypeSelect = document.getElementById("card-subtype");
    subtypes.forEach((subtype) => {
      const option = document.createElement("option");
      option.value = subtype;
      option.textContent = subtype;
      subtypeSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching card subtypes:", error);
  }

  try {
    // Fetch and populate sets
    console.log("Fetching card sets...");
    const setResponse = await fetch("https://api.magicthegathering.io/v1/sets");
    if (!setResponse.ok) throw new Error("Failed to fetch card sets");
    const setData = await setResponse.json();
    const sets = setData.sets;
    const setSelect = document.getElementById("card-set");
    sets.forEach((set) => {
      const option = document.createElement("option");
      option.value = set.code;
      option.textContent = set.name;
      setSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching card sets:", error);
  }

  try {
    // Fetch and populate formats
    console.log("Fetching card formats...");
    const formatResponse = await fetch(
      "https://api.magicthegathering.io/v1/formats",
    );
    if (!formatResponse.ok) throw new Error("Failed to fetch card formats");
    const formatData = await formatResponse.json();
    const formats = formatData.formats;
    const formatSelect = document.getElementById("card-format");
    formats.forEach((format) => {
      const option = document.createElement("option");
      option.value = format;
      option.textContent = format;
      formatSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching card formats:", error);
  }

  // Handle form submission for searching cards
  document
    .getElementById("search-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const cardName = document.getElementById("card-name").value;
      const cardType = document.getElementById("card-type").value;
      const cardSubtype = document.getElementById("card-subtype").value;
      const cardSet = document.getElementById("card-set").value;
      const cardFormat = document.getElementById("card-format").value;

      // Clear previous results
      document.getElementById("card-results").innerHTML = "";

      // Construct the search query based on user inputs
      let query = "https://api.magicthegathering.io/v1/cards?";
      if (cardName) query += `name=${cardName}&`;
      if (cardType) query += `type=${cardType}&`;
      if (cardSubtype) query += `subtypes=${cardSubtype}&`;
      if (cardSet) query += `set=${cardSet}&`;
      if (cardFormat) query += `format=${cardFormat}&`;

      try {
        const response = await fetch(query);
        if (!response.ok) throw new Error("Failed to fetch cards");
        const data = await response.json();
        const cards = data.cards;

        if (cards.length === 0) {
          document.getElementById("card-results").innerHTML =
            "<p>No cards found.</p>";
        } else {
          // Dispatch custom event with search results
          const event = new CustomEvent("search-results-ready", {
            detail: cards,
          });
          document.dispatchEvent(event);
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
        document.getElementById("card-results").innerHTML =
          "<p>Error fetching cards. Please try again.</p>";
      }
    });
});
