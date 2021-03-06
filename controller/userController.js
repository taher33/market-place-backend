const User = require("../models/userM");
const Notification = require("../models/notification");
const Messages = require("../models/messages");
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
  }).populate("creator");

  res.status(200).json({
    status: "success",
    notifications,
  });
});

exports.getOneThread = handleasync(async (req, res, next) => {
  if (!req.body.thread_id) return next(new appError("provide thread id", 400));

  const thread = await Thread.findById(req.body.thread_id)
    .populate("clients")
    .populate("messages")
    .populate("product");

  if (!req.body.thread_id)
    return next(new appError("no thread with this id was found", 404));

  let client =
    `${thread.clients[0]._id}` !== `${req.user._id}`
      ? thread.clients[0]
      : thread.clients[1];

  let lastmsg = thread.messages.filter(
    (thread) => `${thread.sender}` !== `${req.user._id}`
  );
  const newthread = {
    client,
    lastmsg,
    _id: thread._id,
    messages: thread.messages,
  };
  res.json({
    newthread,
  });
});

exports.getThreads = handleasync(async (req, res, next) => {
  const threads = await Thread.find({ _id: { $in: req.user.threads } })
    .populate("clients")
    .populate("messages")
    .populate("product");

  if (!threads) return next(new appError("no threads found", 404));

  const newThread = threads.map((el) => {
    let client =
      `${el.clients[0]._id}` !== `${req.user._id}`
        ? el.clients[0]
        : el.clients[1];

    let unreadMsg = el.messages
      .filter((el) => !el.read)
      .filter((el) => `${el.sender}` !== `${req.user._id}`).length;

    let lastmsg = el.messages.filter(
      (el) => `${el.sender}` !== `${req.user._id}`
    );

    return {
      client,
      lastMessage: lastmsg[lastmsg.length - 1],
      unreadMsg,
      productThread: el.productThread,
      _id: el._id,
      product: el.product,
      messages: el.messages,
    };
  });

  res.status(200).json({
    status: "success",
    newThread,
  });
});

exports.readMessages = handleasync(async (req, res, next) => {
  if (!!req.body.messages.lenght)
    return next(new appError("must specify messages", 400));

  const messagesIds = req.body.messages.map((el) => el._id);

  const messages = await Messages.updateMany(
    {
      _id: { $in: messagesIds },
    },
    { read: true }
  );

  res.status(200).json({
    status: "success",
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
