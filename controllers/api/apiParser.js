//Function to extract desired data from the pokemon api response
function apiParse(newPokeObj, data, evolveData) {
  const newPokemon = newPokeObj;
  newPokemon["Name"] = newPokemon["Name"].toLowerCase();
  //Code for populating database by pokemon number only
  // newPokemon["Name"] = data.species.name;

  // Get image url
  const imgURL = data.sprites.other["official-artwork"]["front_default"];

  // Make pokemon type array
  const apiTypes = data.types;
  let typeArr = [];
  apiTypes.forEach((typeObj) => {
    typeArr.push(typeObj.type.name);
  });

  //Make pokemon moves array from level-up moves only
  const apiMoves = data.moves;
  let movesArr = [];
  apiMoves.forEach((move) => {
    let moveName = move.move.name;
    let learnData = move["version_group_details"][0];
    let learnLevel = learnData["level_learned_at"];
    if (learnLevel != 0) {
      let moveObj = {
        Level: learnLevel,
        MoveName: moveName,
      };
      movesArr.push(moveObj);
    }
  });

  // Make evolution tree
  let startLev = 1;
  let evLev = 0;
  let baseForm = evolveData.species.name;

  let firstEvolutions = [];
  let finalEvolutions = [];

  // Handle all possible first evolutions
  if (evolveData["evolves_to"].length > 0) {
    let nextLevel = evolveData["evolves_to"];
    let minLev = 1;
    let finMinLev = 1;
    nextLevel.forEach((firstEvolution) => {
      //conditionals to handle api response inconsistency re: minimum levels for evolution
      if (firstEvolution["evolution_details"][0]["min_level"]) {
        if (
          typeof firstEvolution != "undefined" &&
          typeof firstEvolution["evolution_details"] != "undefined" &&
          typeof firstEvolution["evolution_details"][0] != "undefined" &&
          typeof firstEvolution["evolution_details"][0]["min_level"] !=
            "undefined"
        ) {
          if (firstEvolution["evolution_details"][0]["min_level"]) {
            minLev = firstEvolution["evolution_details"][0]["min_level"];
          } else {
            minLev = 1;
          }
        } else {
          minLev = 1;
        }

        let species = firstEvolution.species.name;
        // If this is a first evolution, set the starting level to be the minimum level at which the base species can evolve into
        if (species == newPokemon.Name) {
          startLev = minLev;
          evLev = 1;
        }

        // create object and push to array
        let evObj = {
          SpeciesName: species,
          MinLevel: minLev,
        };
        firstEvolutions.push(evObj);

        // Handle all possible final evolutions, which are nested within the first evolutions in the api response
        if (firstEvolution["evolves_to"].length > 0) {
          let finalLevel = firstEvolution["evolves_to"];
          finalLevel.forEach((finalEvolution) => {
            //conditionals to handle api response inconsistency re: minimum levels for evolution
            if (finalEvolution["evolution_details"][0]["min_level"]) {
              if (
                typeof finalEvolution != "undefined" &&
                typeof finalEvolution["evolution_details"] != "undefined" &&
                typeof finalEvolution["evolution_details"][0] != "undefined" &&
                typeof finalEvolution["evolution_details"][0]["min_level"] !=
                  "undefined"
              ) {
                if (firstEvolution["evolution_details"][0]["min_level"]) {
                  finMinLev =
                    finalEvolution["evolution_details"][0]["min_level"];
                } else {
                  finMinLev = 1;
                }
              } else {
                finMinLev = 1;
              }
              let finName = finalEvolution.species.name;
              if (finName == newPokemon.Name) {
                startLev = finMinLev;
                evLev = 2;
              }
              let finEvObj = {
                SpeciesName: finName,
                MinLevel: finMinLev,
              };
              finalEvolutions.push(finEvObj);
            }
          });
        }
      }
    });
  }

  // Compile all evolution data into one evolution tree
  let evolutionTreeObj = {
    basePokemon: baseForm,
    firstEvolution: firstEvolutions,
    finalEvolution: finalEvolutions,
  };

  // Determine whether this species can evolve, and if so, store next possible evolutions
  let nextEvolution =
    evLev === 0 ? firstEvolutions : evLev === 1 ? finalEvolutions : [];

  // Add all api data to the input data (pokedex number and possibly name)
  Object.assign(newPokemon, {
    StartingLevel: startLev,
    EvolutionLevel: evLev,
    Type: typeArr,
    Moves: movesArr,
    EvolutionTree: evolutionTreeObj,
    NextEvolution: nextEvolution,
  });

  //if there is an image url in the api, append to the object
  if (imgURL) {
    newPokemon["ImgPath"] = imgURL;
  }

  return newPokemon;
}

module.exports = apiParse;
