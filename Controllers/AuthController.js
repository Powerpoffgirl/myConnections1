const express = require("express");
const AuthRouter = express.Router();
const { cleanUpAndValidate } = require("../utils/AuthUtils");
const User = require("../Models/UserModel");
const { isAuth } = require("../Middlewares/AuthMiddleware");
const bcryptjs = require("bcryptjs");

//  /auth/register
AuthRouter.post("/register", async (req, res) => {
  console.log("Request Body AuthController",req.body);
  const { name, username, email, password, phoneNo, about, skills, certifications, experience, education } = req.body;
  
  await cleanUpAndValidate({ name, email, password, username })
    .then(async () => {
      try {
        await User.verifyUsernameAndEmailExits({ email, username });
      } catch (error) {
        return res.send({
          status: 400,
          message: "Error Occurred",
          error: error,
        });
      }

      //create an obj for user class
      const userObj = new User({
        name,
        email,
        password,
        username,
        phoneNo,
        about,
        skills,
        certifications,
        experience,
        education
      });

      try {
        const userDb = await userObj.registerUser();
        console.log(userDb);
        return res.send({
          status: 200,
          message: "User Created Successfully",
          data: userDb,
        });
      } catch (error) {
        return res.send({
          status: 500,
          message: "Database error",
          error: error,
        });
      }
    })
    .catch((err) => {
      return res.send({
        status: 400,
        message: "Data Invalid",
        error: err,
      });
    });
});

// Assuming you have properly defined the AuthRouter using Express Router
AuthRouter.post("/login", async (req, res) => {
  try {
    console.log("REQUEST BODY",req.body)
    const { email, password } = req.body;
    // console.log("LOGIN_ID", loginId + "PASSWORD", password)
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Missing Credentials",
      });
    }

    const userDb = await User.loginUser({ email, password });

    if (!userDb) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Match the password
    const isMatch = await bcryptjs.compare(password, userDb.password);

    console.log("IS MATCH", isMatch)

    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: "Incorrect password",
      });
    }

    // Session-based authentication
    req.session.isAuth = true;
    req.session.user = {
      username: userDb.username,
      email: userDb.email,
      userId: userDb._id,
    };

    console.log("REQUEST SESSION AFTER LOGIN", req.session)

    return res.status(200).json({
      status: 200,
      message: "Login Successfully",
      data: userDb,
    });
  } catch (error) {
    console.error("Error occurred during login:", error);
    return res.status(500).json({
      status: 500,
      message: "Error Occurred",
      error: error.message, // Sending only the error message for security
    });
  }
});

AuthRouter.post("/logout", isAuth, async (req, res) => {
  try {
    console.log("REQUEST SESSION BEFORE LOGOUT", req.session);
    const user = req.session.user;

    req.session.destroy((err) => {
      if (err) {
        // Handle session destroy error
        console.error("Error occurred during logout:", err);
        return res.status(500).json({
          status: 500,
          message: "Logout Unsuccessful",
          error: "Something went wrong during logout.",
        });
      }

      // Successful logout
      return res.status(200).json({
        status: 200,
        message: "Logout Successfully",
        data: user,
      });
    });
  } catch (error) {
    // Catch any other unexpected errors during logout
    console.error("Error occurred during logout:", error);
    return res.status(500).json({
      status: 500,
      message: "Error Occurred",
      error: "Something went wrong during logout.",
    });
  }
});



module.exports = AuthRouter;
