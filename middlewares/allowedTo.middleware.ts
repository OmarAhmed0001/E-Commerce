import { Request, Response, NextFunction, RequestHandler } from 'express';
import expressAsyncHandler from 'express-async-handler';
import statusCodes from 'http-status-codes';

import ApiError from '../utils/ApiError';
import { IUser, Role } from '../interfaces/user/user.interface';

// @desc      Authorization (User Permissions) ["SuperAdmin", "AdminA", "AdminB", "AdminC", "SubAdmin", "User"]
type Roles = Role[];
export const allowedTo = (...roles: Roles): RequestHandler =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.user! as IUser;
      // if rule is guest ant it's not in roles array then return error please login first
      if (!roles.includes(Role.Guest) && role === Role.Guest) {
        return next(
          new ApiError(
            {
              en: 'Please Login First',
              ar: 'سجل دخول اولا',
            },
            statusCodes.UNAUTHORIZED,
          ),
        );
      }
      // 1) access roles
      // 2) access registered user (req.user.role)
      if (!roles.includes((req.user! as IUser).role)) {
        return next(
          new ApiError(
            {
              en: 'You Are Not Allowed To Access This Route',
              ar: 'غير مصرح لك',
            },
            statusCodes.FORBIDDEN,
          ),
        );
      }
      next();
    },
  );
