import { Router } from 'express';

// import { validate } from "../middlewares/validation.middleware";
import { protectedMiddleware } from '../middlewares/protected.middleware';
// import { allowedTo } from "../middlewares/allowedTo.middleware";
// import { Role } from "../interfaces/user/user.interface";
import {
  AcceptUserRequestToGrantPoints,
  getAllStaticPoints,
  insertUserPointRequest,
  rejectUserRequestToGrantPoints,
} from '../controllers/staticPointRequest.controller';

const staticPointsRequestRouter = Router();

staticPointsRequestRouter
  .route('/')
  .get(getAllStaticPoints)
  .post(insertUserPointRequest);
//   .put()
staticPointsRequestRouter
  .route('/:id')
  .put(protectedMiddleware, AcceptUserRequestToGrantPoints)
  .delete(protectedMiddleware, rejectUserRequestToGrantPoints);

export default staticPointsRequestRouter;
