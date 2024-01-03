import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

// Models
import { Category } from '../models/category.model';
import { SubCategory } from '../models/subCategory.model';
import { Meta } from '../models/meta.model';
// Interfaces
import { Status } from '../interfaces/status/status.enum';
import { IMeta } from '../interfaces/meta/meta.interface';
import { IQuery } from '../interfaces/factory/factory.interface';
// Utils
import ApiError from '../utils/ApiError';
import { ApiFeatures } from '../utils/ApiFeatures';
import { createMetaData, deleteMetaData } from '../utils/MetaData';

// Factory Controllers
import { getAllItems, getOneItemById } from './factory.controller';

// @desc    Get All SubCategories
// @route   GET /api/v1/subCategories
// @access  Public
export const getAllSubCategories = getAllItems(SubCategory, ['metaDataId']);

// @desc Get SubCategory By Id
// @route GET /api/v1/subCategories/:id
// @access Public
export const getSubCategoryById = getOneItemById(SubCategory, ['metaDataId']);

// @desc Get All SubCategories belong to specific category
// @route GET /api/v1/subCategories/forSpecificCategory/:categoryId
// @access Public
export const getAllSubCategoriesByCategoryId = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get id from params
    const { categoryId } = req.params;

    // 2- get all subcategories belong to specific category from mongooseDB
    const query = req.query as IQuery;
    const mongoQuery = SubCategory.find({ category: categoryId });

    // 3- create pagination
    const { data, paginationResult } = await new ApiFeatures(mongoQuery, query)
      .populate()
      .filter()
      .limitFields()
      .search()
      .sort()
      .paginate();
    if (data.length === 0) {
      return next(
        new ApiError(
          {
            en: 'not found',
            ar: 'غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 5- send response
    res.status(200).json({
      status: Status.SUCCESS,
      length: data.length,
      paginationResult,
      data: data,
      success_en: 'Successfully',
      success_ar: 'تم بنجاح',
    });
  },
);

// @desc Create subcategory inside specific category
// @route POST /api/v1/subCategories/:categoryId
// @access Private (Admin)
export const createSubCategory = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // 1- get data from body
    const { name_en, name_ar, image, category } = req.body;

    // 4- create subcategory inside specific category in mongooseDB
    const newSubCategory = await SubCategory.create({
      name_en,
      name_ar,
      image,
      category,
    });

    // 5- create MetaData for subCategory
    const reference = newSubCategory._id;
    let dataRes = {
      newSubCategory,
      MetaData: {},
    };
    if (req.body.title_meta && req.body.desc_meta) {
      const MetaData = (await createMetaData(req, reference)) as IMeta;
      await newSubCategory.updateOne({ metaDataId: MetaData._id });
      dataRes = {
        newSubCategory,
        MetaData,
      };
    }

    // 6- increment subCategoryCount in Category
    await Category.updateOne(
      { _id: category },
      { $inc: { subCategoriesCount: 1 } },
    );

    // 7- send response
    res.status(201).json({
      status: 'success',
      data: dataRes,
      success_en: 'Successfully',
      success_ar: 'تم بنجاح',
    });
  },
);

// @desc Update specific subcategory using id
// @route PUT /api/v1/subCategories/:id
// @access Private (Admin)
export const updateSubCategoryById = expressAsyncHandler(
  async (req: Request, res: Response) => {
    // 1- get id for item from params
    const { id } = req.params;

    // 2- check if Meta already exist
    const exist = await Meta.findOne({ reference: id });
    if (!exist && req.body.title_meta && req.body.desc_meta) {
      const newMeta = (await createMetaData(req, id)) as IMeta;
      await SubCategory.findByIdAndUpdate(
        id,
        { metaDataId: newMeta._id, ...req.body },
        { new: true },
      );
    } else if (exist && req.body.title_meta && req.body.desc_meta) {
      await Meta.updateOne(
        { reference: id },
        { title_meta: req.body.title_meta, desc_meta: req.body.desc_meta },
      );
      await SubCategory.findByIdAndUpdate(id, { ...req.body }, { new: true });
    } else {
      await SubCategory.findByIdAndUpdate(id, { ...req.body }, { new: true });
    }

    // 4- get updated document and populate it
    const document = await SubCategory.findById(id).populate('metaDataId');

    // 5- send response
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: document,
      success_en: 'updated successfully',
      success_ar: 'تم التعديل بنجاح',
    });
  },
);

// @desc Delete specific subcategory By Id
// @route DELETE /api/v1/subCategories/:id
// @access Private (Admin)
export const deleteSubCategoryById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get id from params
    const { id } = req.params;

    const deleted = await deleteMetaData(id);
    if (deleted) {
      // 4- delete subcategory by id from mongooseDB
      const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

      // 3- increment subCategoryCount in Category
      await Category.updateOne(
        { _id: deletedSubCategory?.category },
        { $inc: { subCategoriesCount: -1 } },
      );
    } else {
      return next(
        new ApiError(
          {
            en: "this subcategory can't be deleted because MetaData has not  deleted",
            ar: 'لا يمكن حذف هذا التصنيف الفرعي لأن البيانات الوصفية لم يتم حذفها',
          },
          StatusCodes.FAILED_DEPENDENCY,
        ),
      );
    }

    // 5- send response
    res.status(200).json({
      status: 'success',
      success_en: 'Deleted Successfully',
      success_ar: 'تم الحذف بنجاح',
    });
  },
);
