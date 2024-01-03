// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const addRoleValidation = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'User id is required',
      ar: 'معرف المستخدم مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'User id is not valid',
      ar: 'معرف المستخدم غير صالح',
    }),
  body('role')
    .notEmpty()
    .withMessage({
      en: 'Role is required',
      ar: 'الدور مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Role must be string',
      ar: 'يجب أن يكون الدور سلسلة',
    })
    .trim()
    .isIn(['adminA', 'adminB', 'adminC', 'subAdmin', 'marketer'])
    .withMessage({
      en: 'Role must be adminA, adminB, adminC , subAdmin or marketer',
      ar: 'يجب أن يكون الدور adminA أو adminB أو adminC أو subAdmin أو marketer',
    }),
  validate,
];

export const addAdminValidation = [
  body('name')
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
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage({
      en: 'Name must be between 3 and 50 characters',
      ar: 'يجب أن يكون الاسم بين 3 و 50 حرفًا',
    }),
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
    .trim()
    .isLength({ min: 6, max: 255 })
    .withMessage({
      en: 'Email must be between 6 and 255 characters',
      ar: 'يجب أن يكون البريد الإلكتروني بين 6 و 255 حرفًا',
    }),
  body('phone')
    .notEmpty()
    .withMessage({
      en: 'Phone is required',
      ar: 'الهاتف مطلوب',
    })
    .isMobilePhone('any')
    .withMessage({
      en: 'Phone is not valid',
      ar: 'الهاتف غير صالح',
    }),
  body('password')
    .notEmpty()
    .withMessage({
      en: 'Password is required',
      ar: 'كلمة المرور مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Password must be string',
      ar: 'يجب أن تكون كلمة المرور سلسلة',
    })
    .trim()
    .isLength({ min: 6 }),
  body('role')
    .notEmpty()
    .withMessage({
      en: 'Role is required',
      ar: 'الدور مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Role must be string',
      ar: 'يجب أن يكون الدور سلسلة',
    })
    .trim()
    .isIn(['adminA', 'adminB', 'adminC', 'subAdmin'])
    .withMessage({
      en: 'Role must be adminA, adminB, adminC or subAdmin',
      ar: 'يجب أن يكون الدور adminA أو adminB أو adminC أو subAdmin',
    }),
  validate,
];
