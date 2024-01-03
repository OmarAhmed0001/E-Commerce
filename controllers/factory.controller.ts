// Packages NPM Imports
import { NextFunction, Response, Request, RequestHandler } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { Model } from 'mongoose';
import { StatusCodes } from 'http-status-codes';

// Interfaces Imports
import { IQuery } from '../interfaces/factory/factory.interface';
import { Status } from '../interfaces/status/status.enum';
// Models Imports
import { Meta } from '../models/meta.model';
// Utils Imports
import ApiError from '../utils/ApiError';
import { ApiFeatures } from '../utils/ApiFeatures';
// import { IUser } from '../interfaces/user/user.interface';

// @desc    Get All Items
// @route   GET /api/v1/......
// @access  Public
export const getAllItems = <T>(
  Model: Model<T>,
  populate: string[] = [''],
  fields: string = '-__v',
): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      //  1- find all data
      const query = req.query as IQuery;
      const mongoQuery = Model.find({}).select(fields);

      if (populate.length > 0 && populate[0] !== '') {
        query.populate =
          query?.populate && query?.populate?.length > 0
            ? query.populate?.concat(populate.join(','))
            : populate.join(',');
      }

      // 2- get features
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

      // 3- get features
      if (data.length === 0) {
        return next(
          new ApiError(
            {
              en: 'not found',
              ar: 'لا يوجد اي نتيجة',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }

      let categoryMeta;
      let subcategoryMeta;
      if (query && (query.category || query.subcategory)) {
        categoryMeta = await Meta.findOne({ reference: query.category });
        subcategoryMeta = await Meta.findOne({ reference: query.subcategory });
      }
      const MetaData = {
        categoryMeta,
        subcategoryMeta,
      };

      // 5- send response
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        results: data.length,
        paginationResult,
        data: data,
        MetaData,
        success_en: 'found successfully',
        success_ar: 'تم العثور بنجاح',
      });
    },
  );

// @desc    Get Specific Item By Id
// @route   GET /api/v1/......
// @access  Public
export const getOneItemById = <T>(
  Model: Model<T>,
  populate: string[] = [''],
  fields: string = '-__v ',
): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // 1- get id of item from params
      const { id } = req.params;

      // 2- find document from mongooseDB
      const query = Model.findById(id).select(fields);
      // const roles: string[] = [
      //   'rootAdmin',
      //   'adminA',
      //   'adminB',
      //   'adminC',
      //   'subAdmin',
      // ];
      // if (Model.modelName === 'Product') {
      //   if (req.user) {
      //     if (!roles.includes((req.user as IUser).role)) {
      //       fields = fields.concat(' -link');
      //       query = Model.findById(id).select(fields).lean();
      //       // execute the query and do something with the result...
      //     }
      //   }
      // }
      // 3- get document
      const document =
        populate?.length > 0 && populate[0] !== ''
          ? await query.populate(populate)
          : await query;

      // 4- check if document not found
      if (!document) {
        return next(
          new ApiError(
            {
              en: `Not Found Any Result For This Id: ${id}`,
              ar: `${id} : id لا يوجد اي نتيجة بهذا باستخدم`,
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }

      // 5- send response
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        data: document,
        success_en: 'found successfully',
        success_ar: 'تم العثور بنجاح',
      });
    },
  );

// @desc    Create New Item
// @route   POST /api/v1/......
// @access  Private
export const createNewItem = <T>(Model: Model<T>): RequestHandler =>
  expressAsyncHandler(
    async (
      req: Request,
      res: Response /*, next: NextFunction*/,
    ): Promise<void> => {
      // 1- take data from request body
      const data = req.body;

      // 2- create new document in mongooseDB
      const document = await Model.create(data);

      // 3- send response
      res.status(StatusCodes.CREATED).json({
        status: Status.SUCCESS,
        data: document,
        success_en: 'created successfully',
        success_ar: 'تم الانشاء بنجاح',
      });
    },
  );

// @desc    Update Specific Item
// @route   PUT    /api/v1/.....
// @access  Private
export const updateOneItemById = <T>(
  Model: Model<T>,
  populate: string[] = [''],
): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // 1- get id for item from params
      const { id } = req.params;
      //console.log('req.body', req.body);
      // 2- find item and update in mongooseDB
      const query = Model.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      //console.log('query', query);

      // 3- get document
      const document =
        populate?.length > 0 && populate[0] !== ''
          ? await query.populate(populate)
          : await query;
      //console.log('document', document);
      // 3- check if document not found
      if (!document) {
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

      // 4- save update
      document.save();

      // 5- send response
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        data: document,
        success_en: 'updated successfully',
        success_ar: 'تم التعديل بنجاح',
      });
    },
  );

// @desc    Delete Specific Item
// @route   DELETE    /api/v1/.....
// @access  Private
export const deleteOneItemById = <T>(Model: Model<T>): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // 1- get id for item from params
      const { id } = req.params;

      // 2- find item and delete in mongooseDB
      const document = await Model.findByIdAndDelete(id);

      // 3- check if item deleted
      if (!document) {
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

      // 4- send response
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        success_en: 'deleted successfully',
        success_ar: 'تم الحذف بنجاح',
      });
    },
  );
