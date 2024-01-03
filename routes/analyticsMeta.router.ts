import { Router } from 'express';

// import { validate } from "../middlewares/validation.middleware";
import {
  getAllAnalyticsMeta,
  getAnalyticsMeta,
  deleteAnalyticsMeta,
  createAnalyticsMeta,
} from '../controllers/analyticsMeta.controller';
// import { postAnalyticsMetaValidator } from "../models/analyticsMeta.model";
import { protectedMiddleware } from '../middlewares/protected.middleware';

const AnalyticsMetaRouter = Router();

AnalyticsMetaRouter.route('/')
  .get(
    protectedMiddleware,

    getAllAnalyticsMeta,
  )
  .post(
    // validate(postAnalyticsMetaValidator),
    createAnalyticsMeta,
  );

AnalyticsMetaRouter.route('/:id')
  .get(
    protectedMiddleware,

    getAnalyticsMeta,
  )
  .delete(deleteAnalyticsMeta); //admin root admina adminb adminc subadmin

export default AnalyticsMetaRouter;
