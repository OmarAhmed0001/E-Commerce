// Package NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const createCommentToProductValidation = [
  param('productId')
    .notEmpty()
    .withMessage({
      en: 'Product id is required',
      ar: 'معرف المنتج مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Product id is not valid',
      ar: 'معرف المنتج غير صالح',
    }),
  body('comment')
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
  validate,
];

export const updateCommentToProductValidation = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Comment id is required',
      ar: 'معرف التعليق مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Comment id is not valid',
      ar: 'معرف التعليق غير صالح',
    }),
  body('comment')
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
  validate,
];
