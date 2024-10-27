import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

window.addEventListener("load", () => {
  const flipCards = document.querySelectorAll(".flip-card");
  let delay = 0;

  // Sequentially flip each card to show the front
  flipCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("animate");
    }, delay);
    delay += 500; // Increase delay for each card
  });

  // Flip cards back to show the back side after a few seconds
  setTimeout(() => {
    delay = 0;
    Array.from(flipCards).reverse().forEach((card, index) => {
      setTimeout(() => {
        card.classList.remove("animate");
      }, delay);
      delay += 500; // Increase delay for each card
    });
  }, 4000); // Flip back after 4 seconds

  // Repeat the flip animation every 8 seconds
  setInterval(() => {
    delay = 0;
    flipCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("animate");
      }, delay);
      delay += 500;
    });

    setTimeout(() => {
      delay = 0;
      Array.from(flipCards).reverse().forEach((card, index) => {
        setTimeout(() => {
          card.classList.remove("animate");
        }, delay);
        delay += 500;
      });
    }, 4000); // Adjust time as needed for flip-back delay
  }, 8000); // Interval for repeat animation
});