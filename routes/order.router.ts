import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
// import { validate } from "../middlewares/validation.middleware";
import { Role } from '../interfaces/user/user.interface';
import {
  // createOnlineOrder,
  createOnlineOrderInvoice,
  createOrder,
  createShippingOrder,
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  trackOrder,
  // updateOrderStatus,
  verifyOrder,
  createItemRepository,
} from '../controllers/order.controller';
import {
  // changeOrderStatusValidation,
  // createOnlineOrderValidation,
  createOrderValidation,
  verifyOrderValidation,
} from '../validations/order.validator';

const orderRouter = Router();

orderRouter
  .route('/createItemRepository')
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    createItemRepository,
  );
orderRouter
  .route('/')
  .post(
    protectedMiddleware,
    allowedTo(Role.USER),
    createOrderValidation,
    createOrder,
  )
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getAllOrders,
  );
orderRouter
  .route('/trackOrder/:id')

  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
      Role.USER,
    ),
    trackOrder,
  );

orderRouter
  .route('/verifyOrder')
  .post(
    protectedMiddleware,
    allowedTo(Role.USER),
    verifyOrderValidation,
    verifyOrder,
  );
orderRouter
  .route('/shipping/:id')
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    createShippingOrder,
  );

orderRouter.route('/createOnlineOrder').post(
  protectedMiddleware,
  allowedTo(Role.USER),
  createOnlineOrderInvoice,
  // validate(createOnlineOrderValidation),
  // createOnlineOrder
);

orderRouter
  .route('/myOrders')
  .get(protectedMiddleware, allowedTo(Role.USER), getMyOrders);

orderRouter
  .route('/:id')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.USER,
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getOrderById,
  )
  // .put(
  //   protectedMiddleware,
  //   validate(changeOrderStatusValidation),
  //   allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
  //   updateOrderStatus
  // )
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteOrder,
  );

export default orderRouter;
