import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  getAllMetas,
  getMetaById,
  getMetaByRefrence,
  updateMeta,
} from '../controllers/meta.controller';
import {
  updateMetaDataValidation,
  getMetaDataByRefrenceValidation,
  getMetaDataByIdValidation,
  getAllMetaDataValidation,
} from '../validations/meta.validator';

const metaRouter = Router();

metaRouter.route('/').get(
  // protectedMiddleware,
  getAllMetaDataValidation,
  getAllMetas,
);

metaRouter
  .route('/:id')
  .get(
    // protectedMiddleware,
    getMetaDataByIdValidation,
    getMetaById,
  ) //admin root admina adminb adminc subadmin
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    updateMetaDataValidation,
    updateMeta,
  ); //admin root admina adminb

metaRouter
  .route('/getByReference/:id')
  .get(getMetaDataByRefrenceValidation, getMetaByRefrence);
export default metaRouter;
