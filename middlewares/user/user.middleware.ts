import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';

import { Role } from '../../interfaces/user/user.interface';
import ApiError from '../../utils/ApiError';

export const getAllUsersMiddleware = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.query as { role: Role | undefined };

    if (role?.includes('rootAdmin')) {
      return next(
        new ApiError(
          {
            en: "You can't get root admins",
            ar: 'لا يمكنك الحصول على المسؤولين الرئيسيين',
          },
          StatusCodes.FORBIDDEN,
        ),
      );
    }

    const { fields } = req.query as { fields: string | undefined };

    if (role) {
      req.query.role = { $in: [...role.replace('rootAdmin', '').split(',')] };
    }

    if (!role) {
      req.query.role = {
        $in: [Role.AdminA, Role.AdminB, Role.AdminC, Role.SubAdmin, Role.USER],
      };
    }

    req.query.fields =
      (fields ? fields : '') +
      ',name,email,phone,role,image,createdAt,-password';

    next();
  },
);
