import { Router } from 'express';

import {
  getAllCoupons,
  getOneCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponByNameAndProducts,
} from '../controllers/coupon.controller';
import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  createCouponValidator,
  updateCouponValidator,
} from '../validations/coupon.validator';

const couponRouter = Router();

couponRouter
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
    getAllCoupons,
  );

couponRouter
  .route('/getCouponByNameAndProducts/:code')
  .get(protectedMiddleware, getCouponByNameAndProducts);

couponRouter
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
    getOneCouponById,
  );

couponRouter
  .route('/')
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    createCouponValidator,
    createCoupon,
  );

couponRouter
  .route('/:id')
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    updateCouponValidator,
    updateCoupon,
  );

couponRouter
  .route('/:id')
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteCoupon,
  );

export default couponRouter;
