// Packages NPM Import
import { body } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const createOrderValidation = [
  body('city')
    .notEmpty()
    .withMessage({
      en: 'City is required',
      ar: 'المدينة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'City must be string',
      ar: 'يجب أن تكون المدينة سلسلة',
    })
    .trim(),
  body('phone')
    .notEmpty()
    .withMessage({
      en: 'Phone is required',
      ar: 'رقم الهاتف مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Phone must be string',
      ar: 'يجب أن يكون رقم الهاتف سلسلة',
    })
    .trim(),
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
    .trim(),
  body('area')
    .notEmpty()
    .withMessage({
      en: 'Area is required',
      ar: 'المنطقة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Area must be string',
      ar: 'يجب أن تكون المنطقة سلسلة',
    })
    .trim(),
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
  body('postalCode')
    .notEmpty()
    .withMessage({
      en: 'Postal code is required',
      ar: 'الرمز البريدي مطلوب',
    })
    .isString()
    .withMessage({
      en: "Postal code must be string, if you don't have postal code, please enter 00000",
      ar: 'يجب أن يكون الرمز البريدي سلسلة ، إذا لم يكن لديك رمز بريدي ، فيرجى إدخال 00000',
    })
    .trim(),
  body('orderNotes')
    .optional()
    .isString()
    .withMessage({
      en: 'Order notes must be string',
      ar: 'يجب أن تكون ملاحظات الطلب سلسلة',
    })
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage({
      en: 'Email must be email',
      ar: 'يجب أن يكون البريد الإلكتروني بريدًا إلكترونيًا',
    })
    .trim(),
  validate,
];

export const createOnlineOrderValidation = [
  body('type')
    .notEmpty()
    .withMessage({
      en: 'Type is required',
      ar: 'النوع مطلوب',
    })
    .isIn(['creditcard'])
    .withMessage({
      en: 'Type must be creditcard',
      ar: 'يجب أن يكون النوع بطاقة ائتمان',
    })
    .trim(),
  body('cvc')
    .notEmpty()
    .withMessage({
      en: 'CVC is required',
      ar: 'CVC مطلوب',
    })
    .isString()
    .withMessage({
      en: 'CVC must be string',
      ar: 'يجب أن يكون CVC سلسلة',
    })
    .trim()
    .isLength({ min: 3, max: 3 }),
  body('month')
    .notEmpty()
    .withMessage({
      en: 'Month is required',
      ar: 'الشهر مطلوب',
    })
    .isNumeric()
    .withMessage({
      en: 'Month must be number',
      ar: 'يجب أن يكون الشهر رقمًا',
    })
    .custom((val) => {
      if (val < 1 || val > 12) {
        throw new Error('Month must be between 1 to 12');
      }
      return true;
    }),
  body('year')
    .notEmpty()
    .withMessage({
      en: 'Year is required',
      ar: 'السنة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Year must be string',
      ar: 'يجب أن تكون السنة سلسلة',
    })
    .trim()
    .isLength({ min: 4, max: 4 }),
  body('number')
    .notEmpty()
    .withMessage({
      en: 'Number is required',
      ar: 'الرقم مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Number must be string',
      ar: 'يجب أن يكون الرقم سلسلة',
    })
    .trim()
    .isLength({ min: 16, max: 16 }),
  body('name')
    .notEmpty()
    .withMessage({
      en: 'Name is required',
      ar: 'الاسم مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name must be string',
      ar: 'يجب أن يكو الاسم سلسلة',
    })
    .trim(),
  validate,
];

export const verifyOrderValidation = [
  body('code')
    .notEmpty()
    .withMessage({
      en: 'Code is required',
      ar: 'الكود مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Code must be string',
      ar: 'يجب أن يكون الكود سلسلة',
    })
    .trim()
    .isLength({ min: 6, max: 6 }),
  body('phone')
    .notEmpty()
    .withMessage({
      en: 'Phone is required',
      ar: 'رقم الهاتف مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Phone must be string',
      ar: 'يجب أن يكون رقم الهاتف سلسلة',
    })
    .trim(),
  validate,
];

export const changeOrderStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage({
      en: 'Status is required',
      ar: 'الحالة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Status must be string',
      ar: 'يجب أن تكون الحالة سلسلة',
    })
    .trim()
    .isIn(['in delivery', 'delivered', 'return']),
  validate,
];
