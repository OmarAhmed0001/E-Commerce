// Packages NPM Import
import { body, oneOf } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';
import { User } from '../models/user.model';

export const userRegisterValidation = [
  oneOf(
    [
      [
        body('registrationType')
          .equals('phone')
          .withMessage({
            en: 'invalid registrationType',
            ar: 'نوع التسجيل غير صحيح',
          })
          .notEmpty()
          .withMessage({
            en: 'registrationType is required',
            ar: 'نوع التسجيل مطلوب',
          })
          .isString()
          .withMessage({
            en: 'registrationType must be a string',
            ar: 'نوع التسجيل يجب ان يكون نص',
          }),
        body('phone')
          .notEmpty()
          .withMessage({ en: 'Phone is required', ar: 'رقم الهاتف مطلوب' })
          .isString()
          .withMessage({
            en: 'Phone must be a string',
            ar: 'رقم الهاتف يجب ان يكون نص',
          }),
      ],
      [
        body('registrationType')
          .equals('email')
          .withMessage({
            en: 'invalid registrationType',
            ar: 'نوع التسجيل غير صحيح',
          })
          .notEmpty()
          .withMessage({
            en: 'registrationType is required',
            ar: 'نوع التسجيل مطلوب',
          })
          .isString()
          .withMessage({
            en: 'registrationType must be a string',
            ar: 'نوع التسجيل يجب ان يكون نص',
          }),
        body('email')
          .notEmpty()
          .withMessage({
            en: 'Email is required',
            ar: 'البريد الالكتروني مطلوب',
          })
          .isEmail()
          .withMessage({
            en: 'Email must be a valid email',
            ar: 'البريد الالكتروني يجب ان يكون بريد الكتروني صحيح',
          }),
        body('password')
          .notEmpty()
          .withMessage({ en: 'Password is required', ar: 'كلمة المرور مطلوبة' })
          .isString()
          .withMessage({
            en: 'Password must be a string',
            ar: 'كلمة المرور يجب ان تكون نص',
          }),
      ],
    ],
    {
      message: { en: 'Invalid registration type', ar: 'نوع التسجيل غير صحيح' },
    },
  ),

  body('name').optional(),
  body('image')
    .optional()
    .isString()
    .isLength({ min: 5 })
    .withMessage('Image must be at least 5 characters long'),
  validate,
];

export const userLoginValidation = [
  oneOf(
    [
      [
        body('registrationType')
          .equals('phone')
          .withMessage({
            en: 'invalid registrationType',
            ar: 'نوع التسجيل غير صحيح',
          })
          .isString()
          .withMessage({
            en: 'registrationType must be a string',
            ar: 'نوع التسجيل يجب ان يكون نص',
          }),
        body('phone')
          .notEmpty()
          .withMessage({ en: 'Phone is required', ar: 'رقم الهاتف مطلوب' })
          .isString()
          .withMessage({
            en: 'Phone must be a string',
            ar: 'رقم الهاتف يجب ان يكون نص',
          }),
      ],
      [
        body('registrationType')
          .equals('email')
          .withMessage({
            en: 'indvalid registrationType',
            ar: 'نوع التسجيل غير صحيح',
          })
          .notEmpty()
          .withMessage({
            en: 'registrationType is required',
            ar: 'نوع التسجيل مطلوب',
          })
          .isString()
          .withMessage({
            en: 'registrationType must be a string',
            ar: 'نوع التسجيل يجب ان يكون نص',
          }),
        body('email')
          .notEmpty()
          .withMessage({
            en: 'Email is required',
            ar: 'البريد الالكتروني مطلوب',
          })
          .isEmail()
          .withMessage({
            en: 'Email must be a valid email',
            ar: 'البريد الالكتروني يجب ان يكون بريد الكتروني صحيح',
          }),
        body('password')
          .notEmpty()
          .withMessage({ en: 'Password is required', ar: 'كلمة المرور مطلوبة' })
          .isString()
          .withMessage({
            en: 'Password must be a string',
            ar: 'كلمة المرور يجب ان تكون نص',
          }),
      ],
    ],
    {
      message: { en: 'Invalid registration type', ar: 'نوع التسجيل غير صحيح' },
    },
  ),
  validate,
];

