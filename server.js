const express = require("express"); //Imported express here
require("dotenv").config(); //Connected .env file
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);
const server = express(); //Created server here
const cors = require("cors"); //Cross origin connection with the client side
const clc = require("cli-color");
const db = require("./db"); //Database is connected to the server

const PORT = process.env.PORT || 8009; //Imported PORT from .env file

server.use(express.json()); //For json 
server.use(express.urlencoded({ extended: true })); //for URL 

const { isAuth } = require("./Middlewares/AuthMiddleware");
const AuthRouter = require("./Controllers/AuthController");
const FollowRouter = require("./Controllers/FollowController");


// middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Creating sessions schemas
const store = new mongoDbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// Creating sessions
server.use(
    session({
      secret: process.env.SECRECT_KEY,
      resave: false,
      saveUninitialized: false,
      store: store,
    })
  );

server.use(AuthRouter);
server.use("/auth", AuthRouter);
server.use("/follow", isAuth, FollowRouter);

// server.get("/login")

// Test get request
server.get("/", (req, res) => {
    return res.send({
      status: 200,
      message: "Welcome to your My Connections App",
    });
  });


// Server is listening
server.listen(PORT, (req, res) => {
    console.log(clc.yellow.underline(`Server is running on port ${PORT}`));
  });
  