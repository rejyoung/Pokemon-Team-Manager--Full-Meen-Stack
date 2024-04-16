/*
    IMPORTS
*/
const express = require("express");
const app = express();
const connectToMongoDB = require("./db/mongodb");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");

/*
    MIDDLEWARE
*/
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logger("dev"));
app.use(cookieParser());

/*
    LOGIN MIDDLEWARE
*/
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24 hours
    },
  })
);

/*
    ROUTES
*/
const viewRouter = require("./routes/client/viewRouter");
// localhost:3000/...
app.use("/", viewRouter);

const trainersRouter = require("./routes/api/trainersRouter");
// localhost:8080/api/trainers/...
app.use("/api/trainers", trainersRouter);

const pokemonRouter = require("./routes/api/pokemonRouter");
// localhost:8080/api/pokemon...
app.use("/api/pokemon", pokemonRouter);

/*
    APP LISTENING
*/
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`server is on port ${PORT}`);

  connectToMongoDB();
});
