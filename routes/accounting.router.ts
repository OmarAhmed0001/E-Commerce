import { Router } from 'express';

import { getAccountingPage } from '../controllers/accounting.controller';
import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';

const accountingRouter = Router();

accountingRouter
  .route('/')
  .get(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminC),
    getAccountingPage,
  );

export default accountingRouter;
