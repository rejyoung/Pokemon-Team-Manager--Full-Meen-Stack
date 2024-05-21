document.addEventListener("DOMContentLoaded", () => {
    const trainerToken = document.querySelector(".collection").id;
    const username = document.querySelector(".collection").dataset.username;
    const releaseButtons = document.querySelectorAll(".release");
    const addButtons = Array.from(document.querySelectorAll(".add-to-team"));
    const removeButtons = Array.from(
        document.querySelectorAll(".remove-from-team")
    );
    const captureButton = document.querySelector("#capture");
    const backBtn = document.querySelector("#back-to-profile");
    const levelUps = document.querySelectorAll(".collection-level-up");
    const levelOptions = document.querySelectorAll(".level-options-container");
    const editBtns = document.querySelectorAll(".collection-edit-name");
    const editBoxes = document.querySelectorAll(".collection-edit-box");
    const infoBtns = document.querySelectorAll(".info-btn");
    const evolveBtns = document.querySelectorAll(".evolve");
    const pokemonInspectorContent = document.querySelector(
        ".pokemon-inspector-details"
    );
    const pokemonInspector = document.querySelector(".pokemon-inspector");
    const closeInspect = document.querySelector("#close-inspector");
    const speciesInfo = document.querySelector(".species-info");
    const speciesInfoBtn = document.querySelector("#species-info-btn");
    const evolutionOptions = document.querySelector(".evolution-options");
    const evolutionPopup = document.querySelector(".evolution-popup");
    const closeEvolve = document.querySelector("#close-evolution");

    // Set axios to send cookies along with the requests
    axios.defaults.withCredentials = true;

    // Release Pokemon
    releaseButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            axios
                .put(
                    `/api/trainers/oneTrainer/${trainerToken}/releasePokemon`,
                    {
                        id: btn.dataset.pokemonId,
                    }
                )
                .then((response) => {
                    // Assuming the server sends back a 200 status code and the URL in the response body
                    if (response.status === 200) {
                        document.getElementById(btn.dataset.pokemonId).remove();
                    }
                })
                .catch((error) => {
                    console.error("Request failed", error);
                });
        });
    });

    // ADD/REMOVE FROM TEAM //
    addButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            axios
                .put(
                    `/api/trainers/oneTrainer/${trainerToken}/addPokemonToTeam`,
                    {
                        id: btn.dataset.pokemonId,
                    }
                )
                .then((response) => {
                    // Assuming the server sends back a 200 status code and the URL in the response body
                    if (response.status === 200) {
                        btn.style.display = "none";
                        let correspondingRemove = removeButtons.filter(
                            (removebtn) =>
                                removebtn.dataset.pokemonId ===
                                btn.dataset.pokemonId
                        )[0];
                        correspondingRemove.style.display = "inline-block";
                    }
                })
                .catch((error) => {
                    console.error("Request failed", error);
                });
        });
    });

    removeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            axios
                .put(
                    `/api/trainers/oneTrainer/${trainerToken}/removePokemonFromTeam`,
                    {
                        id: btn.dataset.pokemonId,
                    }
                )
                .then((response) => {
                    // Assuming the server sends back a 200 status code and the URL in the response body
                    if (response.status === 200) {
                        btn.style.display = "none";
                        let correspondingAdd = addButtons.filter(
                            (addbtn) =>
                                addbtn.dataset.pokemonId ===
                                btn.dataset.pokemonId
                        )[0];
                        correspondingAdd.style.display = "inline-block";
                    }
                })
                .catch((error) => {
                    console.error("Request failed", error);
                });
        });
    });

    // Level Pokemon
    levelUps.forEach((btn) => {
        btn.addEventListener("click", () => {
            const levelOptions = document.querySelector(
                `#levels${btn.dataset.pokemonId}`
            );
            if (levelOptions.style.height === "0px") {
                if (window.innerWidth < 700) {
                    console.log("working");
                    gsap.to(levelOptions, {
                        duration: 0.2,
                        height: "100%",
                    });
                } else {
                    gsap.to(levelOptions, { duration: 0.2, height: "250px" });
                }
            } else {
                gsap.to(levelOptions, { duration: 0.2, height: "0px" });
            }
        });
    });

    levelOptions.forEach((option) => {
        option.addEventListener("click", (e) => {
            let btn = e.target.closest(".level-option");
            axios
                .put(`/api/trainers/oneTrainer/${trainerToken}/levelPokemon`, {
                    id: btn.dataset.pokemonId,
                    level: +btn.id,
                })
                .then((response) => {
                    if (response.status === 200) {
                        btn.parentNode.parentNode.previousElementSibling.lastElementChild.innerHTML = `Level ${response.data.level}`;

                        // Update evolve button
                        if (
                            response.data.canEvolve &&
                            !btn.parentNode.parentNode.parentNode.classList.contains(
                                "can-evolve"
                            )
                        ) {
                            btn.parentNode.parentNode.parentNode.classList.add(
                                "can-evolve"
                            );
                            if (
                                btn.parentNode.parentNode.nextElementSibling.children
                                    .item(3)
                                    .classList.contains("disabled")
                            ) {
                                btn.parentNode.parentNode.nextElementSibling.children
                                    .item(3)
                                    .classList.remove("disabled");
                            }
                        }
                        if (
                            !response.data.canEvolve &&
                            btn.parentNode.parentNode.parentNode.classList.contains(
                                "can-evolve"
                            )
                        ) {
                            btn.parentNode.parentNode.parentNode.classList.remove(
                                "can-evolve"
                            );
                            if (
                                !btn.parentNode.parentNode.nextElementSibling.children
                                    .item(3)
                                    .classList.contains("disabled")
                            ) {
                                btn.parentNode.parentNode.nextElementSibling.children
                                    .item(3)
                                    .classList.add("disabled");
                            }
                        }
                    }
                    gsap.to(
                        document.querySelector(
                            `#levels${btn.dataset.pokemonId}`
                        ),
                        {
                            duration: 0.2,
                            height: "0px",
                        }
                    );
                })
                .catch((error) => {
                    console.error("Request failed", error);
                });
        });
    });

    // Handle Evolutions
    evolveBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            // Only do anything if the pokemon can evolve
            if (
                document
                    .getElementById(btn.dataset.pokemonId)
                    .firstElementChild.classList.contains("can-evolve")
            ) {
                axios
                    // Fetch array of possible next evolutions
                    .get(
                        `/api/trainers/oneTrainer/${trainerToken}/getEvolutions/${
                            btn.dataset.pokemonId
                        }?_=${new Date().getTime()}`
                    )
                    .then((response) => {
                        if (response.status === 200) {
                            let nextEvArr = response.data.NextEvolutions;
                            let evNum = nextEvArr.length;
                            // Create a div for each evolution option
                            nextEvArr.forEach((evolution) => {
                                let evDiv = document.createElement("div");
                                evDiv.className = "evolution-div";
                                // Name
                                const evName = document.createElement("h3");
                                let titleName = "";
                                if (evolution.Name.startsWith("mr.")) {
                                    titleName =
                                        evolution.Name[0].toUpperCase() +
                                        evolution.Name.slice(1, 4) +
                                        evolution.Name[4].toUpperCase() +
                                        evolution.Name.slice(5);
                                } else {
                                    titleName =
                                        evolution.Name[0].toUpperCase() +
                                        evolution.Name.slice(1);
                                }
                                evName.textContent = titleName;
                                evName.className = "evolution-name";

                                // Image
                                const evImg = new Image();
                                evImg.src = evolution.ImgPath;
                                evImg.className = "evolution-image";

                                // Append name and image elements to div
                                evDiv.appendChild(evImg);
                                evDiv.appendChild(evName);

                                //Give each div an event listener
                                evDiv.addEventListener("click", () => {
                                    axios
                                        .put(
                                            `/api/trainers/oneTrainer/${trainerToken}/evolvePokemon`,
                                            {
                                                currentId:
                                                    btn.dataset.pokemonId,
                                                newSpeciesId: evolution._id,
                                            }
                                        )
                                        .then((response) => {
                                            // Update pokemon "card" with new data
                                            if (response.status === 200) {
                                                const newPokemon =
                                                    response.data.NewPokemon;
                                                const thisDiv =
                                                    document.getElementById(
                                                        btn.dataset.pokemonId
                                                    );
                                                thisDiv.dataset.name =
                                                    newPokemon.Nickname;

                                                const collectionDiv =
                                                    thisDiv.firstElementChild;
                                                collectionDiv.dataset.name =
                                                    newPokemon.Nickname;

                                                // Update evolve button
                                                document.getElementById(
                                                    `edit-${btn.dataset.pokemonId}`
                                                ).value = newPokemon.Nickname;
                                                if (
                                                    newPokemon.CanEvolve &&
                                                    !collectionDiv.classList.contains(
                                                        "can-evolve"
                                                    )
                                                ) {
                                                    collectionDiv.classList.add(
                                                        "can-evolve"
                                                    );
                                                    if (
                                                        btn.classList.contains(
                                                            "disabled"
                                                        )
                                                    ) {
                                                        btn.classList.remove(
                                                            "disabled"
                                                        );
                                                    }
                                                }
                                                if (
                                                    !newPokemon.CanEvolve &&
                                                    collectionDiv.classList.contains(
                                                        "can-evolve"
                                                    )
                                                ) {
                                                    collectionDiv.classList.remove(
                                                        "can-evolve"
                                                    );
                                                    if (
                                                        !btn.classList.contains(
                                                            "disabled"
                                                        )
                                                    ) {
                                                        btn.classList.add(
                                                            "disabled"
                                                        );
                                                    }
                                                }

                                                //Update Level Options
                                                let levelOptDiv =
                                                    document.querySelector(
                                                        `#levels${btn.dataset.pokemonId}`
                                                    ).firstElementChild;
                                                let levelOptions = Array.from(
                                                    levelOptDiv.children
                                                );
                                                levelOptions.forEach(
                                                    (option) => {
                                                        if (
                                                            +option.id <
                                                            newPokemon.MinimumLevel
                                                        ) {
                                                            option.remove();
                                                        }
                                                    }
                                                );

                                                // Flip pokemon "card" halfway
                                                gsap.to(collectionDiv, {
                                                    duration: 0.3,
                                                    rotationY: 90,
                                                });
                                                // While "card" face is not visible, update visual data
                                                setTimeout(() => {
                                                    document.getElementById(
                                                        newPokemon._id + "-img"
                                                    ).src = newPokemon.ImgURL;
                                                    document.getElementById(
                                                        "nickname" +
                                                            newPokemon._id
                                                    ).textContent =
                                                        newPokemon.Nickname;
                                                    document.getElementById(
                                                        "edit-" + newPokemon._id
                                                    ).dataset.value =
                                                        newPokemon.Nickname;
                                                    collectionDiv.lastElementChild.lastElementChild.previousElementSibling.dataset.speciesId =
                                                        newPokemon.SpeciesID;
                                                }, 301);
                                                // Flip card so face is visible again
                                                gsap.to(collectionDiv, {
                                                    duration: 0.3,
                                                    rotationY: 0,
                                                    delay: 0.302,
                                                });
                                                // Dismiss evolution pop-up
                                                gsap.timeline()
                                                    .to(evolutionPopup, {
                                                        duration: 0.3,
                                                        opacity: 0,
                                                    })
                                                    .set(evolutionPopup, {
                                                        display: "none",
                                                    });
                                                setTimeout(
                                                    () =>
                                                        (evolutionOptions.innerHTML =
                                                            ""),
                                                    300
                                                );
                                            }
                                        })
                                        .catch((error) => {
                                            console.error(
                                                "Request failed",
                                                error
                                            );
                                        });
                                });

                                // Add all evolution option divs, to the evolution options pop-up div
                                evolutionOptions.appendChild(evDiv);

                                // Adjust pop-up width based on number of evolutions to be displayed
                                if (window.innerWidth >= 700) {
                                    if (evNum > 4 && window.innerWidth < 885) {
                                        evolutionPopup.style.width = "56vw";
                                        evolutionPopup.style.left = "22vw";
                                        evolutionOptions.style.justifyContent =
                                            "space-around";
                                        evolutionOptions.style.flexWrap =
                                            "wrap";
                                    } else if (evNum > 2) {
                                        evolutionPopup.style.width =
                                            evNum * 10 + 10 + "vw";
                                        evolutionPopup.style.left =
                                            (100 - (evNum * 10 + 10)) / 2 +
                                            "vw";
                                        evolutionOptions.style.justifyContent =
                                            "space-around";
                                    } else {
                                        evolutionPopup.style.width = "30vw";
                                        evolutionPopup.style.left = "35vw";
                                        evolutionOptions.style.justifyContent =
                                            "center";
                                    }
                                } else {
                                    evolutionPopup.style.height =
                                        Math.ceil(evNum / 3) * 16 + 13 + "dvh";
                                    evolutionPopup.style.minHeight =
                                        Math.ceil(evNum / 3) * 135 + 110 + "px";
                                    evolutionPopup.style.top =
                                        (100 -
                                            (Math.ceil(evNum / 3) * 16 + 13)) /
                                            2 +
                                        "dvh";
                                    evolutionOptions.style.justifyContent =
                                        "space-around";
                                }
                                // Show evolution pop-up
                                gsap.timeline()
                                    .set(evolutionPopup, { display: "block" })
                                    .to(evolutionPopup, {
                                        duration: 0.3,
                                        opacity: 1,
                                    });
                                setTimeout(() => evolutionPopup.focus(), 300);
                            });
                        }
                    })
                    .catch((error) => {
                        console.error("Request failed", error);
                    });
            }
        });
    });

    closeEvolve.addEventListener("click", () => {
        gsap.timeline()
            .to(evolutionPopup, { duration: 0.3, opacity: 0 })
            .set(evolutionPopup, { display: "none" });
        setTimeout(() => (evolutionOptions.innerHTML = ""), 300);
    });

    captureButton.addEventListener(
        "click",
        () =>
            (window.location.href = `/trainer/profile/capture-pokemon?token=${trainerToken}`)
    );

    backBtn.addEventListener(
        "click",
        () => (window.location.href = `/trainer/profile?token=${trainerToken}`)
    );

    editBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            let correspondingBox = document.getElementById(
                btn.dataset.inputBoxId
            );
            correspondingBox.style.display = "inline-block";
            correspondingBox.focus();
        });
    });

    editBoxes.forEach((box) => {
        function saveName(newName) {
            axios
                .put(
                    `/api/trainers/oneTrainer/${trainerToken}/updateNickname`,
                    {
                        id: box.dataset.pokemonId,
                        newNickname: newName,
                    }
                )
                .then((response) => {
                    // Assuming the server sends back a 200 status code and the URL in the response body
                    if (response.status === 200) {
                        box.previousElementSibling.innerText = `${response.data.nickname}`;
                    }
                })
                .then(setTimeout(() => (box.style.display = "none"), 150))
                .catch((error) => {
                    console.error("Request failed", error);
                    box.style.display = "none";
                });
        }
        box.addEventListener("keyup", (event) => {
            if (event.keyCode == 13) {
                saveName(box.value);
            }
        });
        box.addEventListener("blur", () => {
            saveName(box.value);
        });
    });

    /////////////////////////////
    ///// POKEMON INSPECTOR /////
    /////////////////////////////

    closeInspect.addEventListener("click", () => {
        gsap.timeline()
            .to(pokemonInspector, { duration: 0.2, opacity: 0 })
            .set(pokemonInspector, { display: "none" });

        setTimeout(() => {
            pokemonInspectorContent.innerHTML = "";
        }, 201);
    });

    infoBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            // Get pokemon info and update html
            Promise.all([
                axios.get(
                    `/api/trainers/oneTrainer/${username}/${btn.dataset.pokemonId}`
                ),
                axios.get(`/api/pokemon/${btn.dataset.speciesId}`, {
                    id: btn.dataset.pokemonId,
                }),
            ])
                .then((responses) => {
                    const [trainerResponse, speciesResponse] = responses;
                    if (
                        trainerResponse.status === 200 &&
                        speciesResponse.status === 200
                    ) {
                        const pokemon = trainerResponse.data.pokemon;
                        const species = speciesResponse.data.pokemonInfo;
                        const trainerList = speciesResponse.data.trainerList;
                        let moves = pokemon.Moves.map((move) => {
                            let moveCapital = move.MoveName.split(" ").map(
                                (word) => word[0].toUpperCase() + word.slice(1)
                            );
                            return `<p>${moveCapital.join(" ")}</p>`;
                        }).join("\n");
                        let pokeName = species.Name.startsWith("mr.")
                            ? species.Name[0].toUpperCase() +
                              species.Name.slice(1, 4) +
                              species.Name[4].toUpperCase() +
                              species.Name.slice(5)
                            : species.Name[0].toUpperCase() +
                              species.Name.slice(1);
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
                        pokemonInspectorContent.innerHTML = `
              <div class="name-and-pic">
                <img src=${pokemon.ImgURL}>
                <p>Nickname</p>
                <h3>${pokemon.Nickname}</h3>
                <h4>Level ${pokemon.Level}</h4>
              </div>
              <div class="poke-info">
                <div class="types">
                  ${types}
                </div>
                <div class="move-div">
                  <h4>Moves</h4>
                  <div class="moves">
                    ${moves}
                  </div>
                </div>
              </div>
            `;

                        // prettier-ignore
                        speciesInfo.innerHTML = `
              <div class="species-info-container">
                <div class="species-stats">
                  <p class="species-label">Species</p>
                  <h3>${pokeName}</h3>
                  <p class="species-pokedex">Pokedex #${String(species.PokedexID).padStart(4, "0")}</p>
                </div>
                <div class="species-teams">
                  <h4>Teams On</h4>
                  <div class="owners-box">
                    ${trainers}
                  </div>
                </div>
              </div>
            `;
                    }
                })
                .catch((error) => {
                    console.error("Request failed", error);
                });
            // Show pokemon inspector
            gsap.timeline({ delay: 0.2 })
                .set(pokemonInspector, { display: "block" })
                .to(pokemonInspector, { duration: 0.2, opacity: 1 });
        });
    });

    speciesInfoBtn.addEventListener("click", () => {
        if (speciesInfoBtn.textContent == "Species Info >>") {
            gsap.to(pokemonInspector, {
                duration: 0.3,
                width: "900px",
                x: "-150px",
            });
            gsap.to(speciesInfo, {
                duration: 0.2,
                width: "300px",
                borderLeft: "solid 1px lightgray",
            });
            speciesInfoBtn.textContent = "<< Species Info";
        } else {
            gsap.to(pokemonInspector, {
                duration: 0.3,
                width: "600px",
                x: "0",
            });
            gsap.to(speciesInfo, {
                duration: 0.2,
                width: "0",
                borderLeft: "none",
            });
            speciesInfoBtn.textContent = "Species Info >>";
        }
    });
});
