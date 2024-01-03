import { NextFunction, Request, Response, RequestHandler } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { Model } from 'mongoose';

import { Product } from '../models/product.model';
import { Review } from '../models/review.model';
import { IUser } from '../interfaces/user/user.interface';
import { IQuery } from '../interfaces/factory/factory.interface';
import { Status } from '../interfaces/status/status.enum';
import { ApiFeatures } from '../utils/ApiFeatures';
import ApiError from '../utils/ApiError';

// function to calculating the rating after each updated in reviews
const updateRating = async (productId: string): Promise<void> => {
  let totalRating = 0;
  let avgRating = 0;
  const productsReviews = await Review.find({ product: productId });
  productsReviews?.map((item) => {
    totalRating += item.rating;
  });
  avgRating =
    productsReviews.length === 0 ? 0 : totalRating / productsReviews.length;
  await Product.findOneAndUpdate({ _id: productId }, { rating: avgRating });
};

// @desc    Add review or comment to product
// @route   POST /api/v1/{review or comment}/product/:productId
// @access  Private (User)
export const addToProduct = <T>(
  Model: Model<T>,
  modelType: string,
): RequestHandler =>
  expressAsyncHandler(
    async (
      req: Request,
      res: Response /*, next: NextFunction*/,
    ): Promise<void> => {
      // 1- get productId from params
      const { productId } = req.params;

      // 2- get userId from req.user
      const { _id } = req.user! as IUser;

      // 3- check if user already {review or comment} this product
      const alreadyReviewedOrComment = await Model.findOne({
        user: _id,
        product: productId,
      });

      // 4- check if review already exist update it
      if (alreadyReviewedOrComment) {
        // 4.1- update {review or comment}
        const doc = await Model.findOneAndUpdate(
          { user: _id, product: productId },
          req.body,
          { new: true },
        );

        // 4.2- update rating from product
        if (modelType === 'review') updateRating(productId);

        // 4.3- send response
        res.status(StatusCodes.OK).json({
          status: Status.SUCCESS,
          data: doc,
          success_ar: 'تم التعديل بنجاح',
          success_en: 'updated successfully',
        });
        return;
      }

      // 5- if the review not exist
      // 5.1- create it and save it to MongooseDB
      const doc = await Model.create({
        user: _id,
        product: productId,
        ...req.body,
      });

      // 5.2- update rating from product
      if (modelType === 'review') updateRating(productId);

      // 5.3- send response
      res.status(StatusCodes.CREATED).json({
        status: Status.SUCCESS,
        data: doc,
        success_ar: 'تم الاضافة بنجاح',
        success_en: 'added successfully',
      });
    },
  );

// @desc    Delete review or comment
// @route   DELETE /api/v1/{review or comment}/user/:id
// @access  Private (User)
export const deleteFromProductByUser = <T>(
  Model: Model<T>,
  modelType: string,
): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // 1- get id for review or comment from params
      const { id } = req.params;
      // 2- get id for user from token
      const { _id } = req.user! as IUser;
      // 3- delete review or comment
      const doc = await Model.findOneAndDelete({
        _id: id,
        user: _id,
      });

      // 4- check if review or comment not exist
      if (!doc) {
        return next(
          new ApiError(
            {
              en: 'Not Found',
              ar: 'غير موجود',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }

      // 5- update the ratings for product
      if (modelType === 'review') {
        const review = await Review.findOne({ _id: id, user: _id });
        updateRating(review?.product);
      }

      // 6- send response
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        data: doc,
        success_ar: 'تم حذف بنجاح',
        success_en: 'deleted successfully',
      });
    },
  );

