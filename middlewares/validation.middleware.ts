import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { matchedData, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

import ApiError from '../utils/ApiError';

export const validate = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = errors.array()[0] as {
        location: string;
        path: string;
        msg: { en: string; ar: string };
        type: string;
      };
      return next(
        new ApiError(
          { en: `${error.msg.en}`, ar: `${error.msg.ar}` },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    req.body = matchedData(req, { locations: ['body'] });
    req.params = matchedData(req, { locations: ['params'] });
    return next();
  },
);
