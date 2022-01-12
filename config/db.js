const config = require("config");
const mongoose = require("mongoose");

const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db);

    console.log("Connected to mongoDB");
  } catch (error) {
    console.log(error);

    //To terminate the process
    process.exit();
  }
};

module.exports = connectDB;
