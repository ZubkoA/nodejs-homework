const Joi = require("joi");

const subscriptionEnum = ["starter", "pro", "business"];

const registerSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  subscription: Joi.string().validate(...subscriptionEnum),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
