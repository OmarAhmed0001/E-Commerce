// Packages Imports
import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

// Interfaces Imports
import { IUser } from '../interfaces/user/user.interface';
import { IQuery } from '../interfaces/factory/factory.interface';
import { Status } from '../interfaces/status/status.enum';
// Utils Imports
import { ApiFeatures } from '../utils/ApiFeatures';
import ApiError from '../utils/ApiError';
import {
  createNotification as createNotificationUtil,
  createNotificationAll as createNotificationAllUtil,
} from '../utils/notification';
// Models Imports
import { Notification } from '../models/notification.model';

// Factory Imports
import {
  getAllItems,
  getOneItemById,
  updateOneItemById,
  deleteOneItemById,
} from './factory.controller';

// @desc     Get All Notifications
// @route    GET /api/v1/notifications
// @access   Private
export const getAllNotifications = getAllItems(Notification);

// @desc     Get Notification By Id
// @route    GET /api/v1/notifications/:id
// @access   Private
export const getNotification = getOneItemById(Notification);

// @desc     Create New Notification
// @route    POST /api/v1/notifications
// @access   Private
export const createNotification = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { title, message, receiver } = req.body;
    const sender = (req.user as IUser)?._id; // add type guard to check if req.user exists
    const notification = await createNotificationUtil(
      title,
      message,
      sender.toString(),
      receiver,
    );
    // Broadcast the notification to all connected clients
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: notification,
      success_en: 'created successfully',
      success_ar: 'تم الانشاء بنجاح',
    });
  },
);

// @desc     Update Notification By Id
// @route    PUT /api/v1/notifications/:id
// @access   Private
export const updateNotification = updateOneItemById(Notification);

// @desc     Delete Notification
// @route    DELETE /api/v1/notifications/:id
// @access   Private
export const deleteNotification = deleteOneItemById(Notification);

// @desc     Create Notification  For All Users
// @route    POST /api/v1/notifications/all
// @access   Private
export const createNotificationAll = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { title, message, role, link } = req.body;
    const sender = (req.user as IUser)?._id; // add type guard to check if req.user exists
    // Broadcast the notification to all connected clients
    //io.emit(receiver, notification);
    const notification = await createNotificationAllUtil(
      title,
      message,
      sender.toString(),
      role,
      link,
    );
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: notification,
      success_en: 'created successfully',
      success_ar: 'تم الانشاء بنجاح',
    });
  },
);

// @desc     Mark Notification As Read
// @route    PUT /api/v1/notifications/read/:id
// @access   Private
export const markNotificationAsRead = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Update the notification by its ID to set 'read' to true
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true },
    );
    // 3- check if document not found
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: notification,
      message: 'Notification marked as read',
      success_en: 'updated successfully',
      success_ar: 'تم التعديل بنجاح',
    });
  },
);

// @desc     Get Unread Notifications By User
// @route    GET /api/v1/notifications/unread
// @access   Private
export const getUnreadNotificationsByUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Create an instance of ApiFeatures
    const { data, paginationResult } = await new ApiFeatures(
      Notification.find({ read: false, receiver: (req.user as IUser)?._id }),
      req.query as IQuery,
    )
      .filter()
      .search()
      .sort()
      .limitFields()
      .populate()
      .paginate();
    // Return the paginated result
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
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      results: data.length,
      paginationResult,
      data,
      success_en: 'found successfully',
      success_ar: 'تم العثور بنجاح',
    });
  },
);

// @desc     Get All Notifications By User
// @route    GET /api/v1/notifications/all
// @access   Private
export const getAllNotificationsByUser = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Create an instance of ApiFeatures
    const { data, paginationResult } = await new ApiFeatures(
      Notification.find({ receiver: (req.user as IUser)?._id }),
      req.query as IQuery,
    )
      .filter()
      .search()
      .sort()
      .limitFields()
      .populate()
      .paginate();
    // Return the paginated result
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
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      results: data.length,
      paginationResult,
      data,
      success_en: 'found successfully',
      success_ar: 'تم العثور بنجاح',
    });
  },
);
