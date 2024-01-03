import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import {
  addToCart,
  deleteCart,
  deleteCartItem,
  getAllCarts,
  getCart,
  verifyCoupon,
} from '../controllers/cart.controller';
import { addToCartValidation } from '../validations/cart.validator';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';

const cartRouter = Router();

cartRouter
  .route('/')
  .get(protectedMiddleware, allowedTo(Role.USER, Role.Guest), getCart); // user

cartRouter
  .route('/deleteByAdmin/:id')
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteCart,
  ); // Admin

cartRouter
  .route('/getAllCarts')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getAllCarts,
  ); // Admin

cartRouter
  .route('/verify')
  .post(protectedMiddleware, allowedTo(Role.USER), verifyCoupon);

cartRouter
  .route('/:productId')
  .post(
    protectedMiddleware,
    allowedTo(Role.USER, Role.Guest),
    addToCartValidation,
    addToCart,
  ) // user
  .delete(
    protectedMiddleware,
    allowedTo(Role.USER, Role.Guest),
    deleteCartItem,
  ); //user

export default cartRouter;
