import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

export const ipAddressMiddleware = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      (req.socket.remoteAddress as string);
    req.ipAddress = ip;
    next();
  },
);
