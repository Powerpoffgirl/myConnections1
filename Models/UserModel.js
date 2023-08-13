const UserSchema = require("../Schemas/UserSchema");
const bcryptjs = require("bcryptjs");
const ObjectId = require("mongodb").ObjectId;

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
  
  constructor({ username, email, password, name, phoneNo, about, skills = [], certifications = [], experience = [], education = []  }) {
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
        phoneNo:this.phoneNo,
        about:this.about,
        skills: [...this.skills],
        certifications: [...this.certifications],
        experience: [...this.experience],
        education: [...this.education],
      });

      try {
        const userDb = await user.save();
        console.log("UserDb line 70", userDb)
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
