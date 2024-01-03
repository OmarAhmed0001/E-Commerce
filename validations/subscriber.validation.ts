// Packages NPM Import
import { body } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const createSubscriberValidator = [
  body('email')
    .notEmpty()
    .withMessage({
      en: 'Email is required',
      ar: 'البريد الإلكتروني مطلوب',
    })
    .isEmail()
    .withMessage({
      en: 'Email is not valid',
      ar: 'البريد الإلكتروني غير صالح',
    }),
  validate,
];
