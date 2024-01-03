import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

// Models
import { Cart } from '../models/cart.model';
import { Category } from '../models/category.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
// Interfaces
import { IOrder } from '../interfaces/order/order.interface';
import { ICart } from '../interfaces/cart/cart.interface';
// Utils
import ApiError from '../utils/ApiError';
import { sendEmail } from '../utils/mailer/sendEmail';
import Moyasar from '../utils/moyasar';

import { calculateUserPoints } from './pointsManagement.controller';

export const moyasarPaid = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.body;

    const moyasar = new Moyasar();
    const paymentResult = await moyasar.getPayment(id);

    if (paymentResult?.status !== 'paid') {
      return next(
        new ApiError(
          {
            en: 'the payment is not paid',
            ar: 'الدفع لم يتم',
          },
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    const order = (await Order.findOne({
      cartId: paymentResult?.metadata?.cart_id,
    }).populate([
      { path: 'onlineItems.items.product' },
      { path: 'cashItems.items.product' },
    ])) as IOrder;

    if (!order) {
      return next(
        new ApiError(
          {
            en: 'cart not found',
            ar: 'السلة غير موجودة',
          },
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    if (
      Math.floor(paymentResult.amount / 100) !==
      Math.floor(order?.onlineItems.totalPrice)
    ) {
      return next(
        new ApiError(
          {
            en: 'the payment amount is not equal to the order amount',
            ar: 'مبلغ الدفع غير مساوي لمبلغ الطلب',
          },
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    if (!order || !order.isVerified) {
      return next(
        new ApiError(
          {
            en: 'Order not found or not verified',
            ar: 'الطلب غير موجود او غير مفعل',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // change order status to created
    let bulkOption = [];
    let cart: ICart;
    let userPoints: number;
    let revenue: number;
    switch (paymentResult?.status) {
      case 'paid':
        order.payWith.source =
          paymentResult.source as IOrder['payWith']['source'];
        order.payWith.type = paymentResult?.source?.type as
          | 'creditcard'
          | 'applepay'
          | 'stcpay'
          | 'none';
        order.paymentStatus = 'payment_paid';
        order.invoiceId = paymentResult?.id;

        // update product quantity
        bulkOption = [...order.onlineItems.items, ...order.cashItems.items].map(
          (item) => ({
            updateOne: {
              filter: { _id: item.product },
              update: {
                $inc: { sales: +item.quantity, quantity: -item.quantity },
              },
            },
          }),
        );
        await Product.bulkWrite(bulkOption, {});
        revenue =
          order.onlineItems.totalPrice + (order?.cashItems?.totalPrice || 0);
        // tODO :: before the User Update
        userPoints = await calculateUserPoints(order);
        await User.updateOne(
          { _id: order.user },

          { $inc: { revenue: revenue, points: userPoints } },
        );

        await Promise.all(
          [...order.onlineItems.items, ...order.cashItems.items].map(
            async (item) => {
              const product = await Product.findOne({ _id: item.product });
              await Category.updateOne(
                { _id: product?.category },
                { $inc: { revenue: item.totalPrice } },
              );
            },
          ),
        );
        await sendEmail(order);
        // delete cart
        // THIS WAS DELETE CART ROLES BUT I STOPED ITsdfg
        cart = (await Cart.findByIdAndDelete(order.cartId)) as ICart;
        if (!cart) {
          return next(
            new ApiError(
              {
                en: 'cart not found',
                ar: 'السلة غير موجودة',
              },
              StatusCodes.NOT_FOUND,
            ),
          );
        }
        // find marketer and update points
        if (
          cart.coupon?.couponReference &&
          cart.coupon?.used &&
          cart.coupon?.commissionMarketer
        ) {
          await User.findOneAndUpdate(
            { couponMarketer: cart?.coupon?.couponReference.toString() },
            {
              $inc: {
                totalCommission: Math.floor(cart.coupon.commissionMarketer),
              },
              $push: {
                pointsMarketer: {
                  order: order._id,
                  commission: Math.floor(cart.coupon.commissionMarketer),
                },
              },
            },
            { new: true },
          );
        }

        break;

      default:
        // update order paymentStatus
        order.paymentStatus = 'payment_failed';
        break;
    }

    await order.save();

    res.status(StatusCodes.OK).json({ received: true });
  },
);
