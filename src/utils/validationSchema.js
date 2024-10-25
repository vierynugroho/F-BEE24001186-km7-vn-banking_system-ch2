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
  userID: Joi.number().required(),
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

export const deleteAccountSchema = Joi.object({
  accountID: Joi.number().min(1).required(),
  bankAccountNumber: Joi.string().min(1).required(),
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
