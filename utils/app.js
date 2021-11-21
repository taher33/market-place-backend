const express = require("express");
const appError = require("./utils/appError");
const users = require("./routes/users");
const cors = require("cors");
const posts = require("./routes/posts");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const errHandler = require("../controller/errConrtoller");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const pages = require("./routes/pages");
const cookieParser = require("cookie-parser");

const app = express();
const whiteList = [
  "http://localhost:3000",
  "https://social-media-taher.vercel.app",
];

app.use(
  cors({
    credentials: true,

    origin: function (origin, callback) {
      if (whiteList.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
// security headers against noSQL injection
app.use(helmet());
//data sanitazation
app.use(mongoSanitize());
//data sanitazation against xss
app.use(xss());
if (process.env.NODE_ENV === "dev") app.use(morgan("dev"));
// limit request for the api
const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: "too many request from this ip , plz try again later",
});
// app.use(limiter);
app.use(cookieParser());
// body parser
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// dublicate params
// app.use(
//   hpp({
//     whitelist: ["duration"],
//   })
// );
app.use(hpp());

app.use(express.json());

//my routes
app.get("/", (req, res) => {
  res.send("hey there");
});
app.use("/posts", posts);
app.use("/pages", pages);
app.use("/users", users);
// not found
app.all("*", (req, res, next) => {
  next(new appError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(errHandler);

module.exports = app;
