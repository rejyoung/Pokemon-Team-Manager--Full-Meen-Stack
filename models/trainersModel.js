const mongoose = require("mongoose");

ObjectID = mongoose.Schema.Types.ObjectId;

const moveSchema = new mongoose.Schema(
  {
    Level: {
      type: Number,
      required: true,
      default: "",
    },
    MoveName: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const ownedPokemonSchema = new mongoose.Schema({
  SpeciesID: {
    type: ObjectID,
    ref: "Pokemon",
    required: true,
  },
  Level: {
    type: Number,
    required: true,
    default: 0,
  },
  CanEvolve: {
    type: Boolean,
    required: true,
    default: false,
  },
  Moves: [moveSchema],
  Nickname: {
    type: String,
    required: true,
  },
  CurrentTeam: {
    type: Boolean,
    required: true,
    default: false,
  },
  NextEvolution: {
    type: [
      {
        type: ObjectID,
        ref: "Pokemon",
      },
    ],
  },
  HeldForTrade: {
    type: Boolean,
    required: true,
    default: false,
  },
  ImgURL: {
    type: String,
  },
  MinimumLevel: {
    type: String,
    required: true,
    default: 1,
  },
});

const trainerSchema = new mongoose.Schema(
  {
    Username: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
      unique: true,
    },
    DisplayName: {
      type: String,
      required: true,
    },
    Region: {
      type: String,
      required: true,
      default: "Kanto",
    },
    PokemonCollection: [ownedPokemonSchema],
    ProfilePicPath: {
      type: String,
      required: true,
      default: `/img/default.png`,
    },
  },
  { timestamps: true }
);

trainerSchema.index({ Username: 1, "PokemonCollection._id": 1 });

const Trainer = mongoose.model("Trainer", trainerSchema);

module.exports = Trainer;
