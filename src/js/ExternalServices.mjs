document
  .getElementById("search-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const cardName = document.getElementById("card-name").value;
    if (!cardName) {
      alert("Please enter a card name.");
      return;
    }

    // Clear previous results
    document.getElementById("card-results").innerHTML = "";

    try {
      const response = await fetch(
        `https://api.magicthegathering.io/v1/cards?name=${cardName}`,
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const cards = data.cards;

      if (cards.length === 0) {
        document.getElementById("card-results").innerHTML =
          "<p>No cards found.</p>";
      } else {
        cards.forEach((card) => {
          const cardDiv = document.createElement("div");
          cardDiv.className = "card";
          cardDiv.innerHTML = `
            <h3>${card.name}</h3>
            <img src="${card.imageUrl ? card.imageUrl : "https://via.placeholder.com/200x280"}" alt="${card.name}">
            <p>${card.type}</p>
          `;
          document.getElementById("card-results").appendChild(cardDiv);
        });
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      document.getElementById("card-results").innerHTML =
        "<p>Error fetching cards. Please try again.</p>";
    }
  });
