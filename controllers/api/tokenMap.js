const TokenMap = require("../../models/tokenMapModel");
const { v4: uuidv4 } = require("uuid");

async function createToken(ObjectId) {
  try {
    const expirationDuration = 24 * 60 * 60 * 1000;
    const expireAt = new Date(Date.now() + expirationDuration);
    const newToken = String(await uuidv4());
    await TokenMap.create({
      token: newToken,
      databaseId: ObjectId,
      expireAt: expireAt,
    });
    return newToken;
  } catch (error) {
    errObj = {
      message: "createToken failure",
      payload: error,
    };

    console.log(errObj);
  }
}

async function validateToken(token) {
  try {
    const tokenMap = await TokenMap.findOne({ token: token });
    return tokenMap.databaseId;
  } catch (error) {
    errObj = {
      message: "validateToken failure",
      payload: error,
    };

    console.log(errObj);
  }
}

async function deleteToken(token) {
  try {
    await TokenMap.deleteOne({ token: token });
  } catch (error) {
    errObj = {
      message: "deleteToken failure",
      payload: error,
    };

    console.log(errObj);
  }
}

module.exports = { createToken, validateToken, deleteToken };
