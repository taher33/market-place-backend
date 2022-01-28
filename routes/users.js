const express = require("express");
const router = express.Router();
const User = require("../models/userM");
const auth = require("../controller/authController");
const {
  updateMe,
  deleteMe,
  getAllUsers,
  getAllFriends,
  uploadUserImgs,
  follow,
  getOneUser,
  delete_everything,
  getNotifications,
  readMessages,
  getThreads,
} = require("../controller/userController");
const { deleteOne } = require("../controller/handlerFactory");

router.get("/checkLogin", auth.protect, auth.isLogedIn);

router.get("/threads", auth.protect, getThreads);

router.post("/login", auth.login);

router.get("/checkNotifications", auth.protect, getNotifications);

router.route("/").get(getAllUsers).post(auth.signUp);

router.post("/forgotPassword", auth.forgotPass);

router.patch("/resetPassword/:token", auth.resetPassword);

router.patch("/messages", auth.protect, readMessages);

router.patch("/updatePassword", auth.protect, auth.updatePassword);

router.patch("/updateMe", auth.protect, updateMe);

router.get("/:userId", auth.protect, getOneUser);

router.delete("/deleteMe", auth.protect, deleteMe);

router.delete("/logout", auth.protect, auth.logout);

router.delete("/deleteAll", delete_everything);

router
  .route("/follow")
  .get(auth.protect, getAllFriends)
  .patch(auth.protect, follow);

router.delete("/:id", auth.protect, auth.restricTo("admin"), deleteOne(User));

router.get("/notifications", auth.protect, getNotifications);

module.exports = router;
