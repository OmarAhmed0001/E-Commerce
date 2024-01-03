import { Request, Response, NextFunction, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import expressAsyncHandler from 'express-async-handler';

import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { limitedForProduct } from '../utils/limits/limitsProduct';
import { limitedForCategory } from '../utils/limits/limitsCategory';
import ApiError from '../utils/ApiError';
import { SubCategory } from '../models/subCategory.model';
import { User } from '../models/user.model';
import { limitedForAdmin } from '../utils/limits/limitsUser';
import { limitedForSubCategory } from '../utils/limits/limitsSubCategory';
import { IRole } from '../interfaces/user/user.interface';

const Roles: IRole = {
  rootAdmin: 'مدير عام',
  adminA: 'مدير عام',
  adminB: 'مدير',
  adminC: 'محاسب',
  subAdmin: 'مسؤول خدمة عملاء',
  user: 'مستخدم',
  guest: 'زائر',
  marketer: 'مسوق',
};

let Count: number;
export const limitsMiddleware = (Model: string): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      switch (Model) {
        case 'Product':
          {
            Count = await Product.countDocuments({});
            const limitProduct = limitedForProduct();
            if (Count >= limitProduct) {
              return next(
                new ApiError(
                  {
                    en: `you can't add more than ${limitProduct} products`,
                    ar: `لا يمكنك إضافة أكثر من ${limitProduct} منتجات`,
                  },
                  StatusCodes.NOT_FOUND,
                ),
              );
            }
          }
          break;
        case 'Category':
          {
            Count = await Category.countDocuments({});
            const limitCategory = limitedForCategory();
            if (Count === limitCategory) {
              return next(
                new ApiError(
                  {
                    en: `you can't add more than ${limitCategory} categories`,
                    ar: `لا يمكنك إضافة أكثر من ${limitCategory} تصنيفات`,
                  },
                  StatusCodes.NOT_FOUND,
                ),
              );
            }
          }
          break;
        case 'SubCategory':
          {
            Count = await SubCategory.countDocuments({});
            const limitSubCategory = limitedForSubCategory();
            if (Count >= limitSubCategory) {
              return next(
                new ApiError(
                  {
                    en: `you can't add more than ${limitSubCategory} subcategories in each category`,
                    ar: `لا يمكنك إضافة أكثر من ${limitSubCategory} تصنيفات فرعية في كل تصنيف`,
                  },
                  StatusCodes.NOT_FOUND,
                ),
              );
            }
          }
          break;
        case 'User':
          {
            Count = await User.countDocuments({ role: req.body.role });
            const limitAdmin = limitedForAdmin(req.body.role);
            if (Count >= limitAdmin) {
              return next(
                new ApiError(
                  {
                    en: `you can't add more than ${limitAdmin} of ${req.body.role}`,
                    ar: `لا يمكنك إضافة أكثر من ${limitAdmin} من ${
                      Roles[req.body.role as keyof IRole]
                    }`,
                  },
                  StatusCodes.NOT_FOUND,
                ),
              );
            }
          }
          break;
        default:
          break;
      }
      next();
    },
  );
