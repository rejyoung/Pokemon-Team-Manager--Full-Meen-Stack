const mongoose = require("mongoose");

const tokenMapSchema = mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  databaseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "trainers",
  },
  expireAt: {
    type: Date,
    required: true,
    index: {
      expires: 0,
    },
  },
});

const TokenMap = mongoose.model("TokenMap", tokenMapSchema);

module.exports = TokenMap;
