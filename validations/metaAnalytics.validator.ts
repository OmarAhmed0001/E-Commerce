// Packages NPM Import
import { body } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const createMetaAnalyticsValidator = [
  body('key')
    .notEmpty()
    .withMessage({
      en: 'Key is required',
      ar: 'المفتاح مطلوب',
    })
    .custom((value) => {
      if (!['google', 'snap', 'facebook', 'tiktok', 'tag'].includes(value)) {
        return Promise.reject({
          en: 'Key Must be google, snap, facebook, tiktok or tag',
          ar: 'يجب أن يكون المفتاح google أو snap أو facebook أو tiktok أو tag',
        });
      }
      return true;
    })
    .withMessage({
      en: 'Key Must be google, snap, facebook, tiktok or tag',
      ar: 'يجب أن يكون المفتاح google أو snap أو facebook أو tiktok أو tag',
    }),
  body('value')
    .notEmpty()
    .withMessage({
      en: 'Value is required',
      ar: 'القيمة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Value Must be string',
      ar: 'يجب أن تكون القيمة سلسلة',
    })
    .trim(),
  validate,
];
