import { StatusCodes } from 'http-status-codes';

import { Notification } from '../models/notification.model';
// import { io } from "../config/io_connection";
import { io } from '../index';
import { User } from '../models/user.model';
import { Status } from '../interfaces/status/status.enum';

import ApiError from './ApiError';

export const createNotification = async (
  title: string,
  message: string,
  sender: string,
  receiver: string,
): Promise<object | number> => {
  try {
    let notification = {};
    const receivers = receiver.split(',');
    for (const receiver of receivers) {
      notification = await Notification.create({
        title,
        message,
        sender,
        receiver: receiver.toString(),
      });
      io.emit(receiver.toString(), notification);
    }
    notification = {
      title,
      message,
      sender,
      receiver,
    };
    return notification; // Continue to the next middleware or route
  } catch (error) {
    return -1; // Pass any errors to the error-handling middleware
  }
};

export const createNotificationAll = async (
  title: string,
  message: string,
  sender: string,
  role: string[],
  link: string,
): Promise<object | number> => {
  try {
    const users = await User.find({ role: { $in: role } });
    // Access the WebSocket server from the request object
    // Create notifications for each user and emit to WebSocket
    let notification = {};
    for (const user of users) {
      notification = await Notification.create({
        title,
        message,
        sender,
        receiver: user._id.toString(),
        link,
      });
      io.emit(user._id.toString(), notification);
    }
    notification = {
      title,
      message,
      sender,
      reciever: 'all',
      link,
    };

    return notification; // Continue to the next middleware or route
  } catch (error) {
    return -1; // Pass any errors to the error-handling middleware
  }
};

export const markNotificationAsReadSocket = async (
  Id: string,
): Promise<object> => {
  // Update the notification by its ID to set 'read' to true
  const notification = await Notification.findByIdAndUpdate(
    Id,
    { read: true },
    { new: true },
  );
  // 3- check if document not found
  if (!notification) {
    return new ApiError(
      {
        en: `Not Found Any Result For This Id ${Id}`,
        ar: `${Id}لا يوجداي نتيجة لهذا`,
      },
      StatusCodes.NOT_FOUND,
    );
  }
  io.emit('updateNotification', notification);
  return {
    status: Status.SUCCESS,
    data: notification,
    message: 'Notification marked as read',
    success_en: 'updated successfully',
    success_ar: 'تم التعديل بنجاح',
  };
};
