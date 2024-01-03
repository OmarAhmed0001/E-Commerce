import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
// import { validate } from "../middlewares/validation.middleware";
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  addCommentToProduct,
  adminDeleteComment,
  deleteComment,
  getAllComment,
  getAllCommentForProduct,
  getAllCommentForUser,
  updateComment,
} from '../controllers/comment.controller';
import {
  createCommentToProductValidation,
  updateCommentToProductValidation,
} from '../validations/comment.validator';

const CommentRouter = Router();

/// These routers for products
// @route   /api/v1/Comments/product/:productId
CommentRouter.route('/product/:productId')
  .post(
    protectedMiddleware,
    allowedTo(Role.USER),
    createCommentToProductValidation,
    addCommentToProduct,
  ) // user
  .get(getAllCommentForProduct); // not

///// These routers for admin only
// /api/v1/Comments/admin/:id => CommentId
CommentRouter.route('/admin/:id').delete(
  protectedMiddleware,
  allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
  adminDeleteComment,
); //admin root admina adminb

// @route    /api/v1/comments/admin
CommentRouter.route('/admin').get(
  protectedMiddleware,
  allowedTo(
    Role.RootAdmin,
    Role.AdminA,
    Role.AdminB,
    Role.AdminC,
    Role.SubAdmin,
  ),
  getAllComment,
); //admin root admina adminb adminc subadmin

///////// These routers for user only
//  @route   /api/v1/comments/user/userId
CommentRouter.route('/user/:userId').get(
  protectedMiddleware,
  allowedTo(
    Role.RootAdmin,
    Role.AdminA,
    Role.AdminB,
    Role.AdminC,
    Role.SubAdmin,
  ),
  getAllCommentForUser,
); //admin root admina adminb adminc subadmin

// @route  /api/v1/Comments/user/:id => CommentId
CommentRouter.route('/user/:id')
  .put(
    protectedMiddleware,
    allowedTo(Role.USER),
    updateCommentToProductValidation,
    updateComment,
  ) // user
  .delete(protectedMiddleware, allowedTo(Role.USER), deleteComment); // user

export default CommentRouter;
