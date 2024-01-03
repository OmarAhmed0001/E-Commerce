import { Router } from 'express';

// import { validate } from "../middlewares/validation.middleware";
import { protectedMiddleware } from '../middlewares/protected.middleware';
import {
  createNotificationValidator,
  markNotificationAsReadValidator,
} from '../validations/notification.validator';
import {
  getAllNotifications,
  createNotification,
  deleteNotification,
  markNotificationAsRead,
  createNotificationAll,
  getUnreadNotificationsByUser,
  getAllNotificationsByUser,
  updateNotification,
} from '../controllers/notification.controller';

const notificationRoute = Router();

notificationRoute
  .route('/')
  .get(protectedMiddleware, getAllNotifications)
  .post(protectedMiddleware, createNotificationValidator, createNotification);

notificationRoute
  .route('/:id')
  .put(
    protectedMiddleware,
    // validate(putNotificationValidation),
    updateNotification,
  )
  .delete(protectedMiddleware, deleteNotification);

notificationRoute
  .route('/read/:id')
  .put(
    protectedMiddleware,
    markNotificationAsReadValidator,
    markNotificationAsRead,
  );

notificationRoute
  .route('/all')
  .get(protectedMiddleware, getAllNotificationsByUser)
  .post(
    protectedMiddleware,
    createNotificationValidator,
    createNotificationAll,
  );

notificationRoute
  .route('/unread')
  .get(protectedMiddleware, getUnreadNotificationsByUser);

export default notificationRoute;
