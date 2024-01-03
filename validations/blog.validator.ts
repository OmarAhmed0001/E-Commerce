// Packages NPM Import
import { body, param } from 'express-validator';
import slugify from 'slugify';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const getBlogByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Blog id is required',
      ar: 'معرف المدونة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Blog id is not valid',
      ar: 'معرف المدونة غير صالح',
    }),
  validate,
];

export const createBlogValidator = [
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
    .isLength({ min: 3, max: 50 })
    .withMessage({
      en: 'Must be between 3 to 50 characters',
      ar: 'يجب أن يكون بين 3 إلى 50 حرفا',
    })
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body('description')
    .notEmpty()
    .withMessage({
      en: 'Description is required',
      ar: 'الوصف مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Description Must be string',
      ar: 'يجب أن يكون الوصف حروف',
    })
    .trim(),
  body('image')
    .notEmpty()
    .withMessage({
      en: 'Image is required',
      ar: 'الصورة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Image Must be string',
      ar: 'يجب أن تكون الصورة سلسلة',
    }),
  validate,
];

export const updateBlogValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Blog id is required',
      ar: 'معرف المدونة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Blog id is not valid',
      ar: 'معرف المدونة غير صالح',
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
    .isLength({ min: 3, max: 50 })
    .withMessage({
      en: 'Must be between 3 to 50 characters',
      ar: 'يجب أن يكون بين 3 إلى 50 حرفا',
    })
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  body('description')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Description is required',
      ar: 'الوصف مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Description Must be string',
      ar: 'يجب أن يكون الوصف حروف',
    })
    .trim(),
  body('image')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Image is required',
      ar: 'الصورة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Image Must be string',
      ar: 'يجب أن تكون الصورة سلسلة',
    }),
  validate,
];

export const deleteBlogValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Blog id is required',
      ar: 'معرف المدونة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Blog id is not valid',
      ar: 'معرف المدونة غير صالح',
    }),
  validate,
];
