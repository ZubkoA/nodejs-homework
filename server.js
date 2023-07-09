const mongoose = require("mongoose");
const app = require("./app");

const DB_HOST =
  "mongodb+srv://Alla:eWWF2Hr20op5ZiVS@cluster0.yrouw49.mongodb.net/db-contacts?retryWrites=true&w=majority";

mongoose.set("strictQuery", true);
mongoose
  .connect(DB_HOST)
  .then(() => app.listen(3000))
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });
