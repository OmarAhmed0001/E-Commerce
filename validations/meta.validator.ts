// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';
import { Meta } from '../models/meta.model';

export const createMetaDataValidation = [
  body('title_meta')
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
  body('desc_meta')
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
  validate,
];

export const updateMetaDataValidation = [
  param('id')
    .isMongoId()
    .withMessage({
      en: 'Meta id is not valid',
      ar: 'معرف الوصف غير صالح',
    })
    .custom(async (val) => {
      const MetaData = await Meta.findById(val);
      if (!MetaData) {
        return Promise.reject({
          en: `Meta Not Found with this ID : ${val}`,
          ar: `لم يتم العثور على الوصف بهذا المعرف : ${val}`,
        });
      }
      return Promise.resolve();
    }),
  body('title_meta')
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
  body('desc_meta')
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
  validate,
];

export const deleteMetaDataValidation = [
  param('id')
    .isMongoId()
    .withMessage({
      en: 'Meta id is not valid',
      ar: 'معرف الوصف غير صالح',
    })
    .custom(async (val) => {
      const MetaData = await Meta.findById(val);
      if (!MetaData) {
        return Promise.reject({
          en: `Meta Not Found with this ID : ${val}`,
          ar: `لم يتم العثور على الوصف بهذا المعرف : ${val}`,
        });
      }
      return Promise.resolve();
    }),
  validate,
];

export const getMetaDataByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage({
      en: 'Meta id is not valid',
      ar: 'معرف الوصف غير صالح',
    })
    .custom(async (val) => {
      const MetaData = await Meta.findById(val);
      if (!MetaData) {
        return Promise.reject({
          en: `Meta Not Found with this ID : ${val}`,
          ar: `لم يتم العثور على الوصف بهذا المعرف : ${val}`,
        });
      }
      return Promise.resolve();
    }),
  validate,
];

export const getAllMetaDataValidation = [validate];

export const getMetaDataByRefrenceValidation = [
  param('id')
    .isMongoId()
    .withMessage({
      en: 'Meta id is not valid',
      ar: 'معرف الوصف غير صالح',
    })
    .trim()
    .custom(async (val) => {
      const MetaRef = await Meta.findOne({ reference: val });
      if (!MetaRef) {
        return Promise.reject({
          en: `Meta Not Found for this reference id : ${val} `,
          ar: `لم يتم العثور على الوصف بهذا المعرف : ${val}`,
        });
      }
      return Promise.resolve();
    }),
  validate,
];
