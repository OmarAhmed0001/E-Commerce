import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
// import { validate } from "../middlewares/validation.middleware";
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  addReviewToProduct,
  adminDeleteReview,
  deleteReview,
  getAllReviews,
  getAllReviewsForProduct,
  getAllReviewsForUser,
  updateReview,
} from '../controllers/review.controller';
import {
  createReviewToProductValidator,
  updateReviewToProductValidator,
} from '../validations/review.validator';

const reviewRouter = Router();

/// These routers for products
// @route     /api/v1/reviews/product/:productId
reviewRouter
  .route('/product/:productId')
  .post(
    protectedMiddleware,
    allowedTo(Role.USER),
    createReviewToProductValidator,
    addReviewToProduct,
  ) // user
  .get(getAllReviewsForProduct); // not

///// These routers for admin only
// @route    /api/v1/reviews/admin/:id => reviewId
reviewRouter
  .route('/admin/:id')
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    adminDeleteReview,
  ); //admin root admina adminb

// @route    /api/v1/reviews/admin
reviewRouter
  .route('/admin')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getAllReviews,
  ); //admin root admina adminb adminc subadmin

///////// These routers for user only
//  @route   /api/v1/reviews/user/userId
reviewRouter
  .route('/user/:userId')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getAllReviewsForUser,
  ); //admin root admina adminb adminc subadmin

//  @route   /api/v1/reviews/user/:id => reviewId
reviewRouter
  .route('/user/:id')
  .put(
    protectedMiddleware,
    allowedTo(Role.USER),
    updateReviewToProductValidator,
    updateReview,
  ) // user
  .delete(protectedMiddleware, allowedTo(Role.USER), deleteReview); // user

export default reviewRouter;
