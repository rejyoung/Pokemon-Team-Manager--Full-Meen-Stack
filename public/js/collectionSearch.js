document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");

  searchInput.addEventListener("input", function () {
    let filter = searchInput.value.toLowerCase();
    const pokedex = document.getElementById(".collection");
    const pokemonDivs = document.querySelectorAll(".pokemon");
    const noResults = document.querySelector(".no-results");
    let searchResults = 0;

    for (let pokemon of pokemonDivs) {
      // Get the name of the Pokémon
      let name = pokemon.dataset.name;

      // If search box is empty or name matches the filter, display the div
      if (filter === "" || name.toLowerCase().startsWith(filter)) {
        pokemon.style.display = "";
        searchResults++;
      } else {
        pokemon.style.display = "none";
      }
    }

    noResults.style.display = searchResults === 0 ? "block" : "none";
  });
});
