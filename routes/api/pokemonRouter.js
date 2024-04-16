const router = require("express").Router();

const { getPokemon, getOnePokemon, addPokemon, deletePokemon
} = require("../../controllers/api/pokemonController");

// localhost:8080/api/pokemon/
router.get("/", getPokemon);

router.get("/:id", getOnePokemon)

// localhost:8080/api/pokemon/add-pokemon
router.post("/add-pokemon", addPokemon);


router.delete("/delete-pokemon", deletePokemon)


module.exports = router;