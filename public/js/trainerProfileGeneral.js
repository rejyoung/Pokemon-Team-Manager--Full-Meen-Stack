document.addEventListener("DOMContentLoaded", () => {
  const trainerUsername = document.querySelector(".profile").id;
  const pokemonInspectorContent = document.querySelector(
    ".pokemon-inspector-details"
  );
  const pokemonInspector = document.querySelector(".pokemon-inspector");
  const closeInspect = document.querySelector("#close-inspector");
  const speciesInfo = document.querySelector(".species-info");
  const speciesInfoBtn = document.querySelector("#species-info-btn");
  const infoBtns = document.querySelectorAll(".info-btn");

  // Set axios to send cookies along with the requests
  axios.defaults.withCredentials = true;

  /////////////////////////////
  ///// POKEMON INSPECTOR /////
  /////////////////////////////

  closeInspect.addEventListener("click", () => {
    gsap
      .timeline()
      .to(pokemonInspector, { duration: 0.2, opacity: 0 })
      .set(pokemonInspector, { display: "none" });
    setTimeout(() => {
      pokemonInspectorContent.innerHTML = "";
    }, 201);
  });

  infoBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Get pokemon info and update html
      axios
        .get(
          `/api/trainers/oneTrainer/${trainerUsername}/${btn.dataset.pokemonId}`
        )
        .then((response) => {
          if (response.status === 200) {
            let pokemon = response.data.pokemon;
            let moves = "";
            pokemon.Moves.forEach((move) => {
              let moveSplit = move.MoveName.split(" ");
              let moveCapital = moveSplit.map(
                (word) => (word = word[0].toUpperCase() + word.slice(1))
              );
              let moveName = moveCapital.join(" ");
              moves += `<p>${moveName}</p>\n`;
            });
            // prettier-ignore
            pokemonInspectorContent.innerHTML = `
              <div class="name-and-pic">
                <img src=${pokemon.ImgURL}>
                <p>Nickname</p>
                <h3>${pokemon.Nickname}</h3>
                <h4>Level ${pokemon.Level}</h4>
              </div>
              <div class="poke-info">
                <div class="move-div">
                  <h4>Moves</h4>
                  <div class="moves">
                    ${moves}
                  </div>
                </div>
              </div>
            `;
          }
        })
        .catch((error) => {
          console.error("Request failed", error);
        });

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
            let types = document.createElement("div");
            types.className = "types";
            species.Type.forEach((type) => {
              let typeDiv = document.createElement("p");
              typeDiv.className = "type";
              typeDiv.classList.add(type);
              typeDiv.innerText = type;
              types.appendChild(typeDiv);
            });
            //insert types before moves
            document
              .querySelector(".poke-info")
              .firstElementChild.before(types);

            let trainers = "";
            trainerList.forEach((trainer) => {
              trainers += `<a href="/trainer/${trainer.Username}">${trainer.DisplayName}</a>\n`;
            });
            // prettier-ignore
            speciesInfo.innerHTML = `
                <p class="species-label">Species</p>
                <h3>${pokeName}</h3>
                <p class="species-pokedex">Pokedex #${String(species.PokedexID).padStart(4, "0")}</p>
                <h4>Teams On</h4>
                <div class="owners-box">
                  ${trainers}
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

  speciesInfoBtn.addEventListener("click", () => {
    if (speciesInfoBtn.textContent == "Species Info >>") {
      gsap.to(pokemonInspector, { duration: 0.3, width: "900px", x: "-150px" });
      gsap.to(speciesInfo, {
        duration: 0.2,
        width: "300px",
        borderLeft: "solid 1px lightgray",
      });
      speciesInfoBtn.textContent = "<< Species Info";
    } else {
      gsap.to(pokemonInspector, { duration: 0.3, width: "600px", x: "0" });
      gsap.to(speciesInfo, { duration: 0.2, width: "0", borderLeft: "none" });
      speciesInfoBtn.textContent = "Species Info >>";
    }
  });
});
