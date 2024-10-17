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
  email: Joi.string()
    .email({
      tlds: {
        allow: ['com', 'net', 'id'],
      },
    })
    .required()
    .messages({
      'string.email':
        'must be a valid email & domain allowed: .com | .net | .id',
    }),
  password: Joi.string().min(8).required(),
  identity_type: Joi.string().valid('GIRO', 'SAVING').required(),
  identity_number: Joi.string().min(8).required(),
  address: Joi.string().min(1).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({
      tlds: {
        allow: ['com', 'net', 'id'],
      },
    })
    .required()
    .messages({
      'string.email':
        'must be a valid email & domain allowed: .com | .net | .id',
    }),
  password: Joi.string().min(8).required(),
});
