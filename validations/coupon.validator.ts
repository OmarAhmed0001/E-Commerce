// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const getCouponByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Coupon id is required',
      ar: 'معرف الكوبون مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Coupon id is not valid',
      ar: 'معرف الكوبون غير صالح',
    }),
  validate,
];

export const createCouponValidator = [
  body('title')
    .notEmpty()
    .withMessage({ en: 'Title is required', ar: 'العنوان مطلوب' })
    .isString()
    .withMessage({ en: 'Title must be a string', ar: 'العنوان يجب ان يكون نص' })
    .trim(),
  body('code')
    .notEmpty()
    .withMessage({ en: 'Code is required', ar: 'الكود مطلوب' })
    .isString()
    .withMessage({ en: 'Code must be a string', ar: 'الكود يجب ان يكون نص' })
    .trim(),
  body('limit')
    .notEmpty()
    .withMessage({ en: 'Limit is required', ar: 'الحد مطلوب' })
    .isNumeric()
    .withMessage({ en: 'Limit must be a number', ar: 'الحد يجب ان يكون رقم' })
    .trim(),
  body('discount')
    .notEmpty()
    .withMessage({ en: 'Discount is required', ar: 'الخصم مطلوب' })
    .isNumeric()
    .withMessage({
      en: 'Discount must be a number',
      ar: 'الخصم يجب ان يكون رقم',
    })
    .custom((value) => {
      if (!(value >= 1 && value < 100)) {
        return Promise.reject({
          en: 'Discount must be a positive number less than 100',
          ar: 'الخصم يجب ان يكون رقم موجب اقل من 100',
        });
      }
      return true;
    }),
  body('startDate')
    .isISO8601()
    .withMessage({
      en: 'Start Date Must be Date',
      ar: 'تاريخ البداية يجب ان يكون تاريخ',
    })
    .notEmpty()
    .withMessage({ en: 'Start Date is required', ar: 'تاريخ البداية مطلوب' }),
  body('endDate')
    .isISO8601()
    .withMessage({
      en: 'End Date Must be Date',
      ar: 'تاريخ النهاية يجب ان يكون تاريخ',
    })
    .notEmpty()
    .withMessage({ en: 'End Date is required', ar: 'تاريخ النهاية مطلوب' })
    .custom((endDate, { req }) => {
      const startDateValue = new Date(req.body.startDate);
      const endDateValue = new Date(endDate);
      const minimumDifferenceInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      console.log(
        `${endDateValue.getTime()}       
        ${startDateValue.getTime() + minimumDifferenceInMs}`,
      );
      return (
        endDateValue.getTime() >=
        startDateValue.getTime() + minimumDifferenceInMs
      );
    })
    .withMessage({
      en: 'End Date must be greater than Start Date by at least 24 hours',
      ar: 'تاريخ النهاية يجب ان يكون اكبر من تاريخ البداية بـ 24 ساعة على الاقل',
    }),
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
  validate,
];

export const updateCouponValidator = [
  param('id')
    .notEmpty()
    .withMessage({ en: 'Coupon id is required', ar: 'معرف الكوبون مطلوب' })
    .isMongoId()
    .withMessage({ en: 'Coupon id is not valid', ar: 'معرف الكوبون غير صالح' }),
  body('title')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Title is required', ar: 'العنوان مطلوب' })
    .isString()
    .withMessage({ en: 'Title must be a string', ar: 'العنوان يجب ان يكون نص' })
    .trim(),
  body('code')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Code is required', ar: 'الكود مطلوب' })
    .isString()
    .withMessage({ en: 'Code must be a string', ar: 'الكود يجب ان يكون نص' })
    .trim(),
  body('limit')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Limit is required', ar: 'الحد مطلوب' })
    .isNumeric()
    .withMessage({ en: 'Limit must be a number', ar: 'الحد يجب ان يكون رقم' })
    .trim(),
  body('discount')
    .optional()
    .notEmpty()
    .withMessage({ en: 'Discount is required', ar: 'الخصم مطلوب' })
    .isNumeric()
    .withMessage({
      en: 'Discount must be a number',
      ar: 'الخصم يجب ان يكون رقم',
    })
    .custom((value) => {
      if (!(value >= 1 && value < 100)) {
        return Promise.reject({
          en: 'Discount must be a positive number less than 100',
          ar: 'الخصم يجب ان يكون رقم موجب اقل من 100',
        });
      }
      return true;
    }),
  body('startDate')
    .isISO8601()
    .withMessage({
      en: 'Start Date Must be Date',
      ar: 'تاريخ البداية يجب ان يكون تاريخ',
    })
    .notEmpty()
    .withMessage({ en: 'Start Date is required', ar: 'تاريخ البداية مطلوب' }),
  body('endDate')
    .isISO8601()
    .withMessage({
      en: 'End Date Must be Date',
      ar: 'تاريخ النهاية يجب ان يكون تاريخ',
    })
    .notEmpty()
    .withMessage({ en: 'End Date is required', ar: 'تاريخ النهاية مطلوب' })
    .custom((endDate, { req }) => {
      const startDateValue = new Date(req.body.startDate);
      const endDateValue = new Date(endDate);
      const minimumDifferenceInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      console.log(
        `${endDateValue.getTime()}       
        ${startDateValue.getTime() + minimumDifferenceInMs}`,
      );
      return (
        endDateValue.getTime() >=
        startDateValue.getTime() + minimumDifferenceInMs
      );
    })
    .withMessage({
      en: 'End Date must be greater than Start Date by at least 24 hours',
      ar: 'تاريخ النهاية يجب ان يكون اكبر من تاريخ البداية بـ 24 ساعة على الاقل',
    }),
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
  validate,
];

export const deleteCouponByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Coupon id is required',
      ar: 'معرف الكوبون مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Coupon id is not valid',
      ar: 'معرف الكوبون غير صالح',
    }),
  validate,
];
