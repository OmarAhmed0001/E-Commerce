// express.d.ts
import { IUser } from '../user/user.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      ipAddress?: string;
    }
  }
}
