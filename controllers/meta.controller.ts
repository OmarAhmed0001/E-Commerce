import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { Meta } from '../models/meta.model';
import { Status } from '../interfaces/status/status.enum';

import {
  getAllItems,
  getOneItemById,
  updateOneItemById,
} from './factory.controller';

// @desc    Get All Metas
// @route   POST /api/v1/metas
// @access  public (Admin)
export const getAllMetas = getAllItems(Meta);

// @desc    Get Specific Meta By Id
// @route   POST /api/v1/metas/:id
// @access  Private (Admin)
export const getMetaById = getOneItemById(Meta);

// @desc    Update Meta By Id
// @route   POST /api/v1/metas/:id
// @access  Private (Admin)
export const updateMeta = updateOneItemById(Meta);

// @desc    Get Meta By Refrence
// @route   POST /api/v1/metas/:id
// @access  public (Admin)
export const getMetaByRefrence = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const MetaRefre = await Meta.findOne({ reference: req.params.id });
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      Meta: MetaRefre,
      success_en: 'found successfully',
      success_ar: 'تم العثور بنجاح',
    });
  },
);
