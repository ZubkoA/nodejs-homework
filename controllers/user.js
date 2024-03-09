const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
const { Types } = require("mongoose");
const { User } = require("../models");

const { HttpError, sendEmail } = require("../helper");

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  try {
    const { id } = req.params;
    const idIsValid = Types.ObjecId.isValid(id); //check if ID valid
    if (!idIsValid) {
      throw HttpError(404, "User doesn't exist");
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    //метод findOne нам поверне весь обєкт юзера, якщо вивести в консоль.
    // можна використовувати метод exists, який працює так само, але поверне тільки айді

    if (user) {
      throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target='_blank' href="${BASE_URL}/api/users/verify/${verificationToken}">Click verify email<a/>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({ email: newUser.email });
  } catch (error) {}
};

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw HttpError(404, "User not found");
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });
    res.json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email not found");
    }

    if (user.verify) {
      throw HttpError(401, "Email is already verified");
    }

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target='_blank' href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verify email<a/>`,
    };

    await sendEmail(verifyEmail);

    res.json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    if (!user.verify) {
      throw HttpError(401, "Email is not verified");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

    await User.findByIdAndUpdate(user._id, { token });
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.json({
      email,
      subscription,
    });
  } catch {
    next(HttpError(401));
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).json({ message: "No Content" });
  } catch {
    next(HttpError(401));
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { path: tempUpload, originalname } = req.file;
    const { _id } = req.user;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, filename);

    // await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("public", "avatars", filename);

    Jimp.read(tempUpload, (err, avatar) => {
      if (err) throw err;
      avatar.resize(256, 256).write(resultUpload);
      next();
    });

    await User.findByIdAndUpdate(_id, { avatarURL });
    res.json({ avatarURL });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateAvatar,
  verifyEmail,
  resendVerifyEmail,
};
