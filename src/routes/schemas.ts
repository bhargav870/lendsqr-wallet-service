import Joi from 'joi';

export const createUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(100).required(),
  lastName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone: Joi.string().trim().pattern(/^\+?[0-9]{10,15}$/).optional(),
  bvn: Joi.string().trim().pattern(/^[0-9]{11}$/).optional()
});

export const moneySchema = Joi.object({
  amount: Joi.number().precision(2).positive().required(),
  description: Joi.string().trim().max(255).optional()
});

export const transferSchema = Joi.object({
  receiverUserId: Joi.string().trim().required(),
  amount: Joi.number().precision(2).positive().required(),
  description: Joi.string().trim().max(255).optional()
});
