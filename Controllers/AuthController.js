const express = require("express");
const AuthRouter = express.Router();
const { cleanUpAndValidate } = require("../utils/AuthUtils");
const User = require("../Models/UserModel");
const { isAuth } = require("../Middlewares/AuthMiddleware");
const bcryptjs = require("bcryptjs");
const cloudinary = require("cloudinary").v2    

 // /auth/register
AuthRouter.post("/register", async (req, res) => {
  console.log("Request Body AuthController", req.body);
  console.log("REQUEST FILES", req.files);
  const { name, username, email, password, phoneNo, about, skills, certifications, experience, education } = req.body;
  const file = req.files && req.files.image;

  try {
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }
    
    console.log("TEMP FILE PATH", file.tempFilePath);

    cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
      if (err) {
        console.error("Error uploading to Cloudinary:", err);
        return res.status(500).send("Error uploading image.");
      }
      console.log("Cloudinary upload result:", result);

      const userObj = new User({
        name,
        email,
        password,
        username,
        phoneNo,
        about,
        skills: skills || [], // Use skills or an empty array
        certifications: certifications || [], // Use certifications or an empty array
        experience: experience || [], // Use experience or an empty array
        education: education || [], // Use education or an empty array
        image: result.secure_url
      });

      try {
        const userDb = await userObj.registerUser();
        console.log(userDb);
        return res.status(200).send({
          status: 200,
          message: "User Created Successfully",
          data: userDb,
        });
      } catch (error) {
        return res.status(500).send({
          status: 500,
          message: "Database error",
          error: error,
        });
      }
    });
  } catch (error) {
    return res.status(400).send({
      status: 400,
      message: "Data Invalid - auth controller",
      error: error,
    });
  }
});

AuthRouter.get("/login", async(req, res)=>{
  return res.status(200).json({
    status: 200,
    message: "Login page",
  });
})

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


      // Generate a JWT token
      const token = jwt.sign(
        { userId: userDb._id, username: userDb.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

    // Session-based authentication
    // req.session.isAuth = true;
    // req.session.user = {
    //   username: userDb.username,
    //   email: userDb.email,
    //   userId: userDb._id,
    // };


    // console.log("REQUEST SESSION AFTER LOGIN", req.session)

    return res.status(200).json({
      status: 200,
      message: "Login Successfully",
      data: userDb,
      sessionId: req.sessionID,
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

// /auth/updateUser
AuthRouter.put("/updateUser", isAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const {
      phoneNo,
      about,
      skills,
      certifications,
      experience,
      education,
      // Include image in the request body if needed
    } = req.body;

    const file = req.files && req.files.image;

    const updatedUserData = {
      phoneNo,
      about,
      skills: skills || [],
      certifications: certifications || [],
      experience: experience || [],
      education: education || [],
    };

    if (file) {
      cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
        if (err) {
          console.error("Error uploading to Cloudinary:", err);
          return res.status(500).send("Error uploading image.");
        }
        console.log("Cloudinary upload result:", result);
        updatedUserData.image = result.secure_url;

        try {
          const updatedUser = await User.updateUser(userId, updatedUserData);
          return res.status(200).json({
            status: 200,
            message: "User Updated Successfully",
            data: updatedUser,
          });
        } catch (error) {
          return res.status(500).json({
            status: 500,
            message: "Database error",
            error: error.message,
          });
        }
      });
    } else {
      // No image provided, update user without an image
      try {
        const updatedUser = await User.updateUser(userId, updatedUserData);
        return res.status(200).json({
          status: 200,
          message: "User Updated Successfully",
          data: updatedUser,
        });
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Database error",
          error: error.message,
        });
      }
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      status: 500,
      message: "Database error",
      error: error.message,
    });
  }
});



AuthRouter.get("/getUserDetails", isAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;

    // Fetch user details from the database using the findUserById method
    const user = await User.findUserById(userId);

    return res.status(200).json({
      status: 200,
      message: "User details fetched successfully",
      data: {
        username: user.username,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        about: user.about,
        skills: user.skills,
        certifications: user.certifications,
        experience: user.experience,
        education: user.education,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      status: 500,
      message: "Error fetching user details",
      error: error.message,
    });
  }
});


AuthRouter.post("/logout", isAuth, async (req, res) => {
  try {
    console.log("REQUEST BODY FROM LOGOUT", req.body);
    console.log("REQUEST SESSION  LOGOUT", req.session);
    const user = req.session.user;

    // req.session.destroy((err) => {
    //   if (err) {
    //     // Handle session destroy error
    //     console.error("Error occurred during logout:", err);
    //     return res.status(500).json({
    //       status: 500,
    //       message: "Logout Unsuccessful",
    //       error: "Something went wrong during logout.",
    //     });
    //   }
      // Successful logout
      return res.status(200).json({
        status: 200,
        message: "Logout Successfully",
        data: user,
        logout:true,
      });
    // });
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

// app.post("/logout_from_all_devices", isAuth, async (req, res) => {
//   const username = req.session.user.username;

//   //create a session schema
//   const Schema = mongoose.Schema;
//   const sessionSchema = new Schema({ _id: String }, { strict: false });
//   const sessionModel = mongoose.model("session", sessionSchema);

//   try {
//     const deletionCount = await sessionModel.deleteMany({
//       "session.user.username": username,
//     });
//     console.log(deletionCount);
//     return res.send({
//       status: 200,
//       message: "Logout from all devices successfully",
//     });
//   } catch (error) {
//     return res.send({
//       status: 500,
//       message: "Logout Failed",
//       error: error,
//     });
//   }
// });



module.exports = AuthRouter;
