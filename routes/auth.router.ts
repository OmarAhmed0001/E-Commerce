import { Request, Response, Router } from 'express';
import expressAsyncHandler from 'express-async-handler';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import {
  userRegisterValidation,
  userLoginValidation,
  //userUpdateValidation, // TODO: add userUpdateValidation to update user
  changedPasswordValidation,
  verifyCodeValidation,
  forgetPasswordValidation,
  verifyPasswordResetCodeValidation,
  resetPasswordValidation,
} from '../validations/auth.validator';
import {
  login,
  register,
  verifyCode,
  changePassword,
  createGuestUser,
  forgetPassword,
  verifyPasswordResetCode,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticateWithGoogle } from '../middlewares/passportAuth.middleware';
import { googlePassport } from '../utils/googleAuth';
// import { ipAddressMiddleware } from "../middlewares/ipAddress.middleware";

const authRoute = Router();

authRoute.route('/register').post(userRegisterValidation, register);

authRoute.route('/login').post(userLoginValidation, login);

authRoute.route('/verifyCode').post(verifyCodeValidation, verifyCode);

authRoute.route('/createGuestUser').post(createGuestUser);

authRoute
  .route('/changePassword')
  .put(protectedMiddleware, changedPasswordValidation, changePassword);

authRoute
  .route('/forgetPassword')
  .post(forgetPasswordValidation, forgetPassword);

authRoute
  .route('/verifyPasswordResetCode')
  .post(verifyPasswordResetCodeValidation, verifyPasswordResetCode);

authRoute.route('/resetPassword').put(resetPasswordValidation, resetPassword);

authRoute.get('/google', authenticateWithGoogle);

authRoute.get(
  '/google/callback',
  googlePassport.authenticate('google', {
    session: false,
  }),
  expressAsyncHandler(async (req: Request, res: Response) => {
    res.json({ data: req.user });
  }),
);

export default authRoute;
