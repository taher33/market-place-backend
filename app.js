const express = require("express");
const appError = require("./utils/appError");
const users = require("./routes/users");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const errHandler = require("./controller/errConrtoller");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const products = require("./routes/products");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();
const whiteList = [
  "http://localhost:3000",
  "https://web-shop-seven.vercel.app/",
  "web-shop-seven.vercel.app/",
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
app.use(limiter);
app.use(cookieParser());
// body parser
app.use(
  express.urlencoded({
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

app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
  })
);

app.use(express.json());

// static serving
app.use(express.static(path.join(__dirname, "imgs")));
//my routes

app.use("/products", products);
app.use("/users", users);
// not found
app.all("*", (req, res, next) => {
  next(new appError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(errHandler);

module.exports = app;
