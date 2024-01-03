// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';
import { Coupon } from '../models/coupon.model';
import { User } from '../models/user.model';

export const getMarketerByIdValidator = [
  param('id')
    .isMongoId()
    .withMessage({ en: 'ID is not valid', ar: 'المعرف غير صالح' })
    .custom(async (val) => {
      const marketer = await User.findById(val);
      if (!marketer) {
        return Promise.reject({
          en: 'Marketer not found',
          ar: 'المسوق غير موجود',
        });
      }
      return Promise.resolve();
    }),
  validate,
];

export const createMarketerValidator = [
  body('name')
    .notEmpty()
    .withMessage({ en: 'Name is required', ar: 'الاسم مطلوب' })
    .isString()
    .withMessage({ en: 'Name must be a string', ar: 'الاسم يجب ان يكون نص' })
    .trim(),
  body('email')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Email is required', ar: 'البريد الالكتروني مطلوب' })
    .isEmail()
    .withMessage({ en: 'Email is not valid', ar: 'البريد الالكتروني غير صالح' })
    .trim()
    .custom(async (val) => {
      const marketer = await User.findOne({ email: val });
      if (marketer) {
        return Promise.reject({
          en: 'Email already used',
          ar: 'البريد الالكتروني مستخدم بالفعل',
        });
      }
      return Promise.resolve();
    }),
  body('phone')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Phone is required', ar: 'رقم الهاتف مطلوب' })
    .isString()
    .withMessage({
      en: 'Phone must be a string',
      ar: 'رقم الهاتف يجب ان يكون نص',
    })
    .trim()
    .custom(async (val) => {
      const marketer = await User.findOne({ phone: val });
      if (marketer) {
        return Promise.reject({
          en: 'Phone already used',
          ar: 'رقم الهاتف مستخدم بالفعل',
        });
      }
      return Promise.resolve();
    }),
  body('password')
    .notEmpty()
    .withMessage({ en: 'Password is required', ar: 'كلمة المرور مطلوبة' })
    .isString()
    .withMessage({
      en: 'Password must be a string',
      ar: 'كلمة المرور يجب ان تكون نص',
    })
    .trim(),
  body('code')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Code is required', ar: 'الكود مطلوب' })
    .isString()
    .withMessage({ en: 'Code must be a string', ar: 'الكود يجب ان يكون نص' })
    .trim()
    .custom(async (val) => {
      const marketer = await Coupon.findOne({ code: val });
      if (marketer) {
        return Promise.reject({
          en: 'Code already used',
          ar: 'الكود مستخدم بالفعل',
        });
      }
      return Promise.resolve();
    }),
  body('discount')
    .notEmpty()
    .withMessage({ en: 'Discount is required', ar: 'الخصم مطلوب' })
    .isNumeric()
    .withMessage({
      en: 'Discount must be a number',
      ar: 'الخصم يجب ان يكون رقم',
    })
    .trim(),
  body('commissionMarketer')
    .notEmpty()
    .isNumeric()
    .withMessage({
      en: 'Commission marketer must be a number',
      ar: 'عمولة المسوق يجب ان تكون رقم',
    })
    .trim(),
  body('discountDepartment.key')
    .notEmpty()
    .withMessage({
      en: 'Discount Department Key is required',
      ar: 'مفتاح قسم الخصم مطلوب',
    })
    .custom((key) =>
      ['allProducts', 'products', 'categories', 'subcategories'].includes(key),
    )
    .withMessage({
      en: 'Discount Department Key must be one of allProducts, products, categories, subcategories',
      ar: 'مفتاح قسم الخصم يجب ان يكون واحد من allProducts, products, categories, subcategories',
    }),
  body('discountDepartment.value')
    .notEmpty()
    .withMessage('Discount Department Value is required')
    .custom((value, { req }) => {
      const key = req.body.discountDepartment.key;
      if (['products', 'categories', 'subcategories'].includes(key)) {
        return Array.isArray(value) && value.length >= 1;
      }
      return Array.isArray(value);
    })
    .withMessage({
      en: 'Discount Department Value must be an array of strings',
      ar: 'قيمة قسم الخصم يجب ان تكون مصفوفة من النصوص',
    }),
  body('url')
    .notEmpty()
    .withMessage({ en: 'URL is required', ar: 'الرابط مطلوب' })
    .isString()
    .withMessage({ en: 'URL must be a string', ar: 'الرابط يجب ان يكون نص' })
    .trim(),
  validate,
];

