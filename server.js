process.on("uncaughtException", (err) => {
  console.log(err);

  process.exit(1);
});
const dotenv = require("dotenv").config({
  path: "./config.env",
});
const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

mongoose.connect(
  `mongodb+srv://taher:${process.env.MONGO_DB_PASSWORD}@cluster0.1iwzt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  () => {
    console.log("connected to data base");
  }
);

const server = app.listen(PORT, () => {
  console.log("started server on port : " + PORT);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
