const express = require("express"); //Imported express here
require("dotenv").config(); //Connected .env file
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);
const server = express(); //Created server here
const cors = require("cors"); //Cross origin connection with the client side
const clc = require("cli-color");
const db = require("./db"); //Database is connected to the server
const fileUpload = require('express-fileupload')
const cloudinary = require("cloudinary").v2          

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const PORT = process.env.PORT || 8009; //Imported PORT from .env file

server.use(
  cors({
    origin: "http://localhost:3000", // Replace with the actual origin of your React app
    credentials: true,
  })
);

const { isAuth } = require("./Middlewares/AuthMiddleware");
const AuthRouter = require("./Controllers/AuthController");
const FollowRouter = require("./Controllers/FollowController");


// middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(fileUpload({
  useTempFiles:true
}))
// AuthRouter.use(fileUpload({
//   useTempFiles: true,
// }));


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

// server.post("/", (req, res) => {
//   console.log(req.body);

//   if (!req.files || !req.files.photo) {
//     return res.status(400).send("No file uploaded.");
//   }

//   const file = req.files.photo;

//   cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
//     if (err) {
//       console.error("Error uploading to Cloudinary:", err);
//       return res.status(500).send("Error uploading image.");
//     }
//     console.log("Cloudinary upload result:", result);
//     // You can do further processing or response handling here
//     res.send("Image uploaded successfully!");
//   });
// });




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
  