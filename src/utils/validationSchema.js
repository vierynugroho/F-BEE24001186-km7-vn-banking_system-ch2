import Joi from 'joi';

export const depositSchema = Joi.object({
  amount: Joi.number().min(0).required(),
});

export const withdrawalSchema = Joi.object({
  amount: Joi.number().min(0).required(),
});

export const transferSchema = Joi.object({
  receiverID: Joi.number().required(),
  amount: Joi.number().min(0).required(),
});

export const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
