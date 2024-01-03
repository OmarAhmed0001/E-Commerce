import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { AnalyticsMeta } from '../models/analyticsMeta.model';
import { Status } from '../interfaces/status/status.enum';

import {
  getAllItems,
  getOneItemById,
  deleteOneItemById,
} from './factory.controller';

// @desc     Get All Analytics Meta
// @route    Get/api/v1/analyticsMeta
// @access   Private (Admins)
export const getAllAnalyticsMeta = getAllItems(AnalyticsMeta);

// @desc     Get  Analytics Meta By Id
// @route    Get/api/v1/analyticsMeta/:id
// @access   Private (Admins)
export const getAnalyticsMeta = getOneItemById(AnalyticsMeta);

// @desc     Create Analytics Meta
// @route    Post/api/v1/analyticsMeta
// @access   Private (Admins)
export const createAnalyticsMeta = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const AnalyticsMetaExist = await AnalyticsMeta.findOne({
      key: req.body.key,
    });
    if (AnalyticsMetaExist) {
      const other = await AnalyticsMeta.findByIdAndUpdate(
        AnalyticsMetaExist?._id,
        { ...req.body },
        { new: true },
      );

      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        data: other,
        success_en: 'updated successfully',
        success_ar: 'تم التعديل بنجاح',
      });
    } else {
      const newOther = new AnalyticsMeta({ ...req.body });
      await newOther.save();
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        data: newOther,
        success_en: 'created successfully',
        success_ar: 'تم الانشاء بنجاح',
      });
    }
  },
);

// @desc     Delete Analytics Meta By Id
// @route    Delete/api/v1/analyticsMeta/:id
// @access   Private (Admins)
export const deleteAnalyticsMeta = deleteOneItemById(AnalyticsMeta);
