import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  getAllSubscriber,
  getOneSubscriberById,
  createSubscriber,
  updateOneSubscriberById,
  deleteOneSubscriberById,
} from '../controllers/subscriber.controller';
import { createSubscriberValidator } from '../validations/subscriber.validation';

const subscriberRouter = Router();

subscriberRouter
  .route('/')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getAllSubscriber,
  );

subscriberRouter
  .route('/:id')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getOneSubscriberById,
  );

subscriberRouter.route('/').post(createSubscriberValidator, createSubscriber);

subscriberRouter
  .route('/:id')
  .put(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    updateOneSubscriberById,
  );

subscriberRouter
  .route('/:id')
  .delete(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    deleteOneSubscriberById,
  );

export default subscriberRouter;
