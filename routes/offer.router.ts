import { Router } from 'express';

import {
  getAllOffers,
  getOneOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offer.controller';
import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  createOfferValidation,
  updateOfferValidation,
} from '../validations/offer.validator';

const offerRouter = Router();

offerRouter.route('/').get(getAllOffers);

offerRouter.route('/:id').get(getOneOfferById);

offerRouter
  .route('/')
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    createOfferValidation,
    createOffer,
  );

offerRouter
  .route('/:id')
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    updateOfferValidation,
    updateOffer,
  );

offerRouter
  .route('/:id')
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteOffer,
  );

export default offerRouter;