export const userUpdateValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage({
      en: 'Email must be a valid email',
      ar: 'البريد الالكتروني يجب ان يكون بريد الكتروني صحيح',
    })
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      if (user && user._id.toString() !== req.user._id.toString()) {
        return Promise.reject({
          en: 'Email already exists',
          ar: 'البريد الالكتروني موجود بالفعل',
        });
      }
      return true;
    }),

  body('phone')
    .optional()
    .isString()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ phone: value });
      if (user && user._id.toString() !== req.user._id.toString()) {
        return Promise.reject({
          en: 'Phone already exists',
          ar: 'رقم الهاتف موجود بالفعل',
        });
      }
      return true;
    }),
  body('password')
    .optional()
    .isString()
    .withMessage({
      en: 'Password must be a string',
      ar: 'كلمة المرور يجب ان تكون نص',
    })
    .isLength({ min: 6 })
    .withMessage({
      en: 'Password must be at least 6 characters long',
      ar: 'كلمة المرور يجب ان تكون 6 حروف على الاقل',
    }),
  body('name')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Name is required', ar: 'الاسم مطلوب' })
    .isString()
    .withMessage({ en: 'Name must be a string', ar: 'الاسم يجب ان يكون نص' }),
  body('image')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Image is required',
      ar: 'الصورة مطلوبة',
    })
    .isString()
    .withMessage({ en: 'Image must be a string', ar: 'الصورة يجب ان تكون نص' }),
  validate,
];

export const changedPasswordValidation = [
  body('oldPassword')
    .notEmpty()
    .withMessage({
      en: 'Old Password is required',
      ar: 'كلمة المرور القديمة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Old Password must be a string',
      ar: 'كلمة المرور القديمة يجب ان تكون نص',
    })
    .isLength({ min: 6, max: 50 })
    .withMessage({
      en: 'Old Password must be 6 characters',
      ar: 'كلمة المرور القديمة يجب ان تكون 6 خانات',
    })
    .trim(),
  body('newPassword')
    .notEmpty()
    .withMessage({
      en: 'New Password is required',
      ar: 'كلمة المرور الجديدة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'New Password must be a string',
      ar: 'كلمة المرور الجديدة يجب ان تكون نص',
    })
    .isLength({ min: 6, max: 50 })
    .withMessage({
      en: 'New Password must be 6 characters',
      ar: 'كلمة المرور الجديدة يجب ان تكون 6 خانات',
    })
    .trim(),
  validate,
];

export const verifyCodeValidation = [
  body('code')
    .notEmpty()
    .withMessage({ en: 'Code is required', ar: 'الكود مطلوب' })
    .isString()
    .withMessage({ en: 'Code must be a string', ar: 'الكود يجب ان يكون نص' })
    .isLength({ min: 6, max: 6 })
    .withMessage({
      en: 'Code must be 6 characters',
      ar: 'الكود يجب ان يكون 6 خانات',
    })
    .trim(),
  body('phone')
    .notEmpty()
    .withMessage({ en: 'Phone is required', ar: 'رقم الهاتف مطلوب' })
    .isString()
    .withMessage({
      en: 'Phone must be a string',
      ar: 'رقم الهاتف يجب ان يكون نص',
    })
    .trim(),
  validate,
];

export const forgetPasswordValidation = [
  body('username')
    .notEmpty()
    .withMessage({ en: 'Username is required', ar: 'اسم المستخدم مطلوب' })
    .isString()
    .withMessage({
      en: 'Username must be a string',
      ar: 'اسم المستخدم يجب ان يكون نص',
    })
    .trim(),
  validate,
];

export const verifyPasswordResetCodeValidation = [
  body('resetCode')
    .notEmpty()
    .withMessage({ en: 'Reset Code is required', ar: 'كود الاستعادة مطلوب' })
    .isString()
    .withMessage({
      en: 'Reset Code must be a string',
      ar: 'كود الاستعادة يجب ان يكون نص',
    })
    .isLength({ min: 6, max: 6 })
    .withMessage({
      en: 'Reset Code must be 6 characters',
      ar: 'كود الاستعادة يجب ان يكون 6 خانات',
    })
    .trim(),
  validate,
];

export const resetPasswordValidation = [
  body('username')
    .notEmpty()
    .withMessage({ en: 'Username is required', ar: 'اسم المستخدم مطلوب' })
    .isString()
    .withMessage({
      en: 'Username must be a string',
      ar: 'اسم المستخدم يجب ان يكون نص',
    })
    .trim(),
  body('newPassword')
    .notEmpty()
    .withMessage({ en: 'New Password is required', ar: 'كلمة المرور مطلوبة' })
    .isString()
    .withMessage({
      en: 'New Password must be a string',
      ar: 'كلمة المرور يجب ان تكون نص',
    })
    .isLength({ min: 6, max: 50 })
    .trim(),
  validate,
];
