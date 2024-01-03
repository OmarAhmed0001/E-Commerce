import { Router } from 'express';

import { protectedMiddleware } from '../middlewares/protected.middleware';
import { moyasarPaid } from '../controllers/webhook.controller';
import { allowedTo } from '../middlewares/allowedTo.middleware';
import { Role } from '../interfaces/user/user.interface';

const webhookRouter = Router();

webhookRouter
  .route('/moyasar')
  .post(protectedMiddleware, allowedTo(Role.USER), moyasarPaid);

export default webhookRouter;
