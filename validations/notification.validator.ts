// Packages NPM Import
import { body, param } from 'express-validator';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';
import { Notification } from '../models/notification.model';

export const createNotificationValidator = [
  body('title')
    .notEmpty()
    .withMessage({
      en: 'Title is required',
      ar: 'العنوان مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Title must be string',
      ar: 'يجب أن يكون العنوان سلسلة',
    })
    .trim(),
  body('message')
    .notEmpty()
    .withMessage({
      en: 'Message is required',
      ar: 'الرسالة مطلوبة',
    })
    .isString()
    .withMessage({
      en: 'Message must be string',
      ar: 'يجب أن تكون الرسالة سلسلة',
    })
    .trim(),
  body('read')
    .notEmpty()
    .withMessage({
      en: 'Read is required',
      ar: 'القراءة مطلوبة',
    })
    .isBoolean()
    .withMessage({
      en: 'Read must be boolean',
      ar: 'يجب أن تكون القراءة منطقية',
    }),
  body('sender')
    .notEmpty()
    .withMessage({
      en: 'Sender is required',
      ar: 'المرسل مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Sender must be string',
      ar: 'يجب أن يكون المرسل سلسلة',
    })
    .trim(),
  body('receiver')
    .notEmpty()
    .withMessage({
      en: 'Receiver is required',
      ar: 'المستقبل مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Receiver must be string',
      ar: 'يجب أن يكون المستقبل سلسلة',
    })
    .trim(),
  body('link')
    .notEmpty()
    .withMessage({
      en: 'Link is required',
      ar: 'الرابط مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Receiver must be string',
      ar: 'يجب أن يكون المستقبل سلسلة',
    })
    .trim(),
  validate,
];

export const markNotificationAsReadValidator = [
  param('id')
    .isMongoId()
    .withMessage({
      en: 'Id must be mongo id',
      ar: 'يجب أن يكون المعرف معرف مونجو',
    })
    .trim()
    .custom(async (val) => {
      const Notifi = await Notification.findById(val);
      if (!Notifi) {
        return Promise.reject({
          en: `Notification Not Found with this ID : ${val}`,
          ar: `لم يتم العثور على الإشعار بهذا المعرف : ${val}`,
        });
      }
      return Promise.resolve();
    }),
  body('read')
    .notEmpty()
    .withMessage({
      en: 'Read is required',
      ar: 'القراءة مطلوبة',
    })
    .isBoolean()
    .withMessage({
      en: 'Read must be boolean',
      ar: 'يجب أن تكون القراءة منطقية',
    }),
  validate,
];
