// Packages NPM Imports
import { Router } from 'express';

// Middlewares Imports
import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
// Interfaces Imports
import { Role } from '../interfaces/user/user.interface';
// Validations Imports
import {
  getSubCategoryByIdValidator,
  createSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} from '../validations/subCategory.validator';
// Controllers Imports
import {
  getAllSubCategories,
  getAllSubCategoriesByCategoryId,
  getSubCategoryById,
  createSubCategory,
  updateSubCategoryById,
  deleteSubCategoryById,
} from '../controllers/subCategory.controller';
import { limitsMiddleware } from '../middlewares/limits.middleware';

const subCategoriesRouter = Router();

subCategoriesRouter.route('/').get(getAllSubCategories);

subCategoriesRouter
  .route('/')
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    limitsMiddleware('SubCategory'),
    createSubCategoryValidator,
    createSubCategory,
  );

subCategoriesRouter
  .route('/:id')
  .get(getSubCategoryByIdValidator, getSubCategoryById);

subCategoriesRouter
  .route('/:id')
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    updateSubCategoryValidator,
    updateSubCategoryById,
  );

subCategoriesRouter
  .route('/:id')
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteSubCategoryValidator,
    deleteSubCategoryById,
  );

subCategoriesRouter
  .route('/forSpecificCategory/:categoryId')
  .get(getAllSubCategoriesByCategoryId);

export default subCategoriesRouter;
