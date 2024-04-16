const router = require("express").Router();

const {
  createProfile,
  logIn,
  changePassword,
  changeDisplayName,
  getTrainers,
  getOneTrainer,
  getOneTrainerPokemon,
  capturePokemon,
  releasePokemon,
  levelPokemon,
  evolvePokemon,
  deleteTrainer,
  addPokemonToCurrentTeam,
  removePokemonFromCurrentTeam,
  updateNickname,
  getEvolutions,
} = require("../../controllers/api/trainersController");

// localhost:8080/api/trainers/

router.post("/createProfile", createProfile);

router.post("/login", logIn);

router.get("/allTrainers", getTrainers);

router.get("/oneTrainer/:id", getOneTrainer);

router.get("/oneTrainer/:username/:pokemonID", getOneTrainerPokemon);

router.get("/oneTrainer/:token/getEvolutions/:pokemonId", getEvolutions);

router.put("/oneTrainer/:token/changeDisplayName", changeDisplayName);

router.put("/oneTrainer/:token/changePassword", changePassword);

router.put("/oneTrainer/:token/capturePokemon", capturePokemon);

router.put("/oneTrainer/:token/levelPokemon", levelPokemon);

router.put("/oneTrainer/:token/evolvePokemon", evolvePokemon);

router.put("/oneTrainer/:token/releasePokemon", releasePokemon);

router.put("/oneTrainer/:token/addPokemonToTeam", addPokemonToCurrentTeam);

router.put(
  "/oneTrainer/:token/removePokemonFromTeam",
  removePokemonFromCurrentTeam
);

router.put("/oneTrainer/:token/updateNickname", updateNickname);

router.delete("/oneTrainer/:token/deleteTrainer", deleteTrainer);

module.exports = router;
