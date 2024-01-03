import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

// Models
import { Section } from '../models/section.model';
import { Meta } from '../models/meta.model';
// Interfaces
import { IMeta } from '../interfaces/meta/meta.interface';
import { IQuery } from '../interfaces/factory/factory.interface';
import { Status } from '../interfaces/status/status.enum';
// Utils
import ApiError from '../utils/ApiError';
import { ApiFeatures } from '../utils/ApiFeatures';
import { createMetaData } from '../utils/MetaData';

// @desc    Get All Sections
// @route   GET /api/v1/sections
// @access  Public
export const getAllSections = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get all Querys
    //const filterationOptions = req.query.type ? { type: req.query.type } : {};

    // 2- Get all sections
    const query = req.query as IQuery;
    const mongoQuery = Section.find();

    query.populate =
      query?.populate && query?.populate?.length > 0
        ? query.populate?.concat('metaDataId')
        : 'metaDataId';

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
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      length: data.length,
      paginationResult,
      data: data,
      success_en: 'sections are fetched successfully',
      success_ar: 'تم جلب الأقسام بنجاح',
    });
  },
);

// @desc    Get Section By Id
// @route   GET /api/v1/sections/:id
// @access  Public
export const getSectionById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const section = await Section.findById(req.params.id).populate(
      'metaDataId',
    );
    if (!section) {
      return next(
        new ApiError(
          {
            en: 'Section is not existed or delete successfully',
            ar: 'القسم غير موجود أو تم حذفه',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    res.status(StatusCodes.CREATED).json({
      success_en: 'Section is successfully retrieved',
      success_ar: 'تم استرداد القسم بنجاح',
      data: section,
    });
  },
);

// @desc    Get Section By Name
// @route   GET /api/v1/sections/sectionName/:sectionName
// @access  Public
export const getSectionByName = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const section = await Section.findOne({ title_en: req.params.sectionName });
    if (!section) {
      return next(
        new ApiError(
          {
            en: 'Section is not existed or delete successfully',
            ar: 'القسم غير موجود أو تم حذفه',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    res.status(StatusCodes.CREATED).json({
      success_en: 'Section is successfully retrieved',
      success_ar: 'تم استرداد القسم بنجاح',
      data: section,
    });
  },
);

// @desc    Create Section
// @route   POST /api/v1/sections
// @access  Private (Root) TODO: add the rest of the roles
export const createSection = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const { type, alignment } = req.body;
    if (!type) {
      return next(
        new ApiError(
          { en: 'Type is required', ar: 'النوع مطلوب' },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    let filterationObject = {};
    if (type) {
      filterationObject = { type };
    }
    if (alignment) {
      filterationObject = { ...filterationObject, alignment };
    }

    if (
      type == 'banner' ||
      type == 'aboutus' ||
      type == 'privacy' ||
      type == 'usage' ||
      type == 'retrieval' ||
      type == 'public'
    ) {
      // CHECK IF THERE IS SECTION WITH THE SAME TYPE OR NOT
      const sectionExist = await Section.findOne(filterationObject);
      if (sectionExist) {
        //UPDATE WARNING
        const updateSection = await Section.findByIdAndUpdate(
          sectionExist._id,
          { ...req.body },
          { new: true },
        );
        if (!updateSection) {
          return next(
            new ApiError(
              { en: 'Section Cant Be Found', ar: 'لا يمكن العثور على القسم' },
              StatusCodes.BAD_REQUEST,
            ),
          );
        }
        let dataRes = {
          updateSection,
          MetaData: {},
        };
        if (req.body.title_meta && req.body.desc_meta) {
          const MetaData = (await createMetaData(
            req,
            sectionExist._id,
          )) as IMeta;
          await updateSection.updateOne({ metaDataId: MetaData._id });
          dataRes = {
            updateSection,
            MetaData,
          };
        }
        res.status(StatusCodes.CREATED).json({
          success_en: `Section ${type} updated Successfully `,
          success_ar: `${type} تم تحديث القسم بنجاح`,
          data: dataRes,
        });
      } else {
        const section = new Section({ ...req.body });
        section.save();

        const reference = section._id;
        let dataRes = {
          section,
          MetaData: {},
        };
        if (req.body.title_meta && req.body.desc_meta) {
          const MetaData = (await createMetaData(req, reference)) as IMeta;
          await section.updateOne({ metaDataId: MetaData._id });
          dataRes = {
            section,
            MetaData,
          };
        }

        res.status(StatusCodes.CREATED).json({
          success_en: 'Section Added Successfully',
          success_ar: 'تمت إضافة القسم بنجاح',
          data: dataRes,
        });
      }
    } else {
      const section = new Section({ ...req.body });
      section.save();
      res.status(StatusCodes.CREATED).json({
        success_en: 'Section Added Successfully',
        success_ar: 'تمت إضافة القسم بنجاح',
        data: section,
      });
    }
  },
);

// @desc    Update Section
// @route   PUT /api/v1/sections/:id
// @access  Private (Root) TODO: add the rest of the roles
export const updateSection = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- check if section exist
    const { id } = req.params;
    console.log(id);

    // 2- check if section exist
    const section = await Section.findById(id);
    console.log(section);
    if (!section) {
      return next(
        new ApiError(
          {
            en: "Section Cant Be Updated Cause it's not Found",
            ar: 'لا يمكن تحديث القسم لأنه غير موجود',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    // 3- check if meta already exist
    const exist = await Meta.findOne({ reference: id });
    if (!exist && req.body.title_meta && req.body.desc_meta) {
      const newMeta = (await createMetaData(req, id)) as IMeta;
      await Section.findByIdAndUpdate(
        id,
        { metaDataId: newMeta._id, ...req.body },
        { new: true },
      );
    } else if (exist && req.body.title_meta && req.body.desc_meta) {
      await Meta.updateOne(
        { reference: id },
        { title_meta: req.body.title_meta, desc_meta: req.body.desc_meta },
      );
      await Section.findByIdAndUpdate(id, { ...req.body }, { new: true });
    } else {
      await Section.findByIdAndUpdate(id, { ...req.body }, { new: true });
    }

    // 4- get updated document and populate it
    const document = await Section.findById(id).populate('metaDataId');

    // 5- send response
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: document,
      success_en: 'section updated successfully',
      success_ar: 'تم تحديث القسم بنجاح',
    });
  },
);

// @desc    Delete Section
// @route   DELETE /api/v1/sections/:id
// @access  Private (Root) TODO: add the rest of the roles
export const deleteSection = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get id for item from params
    const { id } = req.params;

    // 2- find item and delete in mongooseDB
    const section = await Section.findByIdAndDelete(id);

    // 3- check if item deleted
    if (!section) {
      return next(
        new ApiError(
          {
            en: `Not Found Any Section For This Id ${id}`,
            ar: `${id}لا يوجداي نتيجة لهذا`,
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 4- delete meta data
    await Meta.findOneAndDelete({ reference: id });

    // 4- send response
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      success_en: 'deleted successfully',
      success_ar: 'تم الحذف بنجاح',
    });
  },
);
