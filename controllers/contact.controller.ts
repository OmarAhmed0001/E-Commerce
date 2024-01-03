import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Contact } from '../models/contact.model';
import { Status } from '../interfaces/status/status.enum';
import { IUser } from '../interfaces/user/user.interface';
import { createNotificationAll } from '../utils/notification';
import ApiError from '../utils/ApiError';

import {
  getAllItems,
  getOneItemById,
  deleteOneItemById,
} from './factory.controller';

// @desc    Get All Messages
// @route   GET /api/v1/contacts
// @access  Private (Admins)
export const getAllMessages = getAllItems(Contact);

// @desc    Get Message By Id
// @route   GET /api/v1/contacts/:id
// @access  Private (Admins)
export const getMessageById = getOneItemById(Contact);

// @desc    Create New Message
// @route   POST /api/v1/contacts
// @access  Private (Users)
export const createMessage = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- take data from request body
    const data = req.body;

    // 2- create new document in mongooseDB
    const document = await Contact.create(data);

    // send notification to all users
    const messageNotification = `New Complaint Created By ${document.name} With Email ${document.email}`;
    let link = '';
    if (document.contactType === 'customerService') {
      link = `${process.env.Dash_APP_URL}/technicalSupport`;
    } else {
      link = `${process.env.Dash_APP_URL}/contactRequests`;
    }
    const sender = ((req.user as IUser)?.id ?? '').toString(); // add type guard to check if req.user exists and use nullish coalescing operator
    const { name } = req.body;
    const title = `${name} Contacted Us`;

    let notification = {};
    if (title && messageNotification && sender && link) {
      notification = await createNotificationAll(
        title,
        messageNotification,
        sender,
        ['rootAdmin', 'adminA', 'adminB', 'adminC', 'subAdmin'],
        link,
      );
      if (notification === -1) {
        return next(
          new ApiError(
            {
              en: 'notification not created',
              ar: 'لم يتم إنشاء الإشعار',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
    }

    ////////////////////////////////

    // 3- send response
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: document,
      notification,
      success_en: 'created successfully',
      success_ar: 'تم الانشاء بنجاح',
    });
  },
);

// @desc    Delete Message By Id
// @route   DELETE /api/v1/contacts/:id
// @access  Private (Admins)
export const deleteMessage = deleteOneItemById(Contact);

// @desc    Toggle Message To Opened It
// @route   DELETE /api/v1/contacts/:id
// @access  Private (Admins)
export const toggleMessage = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    const { id } = req.params;
    // update isopend to true

    const contact = await Contact.findByIdAndUpdate(
      { _id: id },
      { isOpened: true },
      { new: true },
    );

    res.status(200).json({
      status: 'success',
      data: contact,
      success_en: 'updated successfully',
      success_ar: 'تم التحديث بنجاح',
    });
  },
);
