// Packages NPM Import
import { body, param } from 'express-validator';
import slugify from 'slugify';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';
// Model Import
import { SubCategory } from '../models/subCategory.model';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { Brand } from '../models/brand.model';

export const getSubCategoryByIdValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'SubCategory id is required',
      ar: 'معرف الفئة الفرعية مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'SubCategory id is not valid',
      ar: 'معرف الفئة الفرعية غير صالح',
    }),
  validate,
];

export const createSubCategoryValidator = [
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
      const subcategory = await SubCategory.findOne({
        name_en: req.body.name_en,
      });
      if (subcategory) {
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
      const subcategory = await SubCategory.findOne({
        name_ar: req.body.name_ar,
      });
      if (subcategory) {
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

  body('category')
    .notEmpty()
    .withMessage({
      en: 'Category id is required',
      ar: 'معرف الفئة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Category id is not valid',
      ar: 'معرف الفئة غير صالح',
    })
    .custom(async (val) => {
      const category = await Category.findOne({ _id: val });
      if (!category) {
        return Promise.reject({
          en: 'this category not exist',
          ar: 'هذا التصنيف غير موجود',
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

export const updateSubCategoryValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Category id is required',
      ar: 'معرف الفئة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Category id is not valid',
      ar: 'معرف الفئة غير صالح',
    })
    .custom(async (val, { req }) => {
      const subcategory = await SubCategory.findById(req.params?.id);
      if (!subcategory) {
        return Promise.reject({
          en: 'this subcategory not exist',
          ar: 'هذا التصنيف الفرعي غير موجود',
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
      const subcategory = await SubCategory.findOne({ name_en: val });
      if (subcategory && subcategory._id.toString() !== req?.params?.id) {
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
      const subcategory = await SubCategory.findOne({ name_ar: val });
      if (subcategory && subcategory._id.toString() !== req?.params?.id) {
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
  body('image')
    .optional()
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' })
    .isURL()
    .withMessage({ en: 'Must be URL', ar: 'يجب أن يكون رابط' }),
  body('category')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Category id is required',
      ar: 'معرف الفئة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Category id is not valid',
      ar: 'معرف الفئة غير صالح',
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

export const deleteSubCategoryValidator = [
  param('id')
    .notEmpty()
    .withMessage({
      en: 'Category id is required',
      ar: 'معرف الفئة مطلوب',
    })
    .isMongoId()
    .withMessage({
      en: 'Category id is not valid',
      ar: 'معرف الفئة غير صالح',
    })
    .custom(async (_val, { req }) => {
      // check if subcategory contained any products
      const productCount = await Product.countDocuments({
        subCategory: Object(req.params?.id),
      });
      if (productCount > 0) {
        return Promise.reject({
          en: `this subcategory can't be deleted because it's contained ${productCount} products`,
          ar: `لا يمكن حذف هذا التصنيف الفرعي لأنه يحتوي على ${productCount} منتج`,
        });
      }
      // check if subcategory contained any brands
      const brandCount = await Brand.countDocuments({
        subCategory: Object(req.params?.id),
      });
      if (brandCount > 0) {
        return Promise.reject({
          en: `this subcategory can't be deleted because it's contained ${brandCount} brands`,
          ar: `لا يمكن حذف هذا التصنيف الفرعي لأنه يحتوي على ${brandCount} ماركة`,
        });
      }
    }),
  validate,
];
