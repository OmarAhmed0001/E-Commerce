import mongoose, { Schema } from 'mongoose';

import { INotification } from '../interfaces/notification/notification.interface';
const notificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema,
);
