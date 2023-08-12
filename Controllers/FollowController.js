const express = require("express");
const User = require("../Models/UserModel");
const {
  followUser,
  followingUsersList,
  followerUsersList,
  unfollowUser,
} = require("../Models/FollowModel");
const { off } = require("../Schemas/FollowSchema");
const FollowRouter = express.Router();

FollowRouter.get("/follow-user", async (req, res) => {
  const followerUserId = req.session.user.userId;
  const followingUserId = req.body.followingUserId;

  //Validate followerUserId
  try {
    const followDb = await User.verifyUserId({ userId: followerUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Invalid follower userId",
      error: error,
    });
  }

  //Validate followingUserId
  try {
    await User.verifyUserId({ userId: followingUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Invalid following userId",
      error: error,
    });
  }

  //   create an entry in follow collection
  try {
    const followDb = await followUser({ followingUserId, followerUserId });
    return res.send({
      status: 201,
      message: "Follow successfull",
      data: followDb,
    });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Database error.",
      error: error,
    });
  }
});

FollowRouter.post("/following-list", async (req, res) => {
  const followerUserId = req.session.user.userId;
  console.log("Follower User Id: ", followerUserId)
  const skip = req.query.skip || 0;
  //   Validate the userId
  try {
    User.verifyUserId({ userId: followerUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Invalid follower userId",
      error: error,
    });
  }

  try {
    const followingList = await followingUsersList({ followerUserId, skip });
  console.log("Following List", followingList)
    if (followingList.length === 0) {
      return res.send({
        status: 200,
        message: "Following list is empty",
      });
    }

    return res.send({
      status: 200,
      message: "Read success",
      data: followingList,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

FollowRouter.post("/follower-list", async (req, res) => {
  const followingUserId = req.session.user.userId;
  const skip = req.query.skip || 0;

  // validate id
  try {
    await User.verifyUserId({ userId: followingUserId });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      message: "Invalid follower userID",
      error: error,
    });
  }

  try {
    const followerList = await followerUsersList({ followingUserId, skip });
    return res.send({
      status: 200,
      message: "Read Success",
      data: followerList,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

FollowRouter.post("/unfollow-user", async (req, res) => {
  const followerUserId = req.session.user.userId;
  const followingUserId = req.body.followingUserId;

  //Validate followerUserId
  try {
    await User.verifyUserId({ userId: followerUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Invalid follower userId",
      error: error,
    });
  }

  //Validate followingUserId
  try {
    await User.verifyUserId({ userId: followingUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Invalid following userId",
      error: error,
    });
  }

  try {
    const followDb = await unfollowUser({ followerUserId, followingUserId });
    return res.send({
      status: 200,
      message: "Unfollow Successfull",
      data: followDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Error Occured",
      error: error,
    });
  }
});

module.exports = FollowRouter;
