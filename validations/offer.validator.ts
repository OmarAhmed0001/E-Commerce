// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';
import { Offer } from '../models/offer.model';

export const getOfferByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Offer id is required',
      ar: 'معرف العرض مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Offer id is not valid',
      ar: 'معرف العرض غير صالح',
    }),
  validate,
];

export const createOfferValidation = [
  body('title')
    .notEmpty()
    .withMessage({
      en: 'Title is required',
      ar: 'العنوان مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Title Must be string',
      ar: 'يجب أن يكون العنوان حروف',
    })
    .trim()
    .custom(async (value) => {
      const offer = await Offer.findOne({ title: value });
      if (offer) {
        return Promise.reject({
          en: 'this offer already exist',
          ar: 'هذا العرض موجود بالفعل',
        });
      }
    }),
  body('percentage')
    .notEmpty()
    .withMessage({
      en: 'Percentage is required',
      ar: 'النسبة مطلوبة',
    })
    .isNumeric()
    .withMessage({
      en: 'Percentage Must be number',
      ar: 'يجب أن تكون النسبة رقم',
    })
    .custom((value) => {
      if (value >= 1 && value < 100) {
        return true;
      }
      return Promise.reject({
        en: 'Percentage Must be between 1 and 100',
        ar: 'يجب أن تكون النسبة بين 1 و 100',
      });
    }),
  body('startDate')
    .notEmpty()
    .withMessage({
      en: 'Start Date is required',
      ar: 'تاريخ البدء مطلوب',
    })
    .isDate()
    .withMessage({
      en: 'Start Date Must be date',
      ar: 'يجب أن يكون تاريخ البدء تاريخ',
    }),
  body('endDate')
    .notEmpty()
    .withMessage({
      en: 'End Date is required',
      ar: 'تاريخ الانتهاء مطلوب',
    })
    .isDate()
    .withMessage({
      en: 'End Date Must be date',
      ar: 'يجب أن يكون تاريخ الانتهاء تاريخ',
    })
    .custom((endDate, { req }) => {
      const startDateValue = new Date(req.body.startDate);
      const endDateValue = new Date(endDate);
      const minimumDifferenceInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      return (
        endDateValue.getTime() >=
        startDateValue.getTime() + minimumDifferenceInMs
      );
    })
    .withMessage({
      en: 'End Date must be greater than Start Date by at least 24 hours',
      ar: 'يجب أن يكون تاريخ الانتهاء أكبر من تاريخ البدء بـ 24 ساعة على الأقل',
    }),
  body('typeOfBanner')
    .notEmpty()
    .withMessage({
      en: 'Type Of Banner is required',
      ar: 'نوع البانر مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Type Of Banner Must be string',
      ar: 'يجب أن يكون نوع البانر سلسلة',
    })
    .custom((value) => {
      if (value !== 'vertical' && value !== 'horizontal') {
        return Promise.reject({
          en: 'Type Of Banner Must be vertical or horizontal',
          ar: 'يجب أن يكون نوع البانر عمودي أو أفقي',
        });
      }
      return true;
    }),
  body('imageOfBanner')
    .notEmpty()
    .withMessage({
      en: 'Image Of Banner is required',
      ar: 'صورة البانر مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Image Of Banner Must be string',
      ar: 'يجب أن تكون صورة البانر سلسلة',
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
  validate,
];

export const updateOfferValidation = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Offer id is required',
      ar: 'معرف العرض مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Offer id is not valid',
      ar: 'معرف العرض غير صالح',
    })
    .custom(async (value, { req }) => {
      const offer = await Offer.findById({ _id: req.params?.id });
      console.log(
        '🚀 ~ file: offer.validator.ts ~ line 262 ~ .custom ~ offer',
        offer,
      );

      if (!offer) {
        return Promise.reject({
          en: 'Offer not found',
          ar: 'العرض غير موجود',
        });
      }
    }),
  body('title')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Title is required',
      ar: 'العنوان مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Title Must be string',
      ar: 'يجب أن يكون العنوان حروف',
    })
    .trim(),
  body('percentage')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Percentage is required',
      ar: 'النسبة مطلوبة',
    })
    .isNumeric()
    .withMessage({
      en: 'Percentage Must be number',
      ar: 'يجب أن تكون النسبة رقم',
    })
    .custom((value) => {
      if (value >= 1 && value < 100) {
        return true;
      }
      return Promise.reject({
        en: 'Percentage Must be between 1 and 100',
        ar: 'يجب أن تكون النسبة بين 1 و 100',
      });
    }),
  body('startDate')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Start Date is required',
      ar: 'تاريخ البدء مطلوب',
    })
    .isDate()
    .withMessage({
      en: 'Start Date Must be date',
      ar: 'يجب أن يكون تاريخ البدء تاريخ',
    }),
  body('endDate')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'End Date is required',
      ar: 'تاريخ الانتهاء مطلوب',
    })
    .isDate()
    .withMessage({
      en: 'End Date Must be date',
      ar: 'يجب أن يكون تاريخ الانتهاء تاريخ',
    })
    .custom((endDate, { req }) => {
      const startDateValue = new Date(req.body.startDate);
      const endDateValue = new Date(endDate);
      const minimumDifferenceInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      return (
        endDateValue.getTime() >=
        startDateValue.getTime() + minimumDifferenceInMs
      );
    })
    .withMessage({
      en: 'End Date must be greater than Start Date by at least 24 hours',
      ar: 'يجب أن يكون تاريخ الانتهاء أكبر من تاريخ البدء بـ 24 ساعة على الأقل',
    }),
  body('typeOfBanner')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Type Of Banner is required',
      ar: 'نوع البانر مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Type Of Banner Must be string',
      ar: 'يجب أن يكون نوع البانر سلسلة',
    })
    .custom((value) => {
      if (value !== 'vertical' && value !== 'horizontal') {
        return Promise.reject({
          en: 'Type Of Banner Must be vertical or horizontal',
          ar: 'يجب أن يكون نوع البانر عمودي أو أفقي',
        });
      }
      return true;
    }),
  body('imageOfBanner')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Image Of Banner is required',
      ar: 'صورة البانر مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Image Of Banner Must be string',
      ar: 'يجب أن تكون صورة البانر سلسلة',
    })
    .trim(),
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

export const deleteOfferByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Offer id is required',
      ar: 'معرف العرض مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Offer id is not valid',
      ar: 'معرف العرض غير صالح',
    }),
  validate,
];
