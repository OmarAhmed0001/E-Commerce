import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { Brand } from '../models/brand.model';
import { SubCategory } from '../models/subCategory.model';
import ApiError from '../utils/ApiError';
import { createMetaData, deleteMetaData } from '../utils/MetaData';
import { Meta } from '../models/meta.model';
import { Status } from '../interfaces/status/status.enum';
import { IMeta } from '../interfaces/meta/meta.interface';

import { getAllItems, getOneItemById } from './factory.controller';

// @desc    Get All Brands
// @route   POST /api/v1/brands
// @access  Private (Admin)
export const getAllBrands = getAllItems(Brand);

// @desc    Get Specific Brand By Id
// @route   POST /api/v1/brands/:id
// @access  Private (Admin)
export const getBrandById = getOneItemById(Brand);

// @desc    Create New Brand
// @route   POST /api/v1/brands
// @access  Private (Admin)
export const createBrand = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // 1- get data from body
    const { name_en, name_ar, desc_en, desc_ar, image, subCategory } = req.body;

    // 2- check if subCategory already exist and get number of Brands that exist in it subCategory

    // 4- create Brand inside specific SubCategory in mongooseDB
    const newBrand = await Brand.create({
      name_en,
      name_ar,
      image,
      desc_en,
      desc_ar,
      subCategory,
    });

    // 5- create MetaData for subCategory
    const reference = newBrand._id;
    let dataRes = {
      newBrand,
      MetaData: {},
    };
    if (req.body.title_meta && req.body.desc_meta) {
      const MetaData = (await createMetaData(req, reference)) as IMeta;
      await newBrand.updateOne({ metaDataId: MetaData._id });
      dataRes = {
        newBrand,
        MetaData,
      };
    }

    // 6- increment brandsCount in SubCategory
    await SubCategory.updateOne(
      { _id: subCategory },
      { $inc: { brandsCount: 1 } },
    );

    // 7- send response
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: dataRes,
      success_en: 'Successfully',
      success_ar: 'تم بنجاح',
    });
  },
);

// @desc    Update Brand By Id
// @route   POST /api/v1/brands/:id
// @access  Private (Admin)
export const updateBrand = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get id for item from params
    const { id } = req.params;

    // 2- find Brand already exist in mongooseDB
    const brand = await Brand.findById(id);
    if (!brand) {
      return next(
        new ApiError(
          {
            en: `Not Found Any Result For This Id ${id}`,
            ar: `${id}لا يوجداي نتيجة لهذا`,
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 3- check if Meta already exist
    const exist = await Meta.findOne({ reference: id });
    if (!exist && req.body.title_meta && req.body.desc_meta) {
      const newMeta = (await createMetaData(req, id)) as IMeta;
      await Brand.findByIdAndUpdate(
        id,
        { metaDataId: newMeta._id, ...req.body },
        { new: true },
      );
    } else if (exist && req.body.title_meta && req.body.desc_meta) {
      await Meta.updateOne(
        { reference: id },
        { title_meta: req.body.title_meta, desc_meta: req.body.desc_meta },
      );
      await Brand.findByIdAndUpdate(id, { ...req.body }, { new: true });
    } else {
      await Brand.findByIdAndUpdate(id, { ...req.body }, { new: true });
    }

    // 4- get updated document and populate it
    const document = await Brand.findById(id).populate('metaDataId');

    // 5- increment brandsCount in Subcategory
    if (req.body.brand && !brand.subCategory) {
      await SubCategory.updateOne(
        { _id: req.body.subCategory },
        { $inc: { brandsCount: 1 } },
      );
    }
    // 6- send response
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: document,
      success_en: 'updated successfully',
      success_ar: 'تم التعديل بنجاح',
    });
  },
);

// @desc    Delete Brand By Id
// @route   POST /api/v1/brands/:id
// @access  Private (Admin)
export const deleteBrand = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get id from params
    const { id } = req.params;

    // 2- check if brand contained any products

    const deleted = await deleteMetaData(id);
    if (deleted) {
      // 4- delete subcategory by id from mongooseDB
      const deletedBrand = await Brand.findByIdAndDelete(id);
      // 3- increment subCategoryCount in Category
      await SubCategory.updateOne(
        { _id: deletedBrand?.subCategory },
        { $inc: { brandsCount: -1 } },
      );
    } else {
      return next(
        new ApiError(
          {
            en: `this Brand can't be deleted because MetaData has not  deleted`,
            ar: `لا يمكن حذف هذة الماركة لأنها لم تحذف معلوماتها الوصفية`,
          },
          StatusCodes.FAILED_DEPENDENCY,
        ),
      );
    }

    // 5- send response
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      success_en: 'Deleted Successfully',
      success_ar: 'تم الحذف بنجاح',
    });
  },
);
