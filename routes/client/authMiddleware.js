const Trainer = require("../../models/trainersModel");
const {
  createToken,
  validateToken,
  deleteToken,
} = require("../../controllers/api/tokenMap");

async function isLoggedIn(req, res, next) {
  try {
    if (req.session && req.session.userId) {
      req.isLoggedIn = true;
      const trainer = await Trainer.findById(req.session.userId);
      req.username = trainer.Username;
      return next();
    } else {
      req.isLoggedIn = false;
      req.username = null;
      return next();
    }
  } catch (error) {
    let errorObj = {
      message: "isLoggedIn middleware failed",
      payload: error,
    };

    console.log(errorObj);
    res.json(errorObj);
  }
}

// Used when accessing personal pages
async function isAuthorized(req, res, next) {
  console.log("running isAuthorized");
  try {
    const token = req.cookies.authToken;
    let corresId = null;
    if (token) {
      corresId = await validateToken(token);
    }
    if (
      corresId &&
      req.session &&
      req.session.userId &&
      req.session.userId.toString() === corresId.toString()
    ) {
      return next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    let errorObj = {
      message: "isAuthorized middleware failed",
      payload: error,
    };

    console.log(errorObj);
    res.json(errorObj);
  }
}

module.exports = { isLoggedIn, isAuthorized };
