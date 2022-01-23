const User = require("../models/userM");
const Notification = require("../models/notification");
const Thread = require("../models/threads");
const appError = require("../utils/appError");
const handleasync = require("../utils/handleAsync");
const { findByIdAndUpdate } = require("../models/userM");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const filterObj = (obj, ...allowed) => {
  const filterdObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowed.includes(el)) filterdObj[el] = obj[el];
  });
  return filterdObj;
};

exports.updateMe = handleasync(async (req, res, next) => {
  const filterdBody = filterObj(req.body, "name", "email", "description");
  if (req.files) {
    const picture = req.files.profileImg;
    const uploadResult = await cloudinary.v2.uploader.upload(
      picture.tempFilePath
    );
    filterdBody.profileImg = uploadResult.secure_url;
  }

  const user = await User.findByIdAndUpdate(req.user._id, filterdBody, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.deleteMe = handleasync(async (req, res, next) => {
  await findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "seccuss",
  });
});

exports.getAllUsers = handleasync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    number: await User.countDocuments(),
    result: users,
  });
});

exports.getNotifications = handleasync(async (req, res, next) => {
  const notifications = await Notification.find({
    client: req.user._id,
  });

  res.status(200).json({
    status: "success",
    notifications,
  });
});

exports.follow = handleasync(async (req, res, next) => {
  if (!req.body.email) return next(new appError("email required"), 400);

  const client = await User.findOne({ email: req.body.email });

  if (!client) return next(new appError("user does not exist", 404));

  if (req.user.People_I_follow.includes(client._id)) {
    //removing user id from clients following list
    req.user.People_I_follow.splice(
      req.user.People_I_follow.indexOf(client._id),
      1
    );
    //removing client id from users followers list
    client.People_that_follow_me.splice(
      client.People_that_follow_me.indexOf(req.user._id),
      1
    );
    client.save({ validateBeforeSave: false });
    req.user.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: "success",
    });
  } else {
    const thread = await Thread.create({
      clients: [req.user._id, client._id],
    });
    client.People_that_follow_me.push(req.user._id);
    client.threads.push(thread._id);
    req.user.People_I_follow.push(client._id);
    req.user.threads.push(thread._id);
    client.save({ validateBeforeSave: false });
    req.user.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: "success",
  });
});

// todo: delete this because follow fn does this also
exports.Unfollow = handleasync(async (req, res, next) => {
  if (!req.body.id) return next(new appError("plz provide an id", 400));

  if (!req.user.friends.includes(req.body.id))
    return next(new appError("user was not found", 404));

  // removing the id from the friends array
  const index = req.user.friends.indexOf(req.body.id);
  req.user.friends.splice(index, 1);

  res.status(204).json({
    status: "success",
  });
});

// testing
exports.getAllFriends = handleasync(async (req, res, next) => {
  const friends = await User.find({ _id: req.user.friends });

  res.json({
    status: "seccuss",
    friends,
  });
});

exports.getOneUser = handleasync(async (req, res, next) => {
  let id = req.params.userId;
  const user = await User.findById(id);
  if (!user) {
    return next(new appError("user does nnot exist", 404));
  }
  res.json({
    status: "success",
    user,
  });
});

exports.delete_everything = async (req, res, next) => {
  await User.deleteMany();
  res.json({
    status: "success",
  });
};
