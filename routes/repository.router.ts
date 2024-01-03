import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  getAllRepositories,
  getRepositoryById,
  createRepository,
  updateRepository,
  deleteRepository,
  addProductToRepository,
  deleteProductFromRepository,
  updateProductInRepository,
  getAllRepositoriesForAllProducts,
} from '../controllers/repository.controller';
import {
  getRepositoryByIdValidation,
  createRepositoryValidation,
  updateRepositoryValidation,
  deleteRepositoryValidation,
} from '../validations/repository.validator';

const repositoryRouter = Router();

repositoryRouter
  .route('/')
  .get(getAllRepositories)
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    createRepositoryValidation,
    createRepository,
  ); //admin root admina adminb

repositoryRouter
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
    getRepositoryByIdValidation,
    getRepositoryById,
  ) //admin root admina adminb adminc subadmin
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    updateRepositoryValidation,
    updateRepository,
  ) //admin root admina adminb
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteRepositoryValidation,
    deleteRepository,
  ); //admin root admina adminb

repositoryRouter.route('/:id/add-product').post(
  protectedMiddleware,
  allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
  // validate(postRepositoryValidation),
  addProductToRepository,
); //admin root admina adminb

repositoryRouter
  .route('/:id/products/:productId')
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    // validate(putRepositoryValidation),
    updateProductInRepository,
  ) //admin root admina adminb
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    // validate(postRepositoryValidation),
    deleteProductFromRepository,
  ); //admin root admina adminb

repositoryRouter.route('/allProduct/:id').get(getAllRepositoriesForAllProducts); //admin root admina adminb

export default repositoryRouter;
