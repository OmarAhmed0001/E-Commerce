// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const getAttributeByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Attribute id is required',
      ar: 'معرف السمة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Attribute id is not valid',
      ar: 'معرف السمة غير صالح',
    }),
  validate,
];

export const createAttributeValidator = [
  body('key_en')
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
  body('key_ar')
    .notEmpty()
    .withMessage({
      en: 'Key in arabic is required',
      ar: 'الاسم باللغة العربية مطلوب',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' })
    .trim(),
  body('values')
    .isArray()
    .withMessage({
      en: 'Values Must be array',
      ar: 'يجب أن تكون القيم مصفوفة',
    })
    .custom((value) => {
      if (Array.isArray(value) && value.length >= 1) {
        return true;
      }
      return Promise.reject({
        en: 'Values Must be array and have at least one value',
        ar: 'يجب أن تكون القيم مصفوفة ويجب أن تحتوي على قيمة واحدة على الأقل',
      });
    }),
  body('values.*.value_ar')
    .notEmpty()
    .withMessage({
      en: 'Value in arabic is required',
      ar: 'القيمة باللغة العربية مطلوبة',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  body('values.*.value_en')
    .notEmpty()
    .withMessage({
      en: 'Value in english is required',
      ar: 'القيمة باللغة الإنجليزية مطلوبة',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  validate,
];

export const updateAttributeValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Attribute id is required',
      ar: 'معرف السمة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Attribute id is not valid',
      ar: 'معرف السمة غير صالح',
    }),
  body('key_en')
    .optional()
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
  body('key_ar')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Key in arabic is required',
      ar: 'الاسم باللغة العربية مطلوب',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' })
    .trim(),
  body('values')
    .optional()
    .isArray()
    .withMessage({
      en: 'Values Must be array',
      ar: 'يجب أن تكون القيم مصفوفة',
    })
    .custom((value) => {
      if (Array.isArray(value) && value.length >= 1) {
        return true;
      }
      return Promise.reject({
        en: 'Values Must be array and have at least one value',
        ar: 'يجب أن تكون القيم مصفوفة ويجب أن تحتوي على قيمة واحدة على الأقل',
      });
    }),
  body('values.*.value_ar')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Value in arabic is required',
      ar: 'القيمة باللغة العربية مطلوبة',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  body('values.*.value_en')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Value in english is required',
      ar: 'القيمة باللغة الإنجليزية مطلوبة',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  validate,
];

export const deleteAttributeValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Attribute id is required',
      ar: 'معرف السمة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Attribute id is not valid',
      ar: 'معرف السمة غير صالح',
    }),
  validate,
];
