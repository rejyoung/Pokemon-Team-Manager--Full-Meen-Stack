document.addEventListener("DOMContentLoaded", () => {
  const infoBtns = document.querySelectorAll(".get-species-info");
  const captureBtns = document.querySelectorAll(".capture-btn");
  const backBtn = document.querySelector("#back-to-collection");
  const pokemonInspector = document.querySelector(".capture-pokemon-inspector");
  const closeInspect = document.querySelector("#close-inspector");
  const speciesInfo = document.querySelector(".capture-pokemon-species-info");
  // Set axios to send cookies along with the requests
  axios.defaults.withCredentials = true;

  captureBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      let trainerToken = btn.dataset.trainerToken;
      axios
        .put(`/api/trainers/oneTrainer/${trainerToken}/capturePokemon`, {
          id: btn.dataset.speciesId,
        })
        .then((response) => {
          // Assuming the server sends back a 200 status code and the URL in the response body
          if (response.status === 200 && response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl; // Navigate browser to the new URL
          }
        })
        .catch((error) => {
          console.error("Request failed", error);
        });
    });
  });

  /////////////////////////////
  ///// POKEMON INSPECTOR /////
  /////////////////////////////

  closeInspect.addEventListener("click", () => {
    gsap
      .timeline()
      .to(pokemonInspector, { duration: 0.2, opacity: 0 })
      .set(pokemonInspector, { display: "none" });
    setTimeout(() => {
      speciesInfo.innerHTML = "";
    }, 201);
  });

  infoBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Get species info and update html
      axios
        .get(`/api/pokemon/${btn.dataset.speciesId}`, {
          id: btn.dataset.pokemonId,
        })
        .then((response) => {
          if (response.status === 200) {
            let species = response.data.pokemonInfo;
            let trainerList = response.data.trainerList;
            let pokeName = species.Name.startsWith("mr.")
              ? species.Name[0].toUpperCase() +
                species.Name.slice(1, 4) +
                species.Name[4].toUpperCase() +
                species.Name.slice(5)
              : species.Name[0].toUpperCase() + species.Name.slice(1);
            //extract pokemon types
            let types = species.Type.map((type) => {
              return `<p class="type ${type}">${type}</p>`;
            }).join("\n");

            let trainers = trainerList
              .map((trainer) => {
                return `<a href="/trainer/${trainer.Username}">${trainer.DisplayName}</a>`;
              })
              .join("\n");
            // prettier-ignore
            speciesInfo.innerHTML = `
                <div class="capture-name-and-pic">
                  <img src="${species.ImgPath}">
                  <p class="capture-species-label">Species</p>
                  <h3>${pokeName}</h3>
                  <p class="capture-species-pokedex">Pokedex #${String(species.PokedexID).padStart(4, "0")}</p>
                </div>
                <div class="capture-species-details">
                  <div class="capture-types">
                    ${types}
                  </div>
                  <h4>Teams On</h4>
                  <div class="capture-owners-box">
                    ${trainers}
                  </div>
                </div>
              `;
          }
        })
        .catch((error) => {
          console.error("Request failed", error);
        });
      // Show pokemon inspector
      gsap
        .timeline({ delay: 0.2 })
        .set(pokemonInspector, { display: "block" })
        .to(pokemonInspector, { duration: 0.2, opacity: 1 });
    });
  });

  backBtn.addEventListener(
    "click",
    () =>
      (window.location.href = `/trainer/profile/pokemonCollection?token=${backBtn.dataset.trainerToken}`)
  );

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
