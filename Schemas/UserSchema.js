const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  phoneNo:{
    type: String,
    require: true,
  },
  about:{
    type:String,
    require:true,
  },
  skills:{
    type: Array,
  },
  certifications:{
    type: Array,
  },
  experience:{
    type: Array,
  },
  education:{
    type: Array,
  },
  image:{
    type:Buffer,
  }
});

module.exports = mongoose.model("users", userSchema);
