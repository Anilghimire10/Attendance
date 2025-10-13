const Joi = require("joi");

const registerSchema = Joi.object({
  userName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "user").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  deviceToken: Joi.string().optional(),
});

const createUserSchema = Joi.object({
  userName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("admin", "user").optional(),
  designation: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createUserSchema,
};
