// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const createReviewToProductValidator = [
  body('comment')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Comment is required',
      ar: 'التعليق مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Comment Must be string',
      ar: 'يجب أن يكون التعليق حروف',
    })
    .trim(),
  body('rating')
    .notEmpty()
    .withMessage({
      en: 'Rating is required',
      ar: 'التقييم مطلوب',
    })
    .isNumeric()
    .withMessage({
      en: 'Rating Must be number',
      ar: 'يجب أن يكون التقييم رقم',
    })
    .custom((value) => {
      if (value >= 1 && value <= 5) {
        return true;
      }
      return Promise.reject({
        en: 'Rating Must be between 1 and 5',
        ar: 'يجب أن يكون التقييم بين 1 و 5',
      });
    }),
  validate,
];

export const updateReviewToProductValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Review id is required',
      ar: 'معرف التعليق مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Review id is not valid',
      ar: 'معرف التعليق غير صالح',
    }),
  body('comment')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Comment is required',
      ar: 'التعليق مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Comment Must be string',
      ar: 'يجب أن يكون التعليق حروف',
    })
    .trim(),
  body('rating')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Rating is required',
      ar: 'التقييم مطلوب',
    })
    .isNumeric()
    .withMessage({
      en: 'Rating Must be number',
      ar: 'يجب أن يكون التقييم رقم',
    })
    .custom((value) => {
      if (value >= 1 && value <= 5) {
        return true;
      }
      return Promise.reject({
        en: 'Rating Must be between 1 and 5',
        ar: 'يجب أن يكون التقييم بين 1 و 5',
      });
    }),
  validate,
];
