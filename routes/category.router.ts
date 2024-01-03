// Packages NPM Imports
import { Router } from 'express';

// Middlewares Imports
import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
// Interfaces Imports
import { Role } from '../interfaces/user/user.interface';
// Controllers Imports
import {
  getAllCategories,
  getAllCategoriesWithProducts,
  getAllCategoriesWithSubCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
  updateCategory,
} from '../controllers/category.controller';
// Validations Imports
import {
  getCategoryByIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from '../validations/category.validator';
import { limitsMiddleware } from '../middlewares/limits.middleware';

const categoryRouter = Router();

categoryRouter
  .route('/getAllCategoriesWithProducts')
  .get(getAllCategoriesWithProducts); //all

categoryRouter
  .route('/getAllCategoriesWithSubCategories')
  .get(getAllCategoriesWithSubCategories); //all

categoryRouter.route('/').get(getAllCategories); //all

categoryRouter
  .route('/')
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    limitsMiddleware('Category'),
    createCategoryValidator,
    createCategory,
  ); //admin root admina adminb

categoryRouter.route('/:id').get(getCategoryByIdValidator, getCategoryById); //all

categoryRouter
  .route('/:id')
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    updateCategoryValidator,
    updateCategory,
  ); //admin root admina adminb

categoryRouter
  .route('/:id')
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteCategoryValidator,
    deleteCategory,
  ); //admin root admina adminb

export default categoryRouter;
