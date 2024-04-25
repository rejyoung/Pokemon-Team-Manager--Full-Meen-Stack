document.addEventListener("DOMContentLoaded", () => {
  const pokeDivs = document.querySelectorAll(".pokedex-entry");
  pokeDivs.forEach((div) => {
    div.addEventListener(
      "click",
      () => (window.location.href = `/pokemon/${div.id}`)
    );
  });
});
