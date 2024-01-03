import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Subscriber } from '../models/subscriber.model';
import ApiError from '../utils/ApiError';

import {
  getAllItems,
  getOneItemById,
  updateOneItemById,
  deleteOneItemById,
} from './factory.controller';

export const getAllSubscriber = getAllItems(Subscriber);
export const getOneSubscriberById = getOneItemById(Subscriber);
export const createSubscriber = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const existSubscriber = await Subscriber.findOne(req.body);
    if (existSubscriber) {
      return next(
        new ApiError(
          {
            en: 'You are already subscribed',
            ar: 'أنت مشترك بالفعل',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    const subscriber = await Subscriber.create(req.body);
    res.status(201).json({
      status: 'success',
      data: subscriber,
      success_en: 'created successfully',
      success_ar: 'تم الانشاء بنجاح',
    });
  },
);
export const updateOneSubscriberById = updateOneItemById(Subscriber);
export const deleteOneSubscriberById = deleteOneItemById(Subscriber);
