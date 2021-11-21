const appError = require("../utils/appError");

const handleValdiationErr = (err) => {
  return new appError(err.message, 400);
};

const handleCastErr = (err) => {
  const message = `invalide ${err.path}: ${err.value}`;
  return new appError(message, 400);
};

const handleDuplicateErr = (err) => {
  const value = Object.keys(err.keyValue)[0];
  const message = ` ${value} already exists`;
  return new appError(message, 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    err,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const hendleJWTerr = () => new appError("please login again", 401);

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.json({
      message: "something wrong, please try later",
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "dev") {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === "prod") {
    let error = { ...err };
    if (error.name === "CastError") error = handleCastErr(error);
    if (error.code === 11000) error = handleDuplicateErr(error);
    if (err.message.match("validation failed"))
      error = handleValdiationErr(err);
    if (err.name === "JsonWebTokenError") error = hendleJWTerr();
    if (err.name === "TokenExpiredError") error = hendleJWTerr();
    sendErrProd(error, res);
  }
};
