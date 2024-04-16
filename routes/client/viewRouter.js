const router = require("express").Router();

const {
  renderHomePage,
  renderLoginForm,
  logout,
  renderAllTrainersPage,
  renderPokedexPage,
  redirectToProfile,
  renderOwnProfile,
  renderOtherProfile,
  renderOnePokemon,
  renderCreateProfileForm,
  renderCapturePokemon,
  renderPokemonCollection,
} = require("../../controllers/client/viewController");
const { isLoggedIn, isAuthorized } = require("./authMiddleware");

// localhost:8080/
router.get("/", isLoggedIn, renderHomePage);

// localhost:8080/login
router.get("/login", renderLoginForm);

//localhost:8080/logout
router.post("/logout", logout);

//localhost:8080/create-profile
router.get("/create-profile", renderCreateProfileForm);

// localhost:3000/trainers
router.get("/trainers", isLoggedIn, renderAllTrainersPage);

// get other profile
router.get("/trainer/profile/view/:username", isLoggedIn, renderOtherProfile);

// get own collection
router.get(
  "/trainer/profile/pokemonCollection",
  isLoggedIn,
  isAuthorized,
  renderPokemonCollection
);

// get own profile
// localhost:3000/trainer/profile
router.get("/trainer/profile", isLoggedIn, isAuthorized, renderOwnProfile);

// profile redirect
router.get("/trainer/:username", isLoggedIn, redirectToProfile);

router.get(
  "/trainer/profile/pokemonCollection",
  isLoggedIn,
  isAuthorized,
  renderPokemonCollection
);

// localhost:3000/games/:id
router.get("/pokemon/:id", isLoggedIn, renderOnePokemon);

// localhost:3000/games
router.get("/pokedex", isLoggedIn, renderPokedexPage);

router.get(
  "/trainer/profile/capture-pokemon",
  isLoggedIn,
  renderCapturePokemon
);

module.exports = router;
