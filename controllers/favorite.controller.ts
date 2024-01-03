import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Status } from '../interfaces/status/status.enum';
import { IUser } from '../interfaces/user/user.interface';
import ApiError from '../utils/ApiError';

// @desc     Add Product To FavouritesList
// @route    POST  /api/v1/favourites/
// @access   Protected/User
export const addProductToFavouritesList = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- check if product exist
    const productExist = await Product.findById(req.body.productId);
    if (!productExist) {
      return next(
        new ApiError(
          {
            en: 'Product Not Found',
            ar: 'المنتج غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 2- check if product already in favourite list
    // $addToSet => Add ProductId To Favourite Array
    await User.findByIdAndUpdate(
      (req.user! as IUser)._id,
      {
        $addToSet: { favourite: req.body.productId },
      },
      {
        new: true,
      },
    );

    // 3- send response
    res.status(200).json({
      status: Status.SUCCESS,
      success_en: 'add successfully',
      success_ar: 'تم الاضافة بنجاح',
    });
  },
);

// @desc     Get FavouritesList For Logged User
// @route    GET  /api/v1/favourites/
// @access   Protected/User
export const getFavouriteList = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    // 1- get user favourite list
    const userFavouriteList = await User.findById((req.user! as IUser)._id)
      .populate('favourite')
      .select('favourite');

    const { keyword } = req.query;
    let searchData: string[] = userFavouriteList?.favourite || [];
    if (keyword) {
      searchData =
        userFavouriteList?.favourite.filter((item) => {
          const typedItem = item as {
            title_en?: string;
            title_ar?: string;
            description_en?: string;
            description_ar?: string;
          };
          const titleEn = typedItem?.title_en; // Get the title_en property
          const titleAr = typedItem?.title_ar;
          const descriptionEn = typedItem?.description_en;
          const descriptionAr = typedItem?.description_ar;
          const valueTitleEn = Object.values(keyword)[0] as string;
          const valueTitleAr = Object.values(keyword)[1] as string;
          const valueDescEn = Object.values(keyword)[2] as string;
          const valueDescAr = Object.values(keyword)[3] as string;
          if (
            titleEn?.toLowerCase().includes(valueTitleEn.toLowerCase()) ||
            titleAr?.toLowerCase().includes(valueTitleAr.toLowerCase()) ||
            descriptionEn?.toLowerCase().includes(valueDescEn.toLowerCase()) ||
            descriptionAr?.toLowerCase().includes(valueDescAr.toLowerCase())
          )
            return true;
          return false;
        }) || [];
    }
    const result = {
      _id: userFavouriteList?._id,
      favourite: searchData,
      imageUrl: userFavouriteList?.imageUrl,
      id: userFavouriteList?.id,
    };

    // 2- send response
    res.status(200).json({
      status: Status.SUCCESS,
      data: result,
      success_en: 'add successfully',
      success_ar: 'تم الاضافة بنجاح',
    });
  },
);

// @desc     Remove Product From FavouritesList
// @route    DELETE  /api/v1/favourites/:productId
// @access   Protected/User
export const removeProductFromFavouritesList = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    // 1- $pull => Remove ProductId From FavouritesList Array
    await User.findByIdAndUpdate(
      (req.user! as IUser)._id,
      {
        $pull: { favourite: req.params.productId },
      },
      {
        new: true,
      },
    );

    // 2- send response
    res.status(200).json({
      status: Status.SUCCESS,
      success_en: 'deleted successfully',
      success_ar: 'تم الحذف بنجاح',
    });
  },
);

// @desc     Toggle Product From FavouritesList
// @route    PUT  /api/v1/favourites/toggleItemToFavourites
// @access   Protected/User
export const toggleProductFromFavouritesList = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    // 1- inital values
    let isExist = false;
    let megEn = '';
    let megAr = '';

    // 2- get user favourite list
    const userFavouriteList = await User.findById(
      (req.user! as IUser)._id,
    ).select('favourite');

    // 3- check if product exist in user favourite list
    userFavouriteList?.favourite.forEach((item) => {
      if (item == req.params.productId) {
        isExist = true;
      }
    });

    // 4- if product exist in user favourite list => remove it
    if (isExist) {
      await User.findByIdAndUpdate(
        (req.user! as IUser)._id,
        {
          $pull: { favourite: req.params.productId },
        },
        {
          new: true,
        },
      );
      megEn = 'deleted successfully';
      megAr = 'تم الحذف بنجاح';
    } else {
      await User.findByIdAndUpdate(
        (req.user! as IUser)._id,
        {
          $addToSet: { favourite: req.params.productId },
        },
        {
          new: true,
        },
      );
      megEn = 'add successfully';
      megAr = 'تم الاضافة بنجاح';
    }

    // 5- send response
    res.status(200).json({
      status: Status.SUCCESS,
      success_en: megEn,
      success_ar: megAr,
    });
  },
);

// @desc     Get All Products For All Users
// @route    GET  /api/v1/favourites/
// @access   Protected/User
export const getAllItemsFromAllFavouritesList = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    const products = await User.find().select('favourite');

    const map1 = new Map();
    const result = products.filter((prod) => {
      if (prod.favourite.length > 0) {
        return prod.favourite;
      }
    });

    for (let i = 0; i < result.length; i += 1) {
      const len = result[i].favourite.length;
      for (let j = 0; j < len; j += 1) {
        const id = result[i].favourite[j].toString();
        if (map1.get(id) === undefined) {
          map1.set(id, 0);
        }
        map1.set(id, map1.get(id) + 1);
      }
    }
    const arrayFromMap = Array.from(map1);

    // send respone
    res.status(200).json({
      status: Status.SUCCESS,
      data: arrayFromMap,
      success_en: 'success',
      success_ar: 'تم بنجاح',
    });
  },
);
