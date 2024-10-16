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
