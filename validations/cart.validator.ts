// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const addToCartValidation = [
  param('productId')
    .notEmpty()
    .withMessage({
      en: 'Product id is required',
      ar: 'معرف المنتج مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Product id must be mongo id',
      ar: 'يجب أن يكون معرف المنتج معرف mongo',
    })
    .trim(),
  body('quantity')
    .notEmpty()
    .withMessage({
      en: 'Quantity is required',
      ar: 'الكمية مطلوبة',
    })
    .isNumeric()
    .withMessage({
      en: 'Quantity must be number',
      ar: 'يجب أن تكون الكمية رقم',
    })
    .trim(),
  body('properties')
    .isArray({
      min: 1,
    })
    .withMessage({
      en: 'Properties Must be array',
      ar: 'يجب أن تكون الخصائص مصفوفة',
    }),
  body('properties.*.key_en')
    .notEmpty()
    .withMessage({
      en: 'Key in english is required',
      ar: 'الاسم باللغة الإنجليزية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Key in english Must be string',
      ar: 'يجب أن يكون الاسم باللغة الإنجليزية حروف',
    })
    .trim(),
  body('properties.*.key_ar')
    .notEmpty()
    .withMessage({
      en: 'Key in arabic is required',
      ar: 'الاسم باللغة العربية مطلوب',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' })
    .trim(),
  body('properties.*.value_en')
    .notEmpty()
    .withMessage({
      en: 'Value in english is required',
      ar: 'القيمة باللغة الإنجليزية مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Value in english Must be string',
      ar: 'يجب أن تكون القيمة باللغة الإنجليزية حروف',
    })
    .trim(),
  body('properties.*.value_ar')
    .notEmpty()
    .withMessage({
      en: 'Value in arabic is required',
      ar: 'القيمة باللغة العربية مطلوبة',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن تكون سلسلة' })
    .trim(),
  validate,
];
