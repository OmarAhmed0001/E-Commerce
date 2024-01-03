// Packages NPM Import
import { body } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const sendNewsViaSMSValidator = [
  body('phone')
    .notEmpty()
    .withMessage({
      en: 'phone is required',
      ar: 'phone مطلوب',
    })
    .isArray()
    .withMessage({
      en: 'phone Must be array',
      ar: 'يجب أن يكون phone مصفوفة',
    }),
  body('phone.*').isMobilePhone('any').withMessage({
    en: 'phone Must be valid phone number',
    ar: 'يجب أن يكون phone رقم هاتف صحيح',
  }),
  body('message')
    .notEmpty()
    .withMessage({
      en: 'message is required',
      ar: 'message مطلوب',
    })
    .isString()
    .withMessage({
      en: 'message Must be string',
      ar: 'يجب أن يكون message حروف',
    }),
  validate,
];

export const sendNewsViaEmailValidator = [
  body('email')
    .notEmpty()
    .withMessage({
      en: 'email is required',
      ar: 'email مطلوب',
    })
    .isArray()
    .withMessage({
      en: 'email Must be array',
      ar: 'يجب أن يكون email مصفوفة',
    }),
  body('email.*').isEmail().withMessage({
    en: 'email Must be valid email',
    ar: 'يجب أن يكون email بريد إلكتروني صحيح',
  }),
  body('message')
    .notEmpty()
    .withMessage({
      en: 'message is required',
      ar: 'message مطلوب',
    })
    .isString()
    .withMessage({
      en: 'message Must be string',
      ar: 'يجب أن يكون message حروف',
    }),
  body('subject')
    .notEmpty()
    .withMessage({
      en: 'subject is required',
      ar: 'subject مطلوب',
    })
    .isString()
    .withMessage({
      en: 'subject Must be string',
      ar: 'يجب أن يكون subject حروف',
    }),
  body('subSubject')
    .notEmpty()
    .withMessage({
      en: 'subSubject is required',
      ar: 'subSubject مطلوب',
    })
    .isString()
    .withMessage({
      en: 'subSubject Must be string',
      ar: 'يجب أن يكون subSubject حروف',
    }),
  validate,
];
