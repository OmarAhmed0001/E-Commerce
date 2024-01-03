import { Router } from 'express';

import uploadRouter from './routes/upload.router';
import authRouter from './routes/auth.router';
import categoryRouter from './routes/category.router';
import productRouter from './routes/product.router';
import contactRouter from './routes/contact.router';
import subCategoriesRouter from './routes/subCategory.router';
import brandsRouter from './routes/brand.router';
import sectionRouter from './routes/section.router';
import cartRouter from './routes/cart.router';
import orderRouter from './routes/order.router';
import userRouter from './routes/user.router';
import CommentRouter from './routes/comment.router';
import favoriteRouter from './routes/favorite.router';
import attributeRouter from './routes/attribute.router';
import reviewRouter from './routes/review.router';
import historyRouter from './routes/history.router';
import accountingRouter from './routes/accounting.router';
import metaRouter from './routes/meta.router';
import notificationRouter from './routes/notification.router';
import offerRouter from './routes/offer.router';
import couponRouter from './routes/coupon.router';
import marketerRouter from './routes/marketer.router';
import blogRouter from './routes/blog.router';
import webhookRouter from './routes/webhook.router';
import pointsManagementsRouter from './routes/pointsManagment.router';
import staticPointsRequestRouter from './routes/staticPointRequest.router';
import changeCurrencyRouter from './routes/changeCurrency.router';
import sendNewsViaEmailAndSMSRouter from './routes/sendNewsViaEmailAndSMS.router';
import AnalyticsMetaRouter from './routes/analyticsMeta.router';
import visitorHistoryRouter from './routes/visitorHistory.router';
import repositoryRouter from './routes/repository.router';
const router = Router();

/*
allowedTo(
  Role.RootAdmin,
  Role.AdminA,
  Role.AdminB,
  Role.AdminC,
  Role.SubAdmin,
  Role.USER
),
*/

router.use('/upload', uploadRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/contacts', contactRouter);
router.use('/subCategories', subCategoriesRouter);
router.use('/brands', brandsRouter);
router.use('/sections', sectionRouter);
router.use('/favourites', favoriteRouter);
router.use('/attributes', attributeRouter);
router.use('/reviews', reviewRouter);
router.use('/comments', CommentRouter);
router.use('/history', historyRouter);
router.use('/accounting', accountingRouter);
router.use('/meta', metaRouter);
router.use('/notifications', notificationRouter);
router.use('/offers', offerRouter);
router.use('/coupons', couponRouter);
router.use('/marketers', marketerRouter);
router.use('/blogs', blogRouter);
router.use('/webhook', webhookRouter);
router.use('/points-management', pointsManagementsRouter);
router.use('/static-point-request', staticPointsRequestRouter);
router.use('/changeCurrency', changeCurrencyRouter);
router.use('/sendNews', sendNewsViaEmailAndSMSRouter);
router.use('/analyticsMeta', AnalyticsMetaRouter);
router.use('/visitorHistory', visitorHistoryRouter);
router.use('/repositories', repositoryRouter);

export default router;
