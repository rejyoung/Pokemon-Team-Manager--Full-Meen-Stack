document.addEventListener("DOMContentLoaded", () => {
  const pokeDivs = document.querySelectorAll(".pokedex-entry");
  pokeDivs.forEach((div) => {
    div.addEventListener(
      "click",
      () => (window.location.href = `/pokemon/${div.id}`)
    );
  });

  const pokedex = document.querySelector(".pokedex");
  let pokedexWidth = pokedex.clientWidth;
  let columnNum = ~~(pokedexWidth / 200);
  let columnGap = (pokedexWidth - columnNum * 180) / (columnNum - 1);
  pokedex.style.gridTemplateColumns = `repeat(${columnNum}, 180px)`;
  pokedex.style.columnGap = `${columnGap}px`;

  window.addEventListener("resize", () => {
    let pokedexWidth = pokedex.clientWidth;
    let columnNum = ~~(pokedexWidth / 200);
    let columnGap = (pokedexWidth - columnNum * 180) / (columnNum - 1);
    pokedex.style.gridTemplateColumns = `repeat(${columnNum}, 180px)`;
    pokedex.style.columnGap = `${columnGap}px`;
  });
});
