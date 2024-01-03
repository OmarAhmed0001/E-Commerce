// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const getRepositoryByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Repository id is required',
      ar: 'معرف المستودع مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Repository id is not valid',
      ar: 'معرف المستودع غير صالح',
    }),
  validate,
];

export const createRepositoryValidation = [
  body('name_en')
    .notEmpty()
    .withMessage({
      en: 'Name is required',
      ar: 'الاسم مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name must be string',
      ar: 'يجب أن يكون الاسم سلسلة',
    })
    .trim(),
  body('name_ar')
    .notEmpty()
    .withMessage({
      en: 'Name is required',
      ar: 'الاسم مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name must be string',
      ar: 'يجب أن يكون الاسم سلسلة',
    })
    .trim(),
  body('products')
    .isArray()
    .withMessage('Products must be an array')
    .notEmpty()
    .withMessage('Products array cannot be empty')
    .custom((value) => {
      // For example, checking if each item in the array has the required properties
      if (!Array.isArray(value)) {
        throw new Error('Products must be an array');
      }

      for (const product of value) {
        if (!product.productId || typeof product.quantity !== 'number') {
          throw new Error('Invalid product structure');
        }
      }

      return true;
    }),
  body('address')
    .notEmpty()
    .withMessage({
      en: 'Address is required',
      ar: 'العنوان مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Address must be string',
      ar: 'يجب أن يكون العنوان سلسلة',
    })
    .trim(),
  validate,
];

export const updateRepositoryValidation = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Repository id is required',
      ar: 'معرف المستودع مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Repository id is not valid',
      ar: 'معرف المستودع غير صالح',
    }),
  body('name_en')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Name is required',
      ar: 'الاسم مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name must be string',
      ar: 'يجب أن يكون الاسم سلسلة',
    })
    .trim(),
  body('name_ar')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Name is required',
      ar: 'الاسم مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name must be string',
      ar: 'يجب أن يكون الاسم سلسلة',
    })
    .trim(),
  body('products')
    .optional()
    .isArray()
    .withMessage('Products must be an array')
    .notEmpty()
    .withMessage('Products array cannot be empty')
    .custom((value) => {
      // For example, checking if each item in the array has the required properties
      if (!Array.isArray(value)) {
        throw new Error('Products must be an array');
      }

      for (const product of value) {
        if (!product.productId || typeof product.quantity !== 'number') {
          throw new Error('Invalid product structure');
        }
      }

      return true;
    }),
  body('address')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Address is required',
      ar: 'العنوان مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Address must be string',
      ar: 'يجب أن يكون العنوان سلسلة',
    })
    .trim(),
  validate,
];

export const deleteRepositoryValidation = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Repository id is required',
      ar: 'معرف المستودع مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Repository id is not valid',
      ar: 'معرف المستودع غير صالح',
    }),
  validate,
];
