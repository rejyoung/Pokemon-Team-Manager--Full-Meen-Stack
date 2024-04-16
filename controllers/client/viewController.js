const Pokemon = require("../../models/pokemonModel");
const Trainer = require("../../models/trainersModel");
const {
  createToken,
  validateToken,
  deleteToken,
} = require("../../controllers/api/tokenMap");

function renderHomePage(req, res) {
  try {
    res.render("home", { isLoggedIn: req.isLoggedIn, username: req.username });
  } catch (error) {
    let errorObj = {
      message: "renderHomePage failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

function renderLoginForm(req, res) {
  try {
    res.render("login", { isLoggedIn: req.isLoggedIn, username: req.username });
  } catch (error) {
    let errorObj = {
      message: "renderLoginPage failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .send({ success: false, message: "Failed to logout" });
    }

    const token = req.cookies.authToken;

    deleteToken(token);

    res.cookie("authToken", "", {
      maxAge: 0,
      httpOnly: true,
    });

    res.status(200).json({
      message: "success",
      payload: "Successfully Logged Off",
    });
  });
}

async function renderAllTrainersPage(req, res) {
  try {
    let results = await Trainer.find({});

    res.render("allTrainers", {
      trainers: results,
      isLoggedIn: req.isLoggedIn,
      username: req.username,
    });
  } catch (error) {
    let errorObj = {
      message: "renderAllTrainersPage failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

async function renderPokedexPage(req, res) {
  try {
    let results = await Pokemon.find({});
    results = results.sort((a, b) => a.PokedexID - b.PokedexID);

    res.render("pokedex", {
      pokedex: results,
      isLoggedIn: req.isLoggedIn,
      username: req.username,
    });
  } catch (error) {
    let errorObj = {
      message: "renderPokedexPage failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

// trainer/:username
async function redirectToProfile(req, res) {
  try {
    const token = req.cookies.authToken;
    const userId = req.session.userId;
    const self = await Trainer.findOne({ _id: userId });

    if (token && userId && self.Username === req.params.username) {
      res.redirect(`/trainer/profile?token=${token}`);
    } else {
      res.redirect(`/trainer/profile/view/${req.params.username}`);
    }
  } catch (error) {
    let errorObj = {
      message: "redirectToProfile failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

async function renderOwnProfile(req, res) {
  try {
    let trainerId = await validateToken(req.query.token);
    const trainerResult = await Trainer.findOne({ _id: trainerId });
    let pokemonList = [];
    if (trainerResult.PokemonCollection) {
      trainerResult.PokemonCollection.filter((p) => p.CurrentTeam).forEach(
        (mon) => pokemonList.push(mon)
      );
    }
    res.render("trainerProfile", {
      trainer: trainerResult,
      collection: pokemonList,
      isOwnProfile: true,
      isLoggedIn: req.isLoggedIn,
      token: req.query.token,
      username: req.username,
    });
  } catch (error) {
    let errorObj = {
      message: "renderOwnProfile failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

async function renderOtherProfile(req, res) {
  try {
    const trainerResult = await Trainer.findOne({
      Username: req.params.username,
    });
    if (req.session.userId) {
      const loggedInUser = await Trainer.findOne({ _id: req.session.userId });
      const loggedInUsername = loggedInUser.Username;
      if (loggedInUsername === req.params.username) {
        res.redirect(`/trainer/${req.params.username}`);
      }
    }

    res.render("trainerProfile", {
      trainer: trainerResult,
      collection: trainerResult.PokemonCollection,
      isOwnProfile: false,
      isLoggedIn: req.isLoggedIn,
      username: req.username,
    });
  } catch (error) {
    let errorObj = {
      message: "renderOtherProfile failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

async function renderOnePokemon(req, res) {
  try {
    let pokemonResult = await Pokemon.findOne({ _id: req.params.id });
    console.log(pokemonResult.TeamsOn);
    let trainerListPromises = pokemonResult.TeamsOn.map((id) =>
      Trainer.findOne({ _id: id })
    );
    let trainerList = await Promise.all(trainerListPromises);
    console.log(trainerList);
    res.render("singlePokemon", {
      pokemon: pokemonResult,
      trainers: trainerList,
      isLoggedIn: req.isLoggedIn,
      username: req.username,
    });
  } catch (error) {
    let errorObj = {
      message: "renderOnePokemon failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

function renderCreateProfileForm(req, res) {
  res.render("createProfile", {
    isLoggedIn: req.isLoggedIn,
    username: req.username,
  });
}

async function renderCapturePokemon(req, res) {
  try {
    let results = await Pokemon.find({});
    results = results.sort((a, b) => a.PokedexID - b.PokedexID);

    res.render("capturePokemon", {
      pokedex: results,
      trainerToken: req.query.token,
      isLoggedIn: req.isLoggedIn,
      username: req.username,
    });
  } catch (error) {
    let errorObj = {
      message: "renderCapturePokemon failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

async function renderPokemonCollection(req, res) {
  try {
    let trainerId = await validateToken(req.query.token);
    let targetTrainer = await Trainer.findOne({ _id: trainerId });
    let results = targetTrainer.PokemonCollection;
    results = results.sort((a, b) => (a.Nickname < b.Nickname ? -1 : 1));
    console.log(req.username);
    res.render("trainerCollection", {
      collection: results,
      trainerToken: req.query.token,
      trainerName: targetTrainer.DisplayName,
      isLoggedIn: req.isLoggedIn,
      username: req.username,
    });
  } catch (error) {
    let errorObj = {
      message: "renderPokemonCollection failure",
      payload: error,
    };

    console.log(errorObj);

    res.json(errorObj);
  }
}

module.exports = {
  renderHomePage,
  renderLoginForm,
  logout,
  renderAllTrainersPage,
  renderPokedexPage,
  renderOwnProfile,
  renderOtherProfile,
  redirectToProfile,
  renderOnePokemon,
  renderCreateProfileForm,
  renderCapturePokemon,
  renderPokemonCollection,
};
