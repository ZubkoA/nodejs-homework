const { Schema, model } = require("mongoose");

const { handleMongooseError } = require("../helper");

const subscriptionEnum = ["starter", "pro", "business"];

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
      //select: false - ТОДІ ПАСПОРТ НЕ БУДЕ НАМ ПОВЕРТАТИСЬ В ОБЄК КОРИСТУВАЧА
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: subscriptionEnum,
      default: "starter",
    },
    token: String,
    avatarURL: String,
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false, timestamps: true } //versionKey: false is __v in our baza
);

userSchema.post("save", handleMongooseError);

const User = model("user", userSchema);

module.exports = User;
