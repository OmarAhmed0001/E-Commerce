// Packages NPM Import
import { body, param } from 'express-validator';
import slugify from 'slugify';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';
// Model Import
import { SubCategory } from '../models/subCategory.model';
import { Product } from '../models/product.model';
import { Brand } from '../models/brand.model';

export const getBrandByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Brand id is required',
      ar: 'معرف الفئة الفرعية مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Brand id is not valid',
      ar: 'معرف الفئة الفرعية غير صالح',
    }),
  validate,
];
// TODO: Creation Validation
export const createBrandValidator = [
  body('name_en')
    .notEmpty()
    .withMessage({
      en: 'Name in english is required',
      ar: 'الاسم باللغة الإنجليزية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name in english Must be string',
      ar: 'يجب أن يكون الاسم باللغة الإنجليزية حروف',
    })
    .isLength({ min: 3, max: 50 })
    .withMessage({
      en: 'Must be between 3 to 50 characters',
      ar: 'يجب أن يكون بين 3 إلى 50 حرفا',
    })
    .trim()
    .custom(async (_val, { req }) => {
      const brand = await Brand.findOne({
        name_en: req.body.name_en,
      });
      if (brand) {
        return Promise.reject({
          en: 'Name in english already Used Before',
          ar: 'الاسم باللغة الإنجليزية مستخدم بالفعل',
        });
      }
      return Promise.resolve();
    })
    .custom((val, { req }) => {
      req.body.slug_en = slugify(val);
      return true;
    }),

  body('name_ar')
    .notEmpty()
    .withMessage({
      en: 'Name in arabic is required',
      ar: 'الاسم باللغة العربية مطلوب',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' })
    .isLength({ min: 3, max: 50 })
    .withMessage({
      en: 'Must be between 3 to 50 characters',
      ar: 'يجب أن يكون بين 3 إلى 50 حرفا',
    })
    .trim()
    .custom(async (_val, { req }) => {
      const brand = await Brand.findOne({
        name_ar: req.body.name_ar,
      });
      if (brand) {
        return Promise.reject({
          en: 'Name in arabic already Used Before',
          ar: 'الاسم باللغة العربية مستخدم بالفعل',
        });
      }
      return Promise.resolve();
    })
    .custom((val, { req }) => {
      req.body.slug_ar = slugify(val);
      return true;
    }),
  //#region *Start of Product Description en and ar*
  body('desc_en')
    .optional()
    .withMessage({
      en: 'Description in english is required',
      ar: 'الوصف باللغة الإنجليزية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Description in english Must be string',
      ar: 'يجب أن يكون الوصف باللغة الإنجليزية حروف',
    })
    .trim(),
  body('desc_ar')
    .optional()
    .withMessage({
      en: 'Description in arabic is required',
      ar: 'الوصف باللغة العربية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Description in arabic Must be string',
      ar: 'يجب أن يكون الوصف باللغة العربية حروف',
    })
    .trim(),
  //#endregion *End of Product Description en and ar*
  body('image')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Image must not be empty',
      ar: 'الصورة لا يجب أن تكون فارغة',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' })
    .isURL()
    .withMessage({ en: 'Must be URL', ar: 'يجب أن يكون رابط' }),

  body('subCategory')
    .notEmpty()
    .withMessage({
      en: 'subCategory id is required',
      ar: 'معرف الفئة الفرعية مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'subCategory mongo id is not valid',
      ar: 'معرف الفئة الفرعية غير صالح',
    })
    .custom(async (val) => {
      const subCategory = await SubCategory.findOne({ _id: val });
      if (!subCategory) {
        return Promise.reject({
          en: 'this subCategory not exist',
          ar: 'هذا التصنيف الفرعي غير موجود',
        });
      }
    }),

  body('title_meta')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Title meta must not be empty',
      ar: 'عنوان الوصف لا يجب أن يكون فارغًا',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),

  body('desc_meta')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Description meta must not be empty',
      ar: 'وصف الوصف لا يجب أن يكون فارغًا',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  validate,
];
// TODO: Update Validation
export const updateBrandValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Brand id is required',
      ar: 'معرف الماركة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Brand id is not valid',
      ar: 'معرف الماركة غير صالح',
    })
    .custom(async (val, { req }) => {
      const brand = await Brand.findById(req.params?.id);
      if (!brand) {
        return Promise.reject({
          en: 'this Brand not exist',
          ar: 'هذة الماركة غير موجودة',
        });
      }
    }),
  body('name_en')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Name in english is required',
      ar: 'الاسم باللغة الإنجليزية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name in english Must be string',
      ar: 'يجب أن يكون الاسم باللغة الإنجليزية حروف',
    })
    .isLength({ min: 3, max: 50 })
    .withMessage({
      en: 'Must be between 3 to 50 characters',
      ar: 'يجب أن يكون بين 3 إلى 50 حرفا',
    })
    .trim()
    .custom(async (val, { req }) => {
      const brand = await Brand.findOne({ name_en: val });
      if (brand && brand._id.toString() !== req?.params?.id) {
        return Promise.reject({
          en: 'Name in english already Used Before',
          ar: 'الاسم باللغة الإنجليزية مستخدم بالفعل',
        });
      }
      return Promise.resolve();
    })
    .custom((val, { req }) => {
      req.body.slug_en = slugify(val);
      return true;
    }),
  body('name_ar')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Name in arabic is required',
      ar: 'الاسم باللغة العربية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Name in arabic Must be string',
      ar: 'يجب أن يكون الاسم باللغة العربية حروف',
    })
    .isLength({ min: 3, max: 50 })
    .withMessage({
      en: 'Must be between 3 to 50 characters',
      ar: 'يجب أن يكون بين 3 إلى 50 حرفا',
    })
    .trim()
    .custom(async (val, { req }) => {
      const brand = await Brand.findOne({ name_ar: val });
      if (brand && brand._id.toString() !== req?.params?.id) {
        return Promise.reject({
          en: 'Name in arabic already Used Before',
          ar: 'الاسم باللغة العربية مستخدم بالفعل',
        });
      }
      return Promise.resolve();
    })
    .custom((val, { req }) => {
      req.body.slug_ar = slugify(val);
      return true;
    }),
  //#region *Start of Product Description en and ar*
  body('desc_en')
    .optional()
    .withMessage({
      en: 'Description in english is required',
      ar: 'الوصف باللغة الإنجليزية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Description in english Must be string',
      ar: 'يجب أن يكون الوصف باللغة الإنجليزية حروف',
    })
    .trim(),
  body('desc_ar')
    .optional()
    .withMessage({
      en: 'Description in arabic is required',
      ar: 'الوصف باللغة العربية مطلوب',
    })
    .isString()
    .withMessage({
      en: 'Description in arabic Must be string',
      ar: 'يجب أن يكون الوصف باللغة العربية حروف',
    })
    .trim(),
  //#endregion *End of Product Description en and ar*
  body('image')
    .optional()
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' })
    .isURL()
    .withMessage({ en: 'Must be URL', ar: 'يجب أن يكون رابط' }),
  body('subCategory')
    .notEmpty()
    .withMessage({
      en: 'subCategory id is required',
      ar: 'معرف الفئة الفرعية مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'subCategory mongo id is not valid',
      ar: 'معرف الفئة الفرعية غير صالح',
    })
    .custom(async (val) => {
      const subCategory = await SubCategory.findOne({ _id: val });
      if (!subCategory) {
        return Promise.reject({
          en: 'this subCategory not exist',
          ar: 'هذا التصنيف الفرعي غير موجود',
        });
      }
    }),
  body('title_meta')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Title meta must not be empty',
      ar: 'عنوان الوصف لا يجب أن يكون فارغًا',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),

  body('desc_meta')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Description meta must not be empty',
      ar: 'وصف الوصف لا يجب أن يكون فارغًا',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  validate,
];

export const deleteBrandValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Brand id is required',
      ar: 'معرف الماركة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Brand id is not valid',
      ar: 'معرف الماركة غير صالح',
    })
    .custom(async (val, { req }) => {
      const productCount = await Product.countDocuments({
        brand: Object(req.params?.id),
      });
      if (productCount > 0) {
        return Promise.reject({
          en: `this brand can't be deleted because it's contained ${productCount} products`,
          ar: `لا يمكن حذف هذة الماركة لأنها تحتوي على ${productCount} منتج`,
        });
      }
    }),
  validate,
];
