import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

import { Coupon } from '../models/coupon.model';
import { Product } from '../models/product.model';
import { IUser } from '../interfaces/user/user.interface';
import { IProduct } from '../interfaces/product/product.interface';
import { Status } from '../interfaces/status/status.enum';
import ApiError from '../utils/ApiError';

import {
  getAllItems,
  getOneItemById,
  deleteOneItemById,
} from './factory.controller';

// @desc  choose case for discountDepartment
export const chooseCase = async (req: Request): Promise<Types.ObjectId[]> => {
  let products: (Types.ObjectId | IProduct)[] = [];
  switch (req.body.discountDepartment.key) {
    case 'allProducts':
      products = await Product.find({});
      break;
    case 'products':
      products = req.body.discountDepartment.value as Types.ObjectId[];
      break;
    case 'categories':
      products = await Product.find({
        category: [req.body.discountDepartment.value],
      });
      break;
    case 'subcategories':
      products = await Product.find({
        subCategory: [req.body.discountDepartment.value],
      });
      break;
    default:
      break;
  }

  // 2- collect all products ids that coupon can be used on
  let productsCouponsIds: Types.ObjectId[] = [];
  if (req.body.discountDepartment.key !== 'products') {
    productsCouponsIds = (products as IProduct[]).map((product: IProduct) => {
      return product._id.toString();
    });
  } else {
    productsCouponsIds = products as Types.ObjectId[];
  }

  return productsCouponsIds;
};

// @desc    Get All Coupons
// @route   Get /api/v1/coupons
// @access  Private (Admin)
export const getAllCoupons = getAllItems(Coupon);

// @desc    Get Specific Coupon By Id
// @route   Get /api/v1/coupons/:id
// @access  Private (Admin)
export const getOneCouponById = getOneItemById(Coupon);

// @desc    Add New Coupon
// @route   POST /api/v1/coupons
// @access  Private (Admin)
export const createCoupon = expressAsyncHandler(
  async (
    req: Request,
    res: Response /*, next: NextFunction*/,
  ): Promise<void> => {
    // 1- check if coupon with same code is exist
    // 2- collect all products ids that coupon can be used on
    const productsCouponsIds = await chooseCase(req);
    // 3- create coupon
    const coupon = await Coupon.create({
      ...req.body,
      products: productsCouponsIds,
    });

    // 4- response with created coupon
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: coupon,
      success_en: 'created successfully',
      success_ar: 'تم الانشاء بنجاح',
    });
  },
);

// @desc    Update Specific Coupon By Id
// @route   PUT /api/v1/coupons/:id
// @access  Private (Admin)
export const updateCoupon = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1- get id for item from params
    const { id } = req.params;

    // 1- check if coupon with same code is exist
    // 2- collect all products ids that coupon can be used on
    const CouponsIds = await Coupon.findById(id);
    if (!CouponsIds) {
      return next(
        new ApiError(
          {
            en: `Not Found Any Coupon For This Id ${id}`,
            ar: `${id}لا يوجداي كوبون لهذا`,
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    console.log(req.body, 'req.body');
    const productsCouponsIds =
      req.body.Department &&
      req.body.Department.key.includes([
        'allProducts',
        'products',
        'categories',
        'subcategories',
      ])
        ? await chooseCase(req)
        : CouponsIds.products;
    console.log(productsCouponsIds, 'productsCouponsIds');

    // 4- find item and update in mongooseDB
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        ...req.body,
        products: productsCouponsIds,
      },
      {
        new: true,
      },
    );

    // 5- check if document not found
    if (!coupon) {
      return next(
        new ApiError(
          {
            en: `Not Found Any Coupon For This Id ${id}`,
            ar: `${id}لا يوجداي كوبون لهذا`,
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 6- send response
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: coupon,
      success_en: 'updated successfully',
      success_ar: 'تم التعديل بنجاح',
    });
  },
);

// @desc    Delete Specific Coupon By Id
// @route   DELETE /api/v1/coupons/:id
// @access  Private (Admin)
export const deleteCoupon = deleteOneItemById(Coupon);

// @desc    Get Specific Coupon By Name And Specific Products
// @route   Get /api/v1/coupons/ByNameAndProducts
// @access  Private (Admin)
export const getCouponByNameAndProducts = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1- get coupon name from req.query
    const couponCode = req.params.code;

    // 2- find coupon by name
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) {
      return next(
        new ApiError(
          {
            en: 'Coupon Not Found',
            ar: 'الكوبون غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const date = new Date();
    if (coupon.type === 'normal') {
      // 3- check if coupon is valid date
      if (coupon.endDate < date || coupon.startDate > date) {
        return next(
          new ApiError(
            {
              en: 'Coupon is Expired',
              ar: 'الكوبون منتهي',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }

      // 4- check if coupon that user used all times
      const userUsedAllTimes = coupon.users.filter((user) => {
        return (
          user.user.toString() === (req.user as IUser)._id.toString() &&
          user.usedNumber === coupon.limit
        );
      });
      if (userUsedAllTimes.length > 0) {
        return next(
          new ApiError(
            {
              en: 'You Used This Coupon All Times',
              ar: 'لقد استخدمت هذا الكوبون كل مراته',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
    }

    // 6- response
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        discount: coupon.discount,
        productsCouponsIds: coupon.products,
      },
    });
  },
);
