const Pokemon = require("../../models/pokemonModel");
const mongoose = require("mongoose");
const Trainer = require("../../models/trainersModel");
const argon2 = require("argon2");
const { createToken, validateToken, deleteToken } = require("./tokenMap");

//////////////////////
// TRAINER CREATION //
//////////////////////

async function createProfile(req, res) {
  try {
    let inputPassword = req.body.password;
    const username = req.body.username;
    const displayName = req.body.displayName;

    const duplicate = await Trainer.find({ Username: username });
    if (duplicate.length > 0) {
      return res.status(406).json({ message: "username already exists" });
    }

    const safePassword = await argon2.hash(inputPassword);
    await Trainer.create({
      Username: username,
      Password: safePassword,
      DisplayName: displayName,
      Region: req.body.region,
    });

    newTrainer = await Trainer.findOne({ Username: req.body.username });

    // Add user object id to session data
    req.session.userId = newTrainer._id;

    //Create token and register with token map
    const userToken = await createToken(newTrainer._id);

    // Store token in HttpOnly cookie
    res.cookie("authToken", userToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ redirectURL: `/trainer/profile?token=${userToken}` });
  } catch (error) {
    let errorObj = {
      message: "failure to create trainer profile",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

//////////////////////
// TRAINER DELETION //
//////////////////////

async function deleteTrainer(req, res) {
  try {
    let trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }
    let targetTrainer = Trainer.findOne({ _id: trainerId });
    let pokemonList = targetTrainer.PokemonCollection;

    // Remove trainer from species teams lists
    if (typeof pokemonList != "undefined") {
      if (pokemonList.length > 0) {
        pokemonList.forEach(async (pokemon) => {
          let targetSpecies = await Pokemon.findOne({ _id: pokemon.SpeciesID });
          let trainerIndex = targetSpecies.TeamsOn.indexOf(targetTrainer._id);
          if (trainerIndex != -1) {
            targetSpecies.TeamsOn.splice(trainerIndex, 1);
          }
          await targetSpecies.save();
        });
      }
    }

    await Trainer.deleteOne({ _id: trainerId });

    req.session.destroy(async (err) => {
      if (err) {
        console.error("Session destroy failure", err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to logout" });
      }

      deleteToken(req.params.token);

      res.cookie("authToken", "", {
        maxAge: 0,
        httpOnly: true,
      });
      res.status(200).end();
    });
  } catch (error) {
    let errorObj = {
      message: "failure to delete trainer",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

////////////////////
// AUTHENTICATION //
////////////////////

async function logIn(req, res) {
  try {
    const inputPassword = req.body.password;
    const inputUsername = req.body.username;
    console.log(inputUsername);
    const targetTrainer = await Trainer.findOne({ Username: inputUsername });
    const isCorrectPassword = await argon2.verify(
      targetTrainer.Password,
      inputPassword
    );

    if (isCorrectPassword) {
      // Add user object id to session data
      req.session.userId = targetTrainer._id;

      //Create token and register with token map
      const userToken = await createToken(targetTrainer._id);

      // Store token in HttpOnly cookie
      res.cookie("authToken", userToken, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.redirect(`/trainer/profile?token=${userToken}`);
    } else {
      res.status(500).json({
        message: "logIn function success",
        payload: "Incorrect username or password. Please try again.",
      });
    }
  } catch (error) {
    let errorObj = {
      message: "failure to log in",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

/////////////////??/////
// ACCOUNT MANAGEMENT //
/////////////////??/////

async function changePassword(req, res) {
  try {
    const trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }

    const targetTrainer = Trainer.findOne({ _id: trainerId });
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const isCorrectPassword = await argon2.verify(
      targetTrainer.Password,
      oldPassword
    );

    if (isCorrectPassword) {
      const safeNewPassword = argon2.hash(newPassword);
      targetTrainer.Password = safeNewPassword;
      res.status(200).end();
    } else {
      res.status(401).end();
    }
  } catch (error) {
    let errorObj = {
      message: "failure to change password",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function changeDisplayName(req, res) {
  try {
    const trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }
    const targetTrainer = Trainer.findOne({ _id: trainerId });
    const inputPassword = req.body.password;
    const newDisplayName = req.body.newDisplayName;
    const isCorrectPassword = await argon2.verify(
      targetTrainer.Password,
      inputPassword
    );

    if (isCorrectPassword) {
      targetTrainer.DisplayName = newDisplayName;
      res.status(200).json({ newDisplayName: targetTrainer.displayName });
    } else {
      res.status(401).end();
    }
  } catch (error) {
    let errorObj = {
      message: "failure to change display name",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

///////////////////
// GET FUNCTIONS //
///////////////////

async function getTrainers(req, res) {
  try {
    res.json({
      message: "success",
      payload: await Trainer.find({}),
    });
  } catch (error) {
    let errorObj = {
      message: "failure to get all trainers",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function getOneTrainer(req, res) {
  try {
    let result = await Trainer.findById(req.params.id);
    res.json({
      message: "success",
      payload: result,
    });
  } catch (error) {
    let errorObj = {
      message: "failure to get all trainers",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function getTrainerPokemon(req, res) {
  try {
    let targetTrainer = await Trainer.findById(req.params.id);
    let collection = targetTrainer.PokemonCollection;
    res.json({
      message: "success",
      payload: collection,
    });
  } catch (error) {
    let errorObj = {
      message: "failure to get trainer collection",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function getOneTrainerPokemon(req, res) {
  try {
    let objectId = new mongoose.Types.ObjectId(req.params.pokemonID);
    console.log(objectId);
    let results = await Trainer.aggregate([
      { $match: { Username: req.params.username } },
      { $unwind: "$PokemonCollection" },
      {
        $match: {
          "PokemonCollection._id": objectId,
        },
      },
      { $project: { pokemon: "$PokemonCollection" } },
    ]);
    res.status(200).json({
      pokemon: results[0].pokemon,
    });
  } catch (error) {
    let errorObj = {
      message: "failure to get trainer pokemon",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

/////////////////////
// TEAM MANAGEMENT //
/////////////////////

async function capturePokemon(req, res) {
  try {
    let trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }
    let targetTrainer = await Trainer.findById(trainerId);

    if (!targetTrainer.PokemonCollection) {
      targetTrainer.PokemonCollection = [];
    }

    let targetPokemon = await Pokemon.findById(req.body.id);

    if (!targetPokemon.TeamsOn) {
      targetPokemon.TeamsOn = [];
    }

    // Add new pokemon to trainer current team if there's room
    let onTeam = false;
    let currentTeam = targetTrainer.PokemonCollection.filter(
      (p) => p.CurrentTeam
    );
    if (currentTeam.length < 6) {
      onTeam = true;
    }

    // Create Moves Array
    let movesArr = [];
    let filteredMoves = targetPokemon.Moves.filter(
      (move) => move.Level <= targetPokemon.StartingLevel
    );
    filteredMoves.forEach((move) => {
      moveObj = {
        Level: move.Level,
        MoveName: move.MoveName,
      };
      movesArr.push(moveObj);
    });

    // Store Next Species in Evolution Tree
    let speciesNextEv = targetPokemon.NextEvolution;
    let nextEvolutionArray = await Promise.all(
      speciesNextEv.map(async (species) => {
        let evSpecId = await Pokemon.findOne({ Name: species.SpeciesName });
        return evSpecId;
      })
    );

    let targetPokemonName =
      targetPokemon.Name[0].toUpperCase() + targetPokemon.Name.slice(1);

    // Add Pokemon object to trainer collection array
    await targetTrainer.PokemonCollection.addToSet({
      SpeciesID: targetPokemon._id,
      Level: targetPokemon.StartingLevel,
      Nickname: targetPokemonName,
      CurrentTeam: onTeam,
      ImgURL: targetPokemon.ImgPath,
      NextEvolution: nextEvolutionArray,
      Moves: movesArr,
    });

    // Add trainer to species array of teams
    await targetPokemon.TeamsOn.addToSet(targetTrainer._id);

    await targetTrainer.save();
    await targetPokemon.save();

    res.status(200).json({
      redirectUrl: `/trainer/profile/pokemonCollection?token=${req.params.token}`,
    });
  } catch (error) {
    let errorObj = {
      message: "failure to capture pokemon",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function levelPokemon(req, res) {
  try {
    let trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }
    let targetTrainer = await Trainer.findById(trainerId);
    const pokemonID = req.body.id;
    let evolvePossible = false;

    // Find index of pokemon to be leveled
    const pokemonIndex = targetTrainer.PokemonCollection.findIndex(
      (pokemon) => pokemon._id.toString() === pokemonID
    );
    const targetPokemon = targetTrainer.PokemonCollection[pokemonIndex];

    // Increment level
    targetPokemon.Level += 1;

    //Update this pokemon from species data
    let newLevel = targetPokemon.Level;
    let targetSpeciesID = targetPokemon.SpeciesID;
    let targetSpecies = await Pokemon.findById(targetSpeciesID);

    // add new moves
    let moves = targetSpecies.Moves.filter((move) => move.Level <= newLevel);
    moves.forEach((move) => targetPokemon.Moves.addToSet(move));

    // set CanEvolve status
    if (
      targetSpecies.EvolutionLevel == 0 &&
      targetSpecies.EvolutionTree.firstEvolution.length > 0
    ) {
      let minimumLev = targetSpecies.EvolutionTree.firstEvolution[0].MinLevel;
      if (newLevel >= minimumLev) {
        targetTrainer.PokemonCollection[pokemonIndex].CanEvolve = true;
        evolvePossible = true;
      }
    }
    if (
      targetSpecies.EvolutionLevel == 1 &&
      targetSpecies.EvolutionTree.finalEvolution.length > 0
    ) {
      let minimumLev = targetSpecies.EvolutionTree.finalEvolution[0].MinLevel;
      if (newLevel >= minimumLev) {
        targetPokemon.CanEvolve = true;
        evolvePossible = true;
      }
    }

    await targetTrainer.save();

    res.status(200).json({ level: newLevel, canEvolve: evolvePossible });
  } catch (error) {
    let errorObj = {
      message: "failure to level pokemon",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function getEvolutions(req, res) {
  try {
    let trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }
    const targetTrainer = await Trainer.findById(trainerId);
    let targetPokemon = targetTrainer.PokemonCollection.filter(
      (pokemon) => pokemon._id.toString() === req.params.pokemonId
    );
    let nextEvIds = targetPokemon[0].NextEvolution;
    let nextEvolutions = await Pokemon.find({ _id: { $in: nextEvIds } });
    res.status(200).json({ NextEvolutions: nextEvolutions });
  } catch (error) {
    const errorObj = {
      message: "failure to get evolutions",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function evolvePokemon(req, res) {
  try {
    let trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }
    // Get pokemon to be evolved
    const targetTrainer = await Trainer.findById(trainerId);
    const pokemonID = req.body.currentId;
    const evolvedSpeciesID = req.body.newSpeciesId;

    const pokemonIndex = targetTrainer.PokemonCollection.findIndex(
      (pokemon) => pokemon._id.toString() === pokemonID
    );
    const targetPokemon = targetTrainer.PokemonCollection[pokemonIndex];

    // Get new species object
    const oldSpeciesID = targetPokemon.SpeciesID;
    const oldSpecies = await Pokemon.findById(oldSpeciesID);
    const newSpecies = await Pokemon.findById(evolvedSpeciesID);

    // Remove trainer from old species list if trainer owns no other pokemon of that species
    if (
      targetTrainer.PokemonCollection.filter(
        (p) => p.SpeciesID.toString() === oldSpeciesID.toString()
      ).length > 1
    ) {
      let trainerIndexOldSpecies = oldSpecies.TeamsOn.indexOf(
        targetTrainer._id
      );
      await oldSpecies.TeamsOn.splice(trainerIndexOldSpecies, 1);
    }

    // Add trainer to new species list
    if (!newSpecies.TeamsOn) {
      newSpecies.TeamsOn = [];
    }
    await newSpecies.TeamsOn.addToSet(targetTrainer._id);

    await newSpecies.save();
    await oldSpecies.save();

    // Determine new nickname
    if (targetPokemon.Nickname.toLowerCase() == oldSpecies.Name) {
      if (newSpecies.Name.startsWith("mr.")) {
        targetPokemon.Nickname =
          newSpecies.Name[0].toUpperCase() +
          newSpecies.Name.slice(1, 4) +
          newSpecies.Name[4].toUpperCase() +
          newSpecies.Name.slice(5);
      } else {
        targetPokemon.Nickname =
          newSpecies.Name[0].toUpperCase() + newSpecies.Name.slice(1);
      }
    }

    // Update pokemon data with new species info
    targetPokemon.SpeciesID = newSpecies._id;
    targetPokemon.CanEvolve = false;
    targetPokemon.ImgURL = newSpecies.ImgPath;

    // Update pokemon evolution data
    let speciesNextEv = newSpecies.NextEvolution;
    let nextEvolutionArray = await Promise.all(
      speciesNextEv.map(async (species) => {
        let evSpecId = await Pokemon.findOne({ Name: species.SpeciesName });
        return evSpecId;
      })
    );
    targetPokemon.NextEvolution = nextEvolutionArray;
    if (
      newSpecies.EvolutionLevel == 1 &&
      newSpecies.EvolutionTree.finalEvolution.length > 0
    ) {
      let minimumLev = newSpecies.EvolutionTree.finalEvolution[0].MinLevel;
      if (targetPokemon.Level >= minimumLev) {
        targetPokemon.CanEvolve = true;
      }
    }

    await targetTrainer.save();
    console.log(targetPokemon);
    res.status(200).json({
      NewPokemon: targetPokemon,
    });
  } catch (error) {
    let errorObj = {
      message: "failure to evolve pokemon",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

// Remove pokemon from collection
async function releasePokemon(req, res) {
  try {
    let trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }
    const targetTrainer = await Trainer.findById(trainerId);
    const pokemonID = req.body.id;
    const pokemonIndex = targetTrainer.PokemonCollection.findIndex(
      (pokemon) => pokemon._id.toString() === pokemonID
    );
    let targetSpeciesID =
      targetTrainer.PokemonCollection[pokemonIndex].SpeciesID;
    let targetSpecies = await Pokemon.findById(targetSpeciesID);
    targetTrainer.PokemonCollection.splice(pokemonIndex, 1);
    if (
      !targetTrainer.PokemonCollection.filter(
        (p) => p.SpeciesID.toString() === targetSpeciesID
      )
    ) {
      let trainerIndex = targetSpecies.TeamsOn.indexOf(targetTrainer._id);
      targetSpecies.TeamsOn.splice(trainerIndex, 1);
    }
    await targetTrainer.save();
    await targetSpecies.save();

    res.status(200).end();
  } catch (error) {
    let errorObj = {
      message: "failure to release pokemon",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function addPokemonToCurrentTeam(req, res) {
  try {
    let trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }
    let targetTrainer = await Trainer.findById(trainerId);
    if (
      targetTrainer.PokemonCollection.filter((mon) => mon.CurrentTeam).length <
      6
    ) {
      const result = await Trainer.updateOne(
        { _id: targetTrainer.id, "PokemonCollection._id": req.body.id },
        { $set: { "PokemonCollection.$.CurrentTeam": true } }
      );
      if (result.modifiedCount === 0) {
        throw new Error("update failed");
      }
    }

    res.status(200).end();
  } catch (error) {
    let errorObj = {
      message: "failure to add pokemon to current team",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function removePokemonFromCurrentTeam(req, res) {
  try {
    let trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }
    let targetTrainer = await Trainer.findById(trainerId);
    const result = await Trainer.updateOne(
      { _id: targetTrainer.id, "PokemonCollection._id": req.body.id },
      { $set: { "PokemonCollection.$.CurrentTeam": false } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("update failed");
    }

    res.status(200).end();
  } catch (error) {
    let errorObj = {
      message: "failure to add pokemon to current team",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function updateNickname(req, res) {
  try {
    let trainerId = await validateToken(req.params.token);
    const authorized = await isAuthorized(trainerId, req.session.userId);
    if (!authorized) {
      return res.status(401).end();
    }

    let targetTrainer = await Trainer.findById(trainerId);
    const pokemonID = req.body.id;
    const newNickname = req.body.newNickname;
    const pokemonIndex = targetTrainer.PokemonCollection.findIndex(
      (pokemon) => pokemon._id.toString() === pokemonID
    );

    targetTrainer.PokemonCollection[pokemonIndex].Nickname = newNickname;

    await targetTrainer.save();

    res.status(200).json({ nickname: newNickname });
  } catch (error) {
    let errorObj = {
      message: "failure to update nickname",
      payload: error,
    };

    // server-side error
    console.log(errorObj);

    // client-side error
    res.json(errorObj);
  }
}

async function isAuthorized(tokenId, sessionId) {
  try {
    return tokenId.toString() === sessionId;
  } catch (error) {
    console.error("Error validating token", error);
    return false;
  }
}

module.exports = {
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
  getTrainerPokemon,
  updateNickname,
  getEvolutions,
};
