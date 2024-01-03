import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';
import {
  addProductToFavouritesList,
  getAllItemsFromAllFavouritesList,
  getFavouriteList,
  removeProductFromFavouritesList,
  toggleProductFromFavouritesList,
} from '../controllers/favorite.controller';

const favouriteRouter = Router();

favouriteRouter
  .route('/')
  .get(protectedMiddleware, allowedTo(Role.USER), getFavouriteList) // user
  .post(protectedMiddleware, allowedTo(Role.USER), addProductToFavouritesList); // user

favouriteRouter
  .route('/:productId')
  .delete(
    protectedMiddleware,
    allowedTo(Role.USER),
    removeProductFromFavouritesList,
  ); // user

favouriteRouter
  .route('/toggleItemToFavourites/:productId')
  .put(
    protectedMiddleware,
    allowedTo(Role.USER),
    toggleProductFromFavouritesList,
  ); // user

favouriteRouter
  .route('/getAllProducts')
  .get(
    protectedMiddleware,
    allowedTo(
      Role.RootAdmin,
      Role.AdminA,
      Role.AdminB,
      Role.AdminC,
      Role.SubAdmin,
    ),
    getAllItemsFromAllFavouritesList,
  ); //admin root admina adminb adminc subadmin

export default favouriteRouter;
