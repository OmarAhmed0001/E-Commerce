import expressAsyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Offer } from '../models/offer.model';
import { Product } from '../models/product.model';
import { Status } from '../interfaces/status/status.enum';
import ApiError from '../utils/ApiError';

import { getAllItems, getOneItemById } from './factory.controller';

// @desc    Get All Offers
// @route   Get /api/v1/offers
// @access  Private (User)
export const getAllOffers = getAllItems(Offer);

// @desc    Get Specific Offer By Id
// @route   Get /api/v1/offers/:id
// @access  Private (User)
export const getOneOfferById = getOneItemById(Offer);

// @desc    Add New Offer
// @route   POST /api/v1/offers
// @access  Private (User)
export const createOffer = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // 1- get data from body
    const { percentage, discountDepartment } = req.body;

    // 2- create new offer
    const newOffer = await Offer.create(req.body);

    // 3- using bulkOption to add this offer to all products
    let data;
    switch (discountDepartment.key) {
      case 'products':
        data = await Product.find({
          _id: [...discountDepartment.value],
        });
        break;
      case 'categories':
        data = await Product.find({
          category: [...discountDepartment.value],
        });
        break;
      case 'subcategory':
        data = await Product.find({
          subcategory: [...discountDepartment.value],
        });
        break;
      default:
        data = await Product.find({});
        break;
    }

    if (
      (discountDepartment.key === 'products' ||
        discountDepartment.key === 'categories' ||
        discountDepartment.key === 'subcategory' ||
        discountDepartment.key === 'allProducts') &&
      new Date(req.body.startDate).getTime() <= Date.now() &&
      Date.now() < new Date(req.body.endDate).getTime()
    ) {
      const bulkOption = data.map((item) => ({
        updateOne: {
          filter: { _id: item._id, priceBeforeDiscount: { $gt: 1 } },
          update: {
            $set: {
              offer: newOffer._id,
              priceAfterDiscount:
                item.priceBeforeDiscount -
                (item.priceBeforeDiscount * percentage) / 100,
            },
          },
        },
      }));
      await Product.bulkWrite(bulkOption, {});
    }

    // 4- return response
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: newOffer,
      success_en: 'created successfully',
      success_ar: 'تم الإنشاء بنجاح',
    });
  },
);

// @desc    Update Specific Offer By Id
// @route   PUT /api/v1/offers/:id
// @access  Private (User)
export const updateOffer = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // 1- get data from body
    const { percentage, discountDepartment } = req.body as {
      percentage: number;
      discountDepartment: { key: string; value: string[] };
    };

    // 3- update offer
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );
    // using bulkOption to add this offer to all products

    const products = await Product.find({ offer: req.params.id });

    if (
      new Date(req.body.startDate).getTime() <= Date.now() &&
      Date.now() < new Date(req.body.endDate).getTime() &&
      products.length > 0
    ) {
      const bulkOption = products.map((item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              priceAfterDiscount:
                item.priceBeforeDiscount -
                (item.priceBeforeDiscount * percentage) / 100,
            },
          },
        },
      }));
      await Product.bulkWrite(bulkOption, {});
    } else if (
      new Date(req.body.startDate).getTime() <= Date.now() &&
      Date.now() < new Date(req.body.endDate).getTime() &&
      products.length === 0
    ) {
      let data;
      switch (discountDepartment.key) {
        case 'products':
          data = await Product.find({
            _id: [...discountDepartment.value],
          });
          break;
        case 'categories':
          data = await Product.find({
            category: [...discountDepartment.value],
          });
          break;
        case 'subcategory':
          data = await Product.find({
            subcategory: [...discountDepartment.value],
          });
          break;
        default:
          data = await Product.find({});
          break;
      }
      const bulkOption = data.map((item) => ({
        updateOne: {
          filter: { _id: item._id, priceBeforeDiscount: { $gt: 1 } },
          update: {
            $set: {
              offer: req.params.id,
              priceAfterDiscount:
                item.priceBeforeDiscount -
                (item.priceBeforeDiscount * percentage) / 100,
            },
          },
        },
      }));
      await Product.bulkWrite(bulkOption, {});
    } else {
      const bulkOption = products.map((item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: {
            offer: '',
            $set: {
              priceAfterDiscount: 0,
            },
          },
        },
      }));
      await Product.bulkWrite(bulkOption, {});
    }

    // 4- return response
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: updatedOffer,
      success_en: 'updated successfully',
      success_ar: 'تم التعديل بنجاح',
    });
  },
);

// @desc    Delete Specific Offer By Id
// @route   DELETE /api/v1/offers/:id
// @access  Private (User)
export const deleteOffer = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- check if offer exist and delete it
    const offerDeleted = await Offer.findByIdAndDelete(req.params.id);
    if (!offerDeleted) {
      return next(
        new ApiError(
          {
            en: 'offer not found',
            ar: 'العرض غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 2- using bulkOption to remove this offer from all products
    const products = await Product.find({ offer: req.params.id });
    const bulkOption = products.map((item) => ({
      updateOne: {
        filter: { _id: item._id, offer: req.params.id },
        update: {
          $unset: { offer: '' },
          $set: { priceAfterDiscount: 0 },
        },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 3- return response
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      success_en: 'deleted successfully',
      success_ar: 'تم الحذف بنجاح',
    });
  },
);
