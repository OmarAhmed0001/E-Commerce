// Packages NPM Import
import { body } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';

export const createPointsManagementValidation = [
  body('noOfPointsInOneUnit')
    .notEmpty()
    .withMessage({
      en: 'noOfPointsInOneUnit is required',
      ar: 'noOfPointsInOneUnit مطلوب',
    })
    .isNumeric()
    .withMessage({
      en: 'noOfPointsInOneUnit Must be number',
      ar: 'يجب أن يكون noOfPointsInOneUnit رقم',
    }),
  body('totalPointConversionForOneUnit')
    .notEmpty()
    .withMessage({
      en: 'totalPointConversionForOneUnit is required',
      ar: 'totalPointConversionForOneUnit مطلوب',
    })
    .isNumeric()
    .withMessage({
      en: 'totalPointConversionForOneUnit Must be number',
      ar: 'يجب أن يكون totalPointConversionForOneUnit رقم',
    }),
  body('min')
    .notEmpty()
    .withMessage({
      en: 'min is required',
      ar: 'min مطلوب',
    })
    .isNumeric()
    .withMessage({
      en: 'min Must be number',
      ar: 'يجب أن يكون min رقم',
    }),
  body('max')
    .notEmpty()
    .withMessage({
      en: 'max is required',
      ar: 'max مطلوب',
    })
    .isNumeric()
    .withMessage({
      en: 'max Must be number',
      ar: 'يجب أن يكون max رقم',
    }),
  body('status')
    .notEmpty()
    .withMessage({
      en: 'status is required',
      ar: 'status مطلوب',
    })
    .isIn(['static', 'dynamic'])
    .withMessage({
      en: 'status Must be static or dynamic',
      ar: 'يجب أن يكون الحالة ثابت أو ديناميكي',
    }),
  validate,
];
