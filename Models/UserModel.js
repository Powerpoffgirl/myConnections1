const UserSchema = require("../Schemas/UserSchema");
const bcryptjs = require("bcryptjs");
const ObjectId = require("mongodb").ObjectId;
const cloudinary = require("cloudinary").v2   

let User = class {
  username;
  name;
  email;
  password;
  phoneNo;
  about;
  skills = [];
  certifications = [];
  experience = [];
  education = [];
  image;
  
  constructor({ username, email, password, name, phoneNo, about, skills = [], certifications = [], experience = [], education = [] , image }) {
    this.username = username;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phoneNo = phoneNo;
    this.about = about;
    this.skills = skills;
    this.certifications = certifications;
    this.experience = experience;
    this.education = education;
    this.image= image;
  }

  static verifyUserId({ userId }) {
    const userId1 = new ObjectId(userId)
    return new Promise(async (resolve, reject) => {

      console.log("Verify User Id status", ObjectId.isValid(userId1), userId1);
      if (!ObjectId.isValid(userId)) {
        reject("Invalid userId format");
      }
      try {
        console.log("USER SCEHMA", UserSchema)
        const userDb = await UserSchema.findById({ _id: userId1 });
        console.log("User From DB in VerifyUserId", userDb)
        if (!userDb) {
          reject(`No user corresponding to this ${userId}`);
        }
        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  registerUser() {
    return new Promise(async (resolve, reject) => {
      const hashedPassword = await bcryptjs.hash(
        this.password,
        parseInt(process.env.SALT)
      );
  
      const user = new UserSchema({
        username: this.username,
        name: this.name,
        email: this.email,
        password: hashedPassword,
        phoneNo: this.phoneNo,
        about: this.about,
        skills: this.skills, // Use direct assignment
        certifications: this.certifications, // Use direct assignment
        experience: this.experience, // Use direct assignment
        education: this.education, // Use direct assignment
        image: this.image
      });
  
      console.log("USER FROM USER MODEL", user);
      try {
        const userDb = await user.save();
        console.log("UserDb line 70", userDb);
        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async updateUser(userId, updatedUserData) {
    try {
      if (updatedUserData.password) {
        updatedUserData.password = await bcryptjs.hash(
          updatedUserData.password,
          parseInt(process.env.SALT)
        );
      }
  
      if (updatedUserData.image) {
        const file = updatedUserData.image;
        const cloudinaryResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
            if (err) {
              console.error("Error uploading to Cloudinary:", err);
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
        updatedUserData.image = cloudinaryResult.secure_url;
      }
  
      const userDb = await UserSchema.findByIdAndUpdate(userId, updatedUserData, {
        new: true,
        runValidators: true,
      });
  
      console.log("UserDb:", userDb);
      return userDb;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  

  static async findUserById(userId) {
    try {
      const userId1 = new ObjectId(userId);

      // Verify if the userId is in a valid format
      if (!ObjectId.isValid(userId1)) {
        throw new Error("Invalid userId format");
      }

      const userDb = await UserSchema.findById(userId1);

      if (!userDb) {
        throw new Error(`No user corresponding to this ${userId}`);
      }

      return userDb;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }


  static verifyUsernameAndEmailExits({ email, username }) {
    return new Promise(async (resolve, reject) => {
      try {
        const userDb = await UserSchema.findOne({
          $or: [{ email }, { username }],
        });
        console.log("userDb line 83", userDb)
        if (userDb && userDb.email === email) {
          reject("Email Already Exit");
        }

        if (userDb && userDb.username === username) {
          reject("Username Already Exit");
        }
        else
        return resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  static loginUser({ email, password }) {

    return new Promise(async (resolve, reject) => {
      try {
        // Find the user with loginId
        const userDb = await UserSchema.findOne({
           email: email
        });
  
        if (!userDb) {
          return reject("User does not exist");
        }
  
        // Match the password
        const isMatch = await bcryptjs.compare(password, userDb.password);
  
        if (!isMatch) {
          return reject("Incorrect password");
        }
  
        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = User;

// server --> Controller --> Model -->Schema --> Mongoose
