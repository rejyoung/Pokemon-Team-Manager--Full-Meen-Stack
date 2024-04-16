const Pokemon = require("../../models/pokemonModel");
const Trainer = require("../../models/trainersModel");
const axios = require("axios");
const apiParser = require("./apiParser");

async function getPokemon(req, res) {
  try {
    res.json({
      message: "success",
      payload: await Pokemon.find({}),
    });
  } catch (error) {
    let errorObj = {
      message: "failure to get pokemon",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function getOnePokemon(req, res) {
  try {
    let pokemon = await Pokemon.findOne({ _id: req.params.id });
    let teamsOn = pokemon.TeamsOn.map((id) => id.toString());
    let trainers = await Trainer.find({});
    let filterTrainers = trainers.filter((trainer) =>
      teamsOn.includes(trainer._id.toString())
    );
    res.status(200).json({
      pokemonInfo: pokemon,
      trainerList: filterTrainers,
    });
  } catch (error) {
    let errorObj = {
      message: "failure to get one pokemon",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function addPokemon(req, res) {
  try {
    let entry = req.body;
    let pokedexNum = req.body.PokedexID;
    console.log(pokedexNum);
    // Fetch data from pokemon api
    let apiResp = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokedexNum}`
    );

    // Fetch data from pokemon-species api
    let speciesResp = await axios.get(
      `https://pokeapi.co/api/v2/pokemon-species/${pokedexNum}`
    );

    //Fetch data from pokemon-evolutions api (linked to in species api)
    let evolveAPIurl = speciesResp.data["evolution_chain"]["url"];
    let evolveResp = await axios.get(evolveAPIurl);

    // Submit data to apiParser to extract and correctly format desired information
    let newPokemon = apiParser(entry, apiResp.data, evolveResp.data.chain);

    await Pokemon.create(newPokemon);

    res.json({
      message: "success",
      payload: await Pokemon.findOne({ Name: newPokemon.Name }),
    });
  } catch (error) {
    let errorObj = {
      message: "failure to add pokemon",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function deletePokemon(req, res) {
  try {
    await Pokemon.delete({ name: req.body.pokemonName });

    res.json({
      message: "success",
      payload: await Pokemon.find({}),
    });
  } catch (error) {
    let errorObj = {
      message: "failure to delete pokemon",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

//Extra code for populating pokemon database automatically from pokemon api
// let i = 1;
// const load = setInterval(() => {
//   addPokemon({
//     body: {
//       PokedexID: i,
//     },
//   }),
//     i++;
//   if (i === 1025) {
//     clearInterval(load);
//   }
// }, 25);

module.exports = { getPokemon, getOnePokemon, addPokemon, deletePokemon };
