// Packages NPM Import
import { body, param } from 'express-validator';
import slugify from 'slugify';

// Middleware Import
import { validate } from '../middlewares/validation.middleware';
// Model Import
import { Category } from '../models/category.model';
import { SubCategory } from '../models/subCategory.model';
import { Product } from '../models/product.model';

export const getCategoryByIdValidator = [
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
    }),
  validate,
];

export const createCategoryValidator = [
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
      const category = await Category.findOne({ name_en: req.body.name_en });
      if (category) {
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
      const category = await Category.findOne({ name_ar: req.body.name_ar });
      if (category) {
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
  body('title_meta')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Title meta must not be empty',
      ar: 'عنوان الوصف لا يجب أن يكون فارغا',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  body('description_meta')
    .optional()
    .notEmpty()
    .withMessage({
      en: 'Description meta must not be empty',
      ar: 'وصف الوصف لا يجب أن يكون فارغا',
    })
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  validate,
];

export const updateCategoryValidator = [
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
    .custom(async (val) => {
      // check if category not exist
      const category = await Category.findById(val);
      if (!category) {
        return Promise.reject({
          en: `Not Found Any Category With This Id: ${val}`,
          ar: `لا يوجد تصنيف بهذا الرقم : ${val}`,
        });
      }
      return Promise.resolve();
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
      const category = await Category.findOne({ name_en: val });
      if (category && category._id.toString() !== req?.params?.id) {
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
      const category = await Category.findOne({ name_ar: val });
      if (category && category._id.toString() !== req?.params?.id) {
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
  body('title_meta')
    .optional()
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  body('description_meta')
    .optional()
    .isString()
    .withMessage({ en: 'Must be string', ar: 'يجب أن يكون سلسلة' }),
  validate,
];

export const deleteCategoryValidator = [
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
      // check if category contained any subcategories
      const subCategoryCount = await SubCategory.countDocuments({
        category: Object(req.params?.id),
      });
      if (subCategoryCount) {
        return Promise.reject({
          en: "this category can't be deleted because it has subcategories",
          ar: 'لا يمكن حذف هذا التصنيف لأنه يحتوي على أقسام فرعية',
        });
      }

      // check if category contained any products
      const productCount = await Product.countDocuments({
        category: Object(req.params?.id),
      });
      if (productCount) {
        return Promise.reject({
          en: "this category can't be deleted because it has products",
          ar: 'لا يمكن حذف هذا التصنيف لأنه يحتوي على منتجات',
        });
      }
    }),
  validate,
];
