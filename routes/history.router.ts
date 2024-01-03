import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  getUserEachDay,
  getGuestUserEachDay,
  getOrdersEachDayAndTotalMoney,
  getAllStatusDetails,
  getOrdersEachMonth,
  getAllVisitorsHistory,
} from '../controllers/history.controller';

const historyRouter = Router();

historyRouter
  .route('/getUserEachDay')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getUserEachDay,
  ); //admin root admina adminb adminc subadmin

historyRouter
  .route('/getGuestUserEachDay')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getGuestUserEachDay,
  ); //admin root admina adminb adminc subadmin

historyRouter
  .route('/getOrdersEachDayAndTotalMoney')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getOrdersEachDayAndTotalMoney,
  ); //admin root admina adminb adminc subadmin

historyRouter
  .route('/getAllStatusDetails')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getAllStatusDetails,
  ); //admin root admina adminb adminc subadmin

historyRouter
  .route('/getOrdersEachMonth')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getOrdersEachMonth,
  ); //admin root admina adminb adminc subadmin

historyRouter.route('/getAllVisitorsLocation').get(
  protectedMiddleware,
  // allowedTo(
  //   Role.RootAdmin,
  //   Role.AdminA,
  //   Role.AdminB,
  //   Role.AdminB,
  //   Role.AdminC,
  //   Role.SubAdmin
  // ),
  getAllVisitorsHistory,
);
export default historyRouter;