export const updateMarketerValidator = [
  param('id')
    .isMongoId()
    .withMessage({ en: 'ID is not valid', ar: 'المعرف غير صالح' })
    .custom(async (val) => {
      const marketer = await User.findById(val);
      if (!marketer) {
        return Promise.reject({
          en: 'Marketer not found',
          ar: 'المسوق غير موجود',
        });
      }
      return Promise.resolve();
    }),
  body('name')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Name is required', ar: 'الاسم مطلوب' })
    .isString()
    .withMessage({ en: 'Name must be a string', ar: 'الاسم يجب ان يكون نص' })
    .trim(),
  body('email')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Email is required', ar: 'البريد الالكتروني مطلوب' })
    .isEmail()
    .withMessage({ en: 'Email is not valid', ar: 'البريد الالكتروني غير صالح' })
    .trim(),
  body('phone')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Phone is required', ar: 'رقم الهاتف مطلوب' })
    .isString()
    .withMessage({
      en: 'Phone must be a string',
      ar: 'رقم الهاتف يجب ان يكون نص',
    })
    .trim(),
  body('password')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Password is required', ar: 'كلمة المرور مطلوبة' })
    .isString()
    .withMessage({
      en: 'Password must be a string',
      ar: 'كلمة المرور يجب ان تكون نص',
    })
    .trim(),

  // # start Code
  body('code')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Code is required', ar: 'الكود مطلوب' })
    .isString()
    .withMessage({ en: 'Code must be a string', ar: 'الكود يجب ان يكون نص' })
    .trim(),
  // # end Code

  // # start Discount
  body('discount')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Discount is required', ar: 'الخصم مطلوب' })
    .isNumeric()
    .withMessage({
      en: 'Discount must be a number',
      ar: 'الخصم يجب ان يكون رقم',
    })
    .trim(),
  // # end Discount

  // # start Commission Marketer
  body('commissionMarketer')
    .optional()
    .notEmpty()
    .isNumeric()
    .withMessage({
      en: 'Commission marketer must be a number',
      ar: 'عمولة المسوق يجب ان تكون رقم',
    })
    .trim(),
  // # end Commission Marketer

  // # start Discount Department
  body('discountDepartment.key')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Discount Department Key is required',
      ar: 'مفتاح قسم الخصم مطلوب',
    })
    .custom((key) =>
      ['allProducts', 'products', 'categories', 'subcategories'].includes(key),
    )
    .withMessage({
      en: 'Discount Department Key must be one of allProducts, products, categories, subcategories',
      ar: 'مفتاح قسم الخصم يجب ان يكون واحد من allProducts, products, categories, subcategories',
    }),
  // # end Discount Department

  // # start Discount Department Value
  body('discountDepartment.value')
    .optional()
    .notEmpty()
    .withMessage('Discount Department Value is required')
    .custom((value, { req }) => {
      const key = req.body.discountDepartment.key;
      if (['products', 'categories', 'subcategories'].includes(key)) {
        return Array.isArray(value) && value.length >= 1;
      }
      return Array.isArray(value);
    })
    .withMessage({
      en: 'Discount Department Value must be an array of strings',
      ar: 'قيمة قسم الخصم يجب ان تكون مصفوفة من النصوص',
    }),
  // # end Discount Department Value

  // # start URL
  body('url')
    .notEmpty()
    .withMessage({ en: 'URL is required', ar: 'الرابط مطلوب' })
    .isString()
    .withMessage({ en: 'URL must be a string', ar: 'الرابط يجب ان يكون نص' })
    .trim(),
  // # end URL
  validate,
];

export const deleteMarketerValidator = [
  param('id')
    .isMongoId()
    .withMessage({
      en: 'Marketer id is not valid',
      ar: 'معرف المسوق غير صالح',
    })
    .custom(async (val) => {
      const marketer = await User.findById(val);
      if (!marketer) {
        return Promise.reject({
          en: 'Marketer not found',
          ar: 'المسوق غير موجود',
        });
      }
      return Promise.resolve();
    }),
  validate,
];
