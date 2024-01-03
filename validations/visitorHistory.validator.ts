// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const createVisitorHistoryValidator = [
  body('count')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'count is required',
      ar: 'count مطلوب',
    })
    .isNumeric()
    .withMessage({
      en: 'count Must be number',
      ar: 'يجب أن يكون count رقم',
    }),
  body('country')
    .notEmpty()
    .withMessage({
      en: 'country is required',
      ar: 'country مطلوب',
    })
    .isString()
    .withMessage({
      en: 'country Must be string',
      ar: 'يجب أن يكون country حروف',
    }),
  body('ip')
    .isArray()
    .withMessage({
      en: 'ip Must be array',
      ar: 'يجب أن يكون ip مصفوفة',
    })
    .notEmpty()
    .withMessage({
      en: 'ip is required',
      ar: 'ip مطلوب',
    })
    .custom((value) => {
      // For example, checking if each item in the array has the required properties
      if (!Array.isArray(value)) {
        return Promise.reject({
          en: 'Products must be an array',
          ar: 'يجب أن تكون المنتجات مصفوفة',
        });
      }

      if (value.length === 0) {
        return Promise.reject({
          en: 'Products must not be empty',
          ar: 'يجب ألا تكون المنتجات فارغة',
        });
      }
      for (const ip of value) {
        if (typeof ip !== 'string') {
          return Promise.reject({
            en: 'Invalid ip structure',
            ar: 'هيكل ip غير صالح',
          });
        }
      }
    }),
  validate,
];

export const updateVisitorHistoryValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'id is required',
      ar: 'id مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'id must be mongo id',
      ar: 'يجب أن يكون id معرف mongo',
    }),
  body('count')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'count is required',
      ar: 'count مطلوب',
    })
    .isNumeric()
    .withMessage({
      en: 'count Must be number',
      ar: 'يجب أن يكون count رقم',
    }),
  body('country')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'country is required',
      ar: 'country مطلوب',
    })
    .isString()
    .withMessage({
      en: 'country Must be string',
      ar: 'يجب أن يكون country حروف',
    }),
  body('ip')
    .isArray()
    .withMessage({
      en: 'ip Must be array',
      ar: 'يجب أن يكون ip مصفوفة',
    })
    .notEmpty()
    .withMessage({
      en: 'ip is required',
      ar: 'ip مطلوب',
    })
    .custom((value) => {
      // For example, checking if each item in the array has the required properties
      if (!Array.isArray(value)) {
        return Promise.reject({
          en: 'Products must be an array',
          ar: 'يجب أن تكون المنتجات مصفوفة',
        });
      }

      if (value.length === 0) {
        return Promise.reject({
          en: 'Products must not be empty',
          ar: 'يجب ألا تكون المنتجات فارغة',
        });
      }
      for (const ip of value) {
        if (typeof ip !== 'string') {
          return Promise.reject({
            en: 'Invalid ip structure',
            ar: 'هيكل ip غير صالح',
          });
        }
      }
    }),
  validate,
];
