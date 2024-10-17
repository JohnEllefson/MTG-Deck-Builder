import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter().then(() => {
  document.querySelector(".icon-cart").innerHTML =
    localStorage.getItem("so-cart-quantity") || 0;
  searchItem();
});
