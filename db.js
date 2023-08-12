const mongoose = require("mongoose"); //ODM imported
const clc = require("cli-color"); //For colored text 

mongoose
  .connect(process.env.MONGO_URI) //Connecting database with mongoose
  .then((res) => {
    console.log(clc.yellow.underline("MongoDb is connected"));
  })
  .catch((err) => {
    console.log(clc.red(err));
  });
