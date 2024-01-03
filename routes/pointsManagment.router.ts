import { Router } from 'express';

import {
  createPointsManagement,
  getAllPointsManagements,
  grantUserPointsBasedOnByAdminPermissionOrDynamic,
} from '../controllers/pointsManagement.controller';
import { createPointsManagementValidation } from '../validations/PointsMangement.validator';
import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';

const pointsManagementsRouter = Router();

pointsManagementsRouter
  .route('/grantPoints')
  .post(
    protectedMiddleware,
    allowedTo(Role.USER),
    grantUserPointsBasedOnByAdminPermissionOrDynamic,
  );
pointsManagementsRouter
  .route('/')
  .get(protectedMiddleware, getAllPointsManagements)
  .post(
    protectedMiddleware,
    createPointsManagementValidation,
    createPointsManagement,
  );

export default pointsManagementsRouter;
