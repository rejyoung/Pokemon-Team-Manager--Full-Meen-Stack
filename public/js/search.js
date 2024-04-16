document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", function () {
    let filter = searchInput.value.toLowerCase();
    const pokemonDivs = document.querySelectorAll(".pokedex-entry");
    const noResults = document.querySelector(".no-results");
    let searchResults = 0;

    for (let pokemon of pokemonDivs) {
      // Get the name and ID of the Pokémon
      let name = pokemon.dataset.name;
      let pokedexNo = pokemon.dataset.pokedex; // Assuming each pokemon div has a data-id attribute

      // Determine if search is for names or IDs
      let matchesFilter =
        filter === "" ||
        (isNaN(filter)
          ? name.toLowerCase().startsWith(filter)
          : pokedexNo.startsWith(filter));

      if (matchesFilter) {
        if (document.querySelectorAll(".capture-option").length > 0) {
          pokemon.parentNode.style.display = "";
        } else {
          pokemon.style.display = "";
        }
        searchResults++;
      } else {
        if (document.querySelectorAll(".capture-option").length > 0) {
          pokemon.parentNode.style.display = "none";
          console.log("triggering");
        } else {
          pokemon.style.display = "none";
        }
      }
    }

    noResults.style.display = searchResults === 0 ? "block" : "none";
  });
});
