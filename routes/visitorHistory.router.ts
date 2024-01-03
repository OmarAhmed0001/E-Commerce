import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  // createVisitorHistory, //TODO: Uncomment when needed
  // deleteVisitorHistory,
  // updateVisitorHistory,
  getAllVisitorsHistory,
  getVisitorHistoryById,
} from '../controllers/visitorHistory.controller';
// import {
//   createVisitorHistoryValidator,
//   updateVisitorHistoryValidator,
// } from '../validations/visitorHistory.validator';

const visitorHistoryRouter = Router();

visitorHistoryRouter.route('/').get(getAllVisitorsHistory);
//   .post(
//     protectedMiddleware,
//     allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
//     createVisitorHistoryValidator,
//     createVisitorHistory,
//   ); //admin root admina adminb

visitorHistoryRouter
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
    getVisitorHistoryById,
  ); //admin root admina adminb adminc subadmin
// .put(
//   protectedMiddleware,
//   allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
//   updateVisitorHistoryValidator,
//   updateVisitorHistory,
// ) //admin root admina adminb
// .delete(
//   protectedMiddleware,
//   allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
//   deleteVisitorHistory,
// ); //admin root admina adminb

export default visitorHistoryRouter;
