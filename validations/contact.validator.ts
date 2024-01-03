// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const getContactByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Contact id is required',
      ar: 'معرف الاتصال مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Contact id is not valid',
      ar: 'معرف الاتصال غير صالح',
    }),
  validate,
];

export const createContactValidator = [
  body('name')
    .notEmpty()
    .withMessage({
      en: 'Name is required',
      ar: 'الاسم مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name Must be string',
      ar: 'يجب أن يكون الاسم حروف',
    })
    .trim(),
  body('message')
    .notEmpty()
    .withMessage({
      en: 'Message is required',
      ar: 'الرسالة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Message Must be string',
      ar: 'يجب أن تكون الرسالة حروف',
    })
    .trim(),
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
    })
    .trim(),
  body('phone')
    .notEmpty()
    .withMessage({
      en: 'Phone is required',
      ar: 'الهاتف مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Phone Must be string',
      ar: 'يجب أن يكون الهاتف حروف',
    })
    .trim(),
  body('contactType')
    .notEmpty()
    .withMessage({
      en: 'Contact type is required',
      ar: 'نوع الاتصال مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Contact type Must be string',
      ar: 'يجب أن يكون نوع الاتصال حروف',
    })
    .isIn(['complaints', 'suggestions', 'customerService'])
    .withMessage({
      en: 'Contact type is not valid',
      ar: 'نوع الاتصال غير صالح',
    })
    .trim(),
  validate,
];

export const updateContactValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Contact id is required',
      ar: 'معرف الاتصال مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Contact id is not valid',
      ar: 'معرف الاتصال غير صالح',
    }),
  body('name')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Name is required',
      ar: 'الاسم مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name Must be string',
      ar: 'يجب أن يكون الاسم حروف',
    })
    .trim(),
  body('message')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Message is required',
      ar: 'الرسالة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Message Must be string',
      ar: 'يجب أن تكون الرسالة حروف',
    })
    .trim(),
  body('email')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Email is required',
      ar: 'البريد الإلكتروني مطلوب',
    })
    .isEmail()
    .withMessage({
      en: 'Email is not valid',
      ar: 'البريد الإلكتروني غير صالح',
    })
    .trim(),
  body('phone')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Phone is required',
      ar: 'الهاتف مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Phone Must be string',
      ar: 'يجب أن يكون الهاتف حروف',
    })
    .trim(),
  body('contactType')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Contact type is required',
      ar: 'نوع الاتصال مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Contact type Must be string',
      ar: 'يجب أن يكون نوع الاتصال حروف',
    })
    .isIn(['complaints', 'suggestions', 'customerService'])
    .withMessage({
      en: 'Contact type is not valid',
      ar: 'نوع الاتصال غير صالح',
    })
    .trim(),
  validate,
];

export const deleteContactValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Contact id is required',
      ar: 'معرف الاتصال مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Contact id is not valid',
      ar: 'معرف الاتصال غير صالح',
    }),
  validate,
];
