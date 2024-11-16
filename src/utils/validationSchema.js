import Joi from 'joi';

// users & profile
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
  identity_type: Joi.string()
    .valid('KTP', 'KTM', 'SIM', 'PASSPORT', 'NPWP', 'OTHERS')
    .required(),
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

// bank accounts
export const registerAccountSchema = Joi.object({
  bank_name: Joi.string()
    .valid(
      'BRI',
      'BCA',
      'MANDIRI',
      'BNI',
      'BSI',
      'CIMB',
      'PERMATA',
      'DANAMON',
      'OTHERS',
    )
    .required()
    .messages({
      'string.any':
        'must be a valid bank name & bank name allowed: BRI | BCA | MANDIRI | BNI | BSI | CIMB | PERMATA | DANAMON | OTHERS',
    }),
  bank_account_number: Joi.string().required(),
  balance: Joi.number().min(0).required(),
});

// transactions
export const transferSchema = Joi.object({
  senderID: Joi.number().min(1).required(),
  receiverID: Joi.number().min(1).required(),
  amount: Joi.number().min(1).required(),
});

export const depositSchema = Joi.object({
  amount: Joi.number().min(0).required(),
});

export const withdrawalSchema = Joi.object({
  amount: Joi.number().min(1).required(),
});

// profiles update
export const profileUpdateSchema = Joi.object({
  name: Joi.string()
    .valid('KTP', 'KTM', 'SIM', 'PASSPORT', 'NPWP', 'OTHERS')
    .required(),
  description: Joi.string().optional().allow(null),
});

// verify
export const verifySchema = Joi.object({
  otp: Joi.string().min(6).required(),
});

export const sendResetSchema = Joi.object({
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
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password does not match password',
  }),
});