// @desc    Update review or comment
// @route   PUT /api/v1/{review or comment}/user/:id
// @access  Private (User)
export const updateForProductByUser = <T>(
  Model: Model<T>,
  modelType: string,
): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // 1- get id for review or comment from params
      const { id } = req.params;
      // 2- get id for user from token
      const { _id } = req.user! as IUser;

      // 3- update review or comment
      const doc = await Model.findOneAndUpdate(
        {
          _id: id,
          user: _id,
        },
        req.body,
        { new: true },
      );

      // 4- check if review or comment not exist
      if (!doc) {
        return next(
          new ApiError(
            {
              en: 'Not Found',
              ar: 'غير موجود',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }

      // 5- update the ratings for product
      if (modelType === 'review') {
        const review = await Review.findOne({ _id: id, user: _id });
        updateRating(review?.product);
      }

      // 6- send response
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        data: doc,
        success_ar: 'تم تعديل التقييم بنجاح',
        success_en: 'Review updated successfully',
      });
    },
  );

// @desc    admin delete review or comment
// @route   DELETE /api/v1/{review or comment}/admin/:id
// @access  Private (Admin)
export const adminDeleteFromProduct = <T>(
  Model: Model<T>,
  modelType: string,
): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // 1- get id for review or comment from params
      const { id } = req.params;
      // 2- find and delete review or comment
      const doc = await Model.findOneAndDelete({ _id: id });

      // 3- check if review or comment not exist
      if (!doc) {
        return next(
          new ApiError(
            {
              en: 'Not Found',
              ar: 'غير موجود',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }

      // 4- calculate rating for product
      if (modelType === 'review') {
        const review = await Review.findOne({ _id: id });
        updateRating(review?.product);
      }

      // 5- update the ratings for product
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        data: doc,
        success_ar: 'تم حذف بنجاح',
        success_en: 'deleted successfully',
      });
    },
  );

// @desc    Get all review or comment for a product
// @route   GET /api/v1/{review or comment}/product/:productId
// @access  Public
export const getAllForProduct = <T>(
  Model: Model<T>,
  populate: string[] = [''],
): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response /*, next: NextFunction*/) => {
      // 1- get productId from params
      const { productId } = req.params;

      // 2- get all reviews or comments for this product
      const query = req.query as IQuery;
      const mongoQuery = Model.find({ product: productId });

      if (populate.length > 0 && populate[0] !== '') {
        query.populate =
          query?.populate && query?.populate?.length > 0
            ? query.populate?.concat(populate.join(','))
            : populate.join(',');
      }

      // 3- create pagination
      const { data, paginationResult } = await new ApiFeatures(
        mongoQuery,
        query,
      )
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();

      // 4- send response
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        length: data.length,
        paginationResult,
        data: data,
        success_ar: 'تم بنجاح',
        success_en: 'retrieved successfully',
      });
    },
  );

// @desc    Get all for a user
// @route   GET /api/v1/{review or comment}/user/:userId
// @access  Private
export const getAllForUser = <T>(Model: Model<T>): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response /*, next: NextFunction*/) => {
      // 1- get userId from params
      const { userId } = req.params;

      // 2- get all reviews or comments for this user
      const query = req.query as IQuery;
      const mongoQuery = Model.find({ user: userId });

      // 3- create pagination
      const { data, paginationResult } = await new ApiFeatures(
        mongoQuery,
        query,
      )
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();

      // 5- send response
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        length: data.length,
        paginationResult,
        data: data,
        success_ar: 'تم بنجاح',
        success_en: 'retrieved successfully',
      });
    },
  );

// @desc    Get all review or comment
// @route   GET /api/v1/{review or comment}
// @access  Private (Admin)
export const getAll = <T>(Model: Model<T>): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response /*, next: NextFunction*/) => {
      // 1- find all reviews or comments from model
      const query = req.query as IQuery;
      const mongoQuery = Model.find();

      // 2- create pagination
      const { data, paginationResult } = await new ApiFeatures(
        mongoQuery,
        query,
      )
        .populate()
        .filter()
        .limitFields()
        .search()
        .sort()
        .paginate();

      // 4- send response
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        length: data.length,
        paginationResult,
        data: data,
        success_ar: 'تم بنجاح',
        success_en: 'retrieved successfully',
      });
    },
  );
