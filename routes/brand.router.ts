import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import {
  createBrandValidator,
  getBrandByIdValidator,
  updateBrandValidator,
  deleteBrandValidator,
} from '../validations/brand.validator';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  createBrand,
  deleteBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
} from '../controllers/brand.controller';

const brandsRouter = Router();

brandsRouter
  .route('/')
  .get(getAllBrands) //all
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    createBrandValidator,
    createBrand,
  ); //admin root admina adminb

brandsRouter
  .route('/:id')
  .get(getBrandByIdValidator, getBrandById) //all
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    updateBrandValidator,
    updateBrand,
  ) //admin root admina adminb
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteBrandValidator,
    deleteBrand,
  ); //admin root admina adminb

export default brandsRouter;
