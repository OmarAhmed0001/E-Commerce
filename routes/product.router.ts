import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
// import { validate } from "../middlewares/validation.middleware";
import {
  getAllProducts,
  getProductById,
  getAllProductsByCategoryId,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductByIdDash,
  toggleLikeBySomeOneById,
} from '../controllers/product.controller';
import {
  getProductByIdValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} from '../validations/product.validator';
import { limitsMiddleware } from '../middlewares/limits.middleware';

const productRouter = Router();
// TODO: add the rest of the roles

productRouter
  .route('/')
  .get(getAllProducts) //all
  .post(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    limitsMiddleware('Product'),
    createProductValidator,
    createProduct,
  ); //admin root admina adminb

productRouter
  .route('/forSpecificCategory/:categoryId')
  .get(getAllProductsByCategoryId); //all

productRouter
  .route('/:id')
  .get(getProductByIdValidator, getProductById) //all
  .put(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    updateProductValidator,
    updateProduct,
  ) //admin root admina adminb
  .delete(
    protectedMiddleware,
    allowedTo(Role.RootAdmin, Role.AdminA, Role.AdminB),
    deleteProductValidator,
    deleteProduct,
  ); //admin root admina adminb

productRouter
  .route('/toggleLike/:productId')
  .post(protectedMiddleware, allowedTo(Role.USER), toggleLikeBySomeOneById); //user

productRouter
  .route('/productDash/:id')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getProductByIdDash,
  ); //admin root admina adminb adminc subadmin

export default productRouter;
