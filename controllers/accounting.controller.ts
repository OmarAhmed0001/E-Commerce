import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Order } from '../models/order.model';
import { Status } from '../interfaces/status/status.enum';
import { IQuery } from '../interfaces/factory/factory.interface';
import ApiError from '../utils/ApiError';
import { ApiFeatures } from '../utils/ApiFeatures';

// @desc     Get Accounting Page
// @route    PUT/api/v1/accounting
// @access   Private (Admins) TODO: add the rest of the roles
export const getAccountingPage = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const numberDeliveryCompany = 1;

    const query = req.query as IQuery;
    const mongoQuery = Order.find({
      status: { $ne: 'initiated' },
      sendToDelivery: true,
    });

    const { data: orders, paginationResult } = await new ApiFeatures(
      mongoQuery,
      query,
    )
      .populate()
      .filter()
      .limitFields()
      .search()
      .sort()
      .paginate();

    if (orders.length === 0) {
      return next(
        new ApiError(
          {
            en: 'No orders found',
            ar: 'لا يوجد طلبات',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const total = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    const totalCashItems = orders.filter(
      (order) => order.paymentType === 'cash',
    );

    const totalCash = totalCashItems.reduce(
      (acc, order) => acc + order.totalPrice,
      0,
    );

    const totalOnlineItems = orders.filter(
      (order) => order.paymentType === 'online',
    );
    const totalOnline = totalOnlineItems.reduce(
      (acc, order) => acc + order.totalPrice,
      0,
    );

    const totalBothItems = orders.filter(
      (order) => order.paymentType === 'both',
    );

    const totalCashBoth = totalBothItems.reduce(
      (acc, order) => acc + order.cashItems.totalPrice,
      0,
    );

    const totalOnlineBoth = totalBothItems.reduce(
      (acc, order) => acc + order.onlineItems.totalPrice,
      0,
    );

    const logexHave = totalCashBoth + totalCash;

    const storeHave = totalOnlineBoth + totalOnline;

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      length: orders.length,
      paginationResult,
      data: {
        numberDeliveryCompany,
        totalOrders: orders.length,
        totalOrderSendToDelivery: orders.length,
        numberOfCashOrders: totalCashItems.length,
        numberOfOnlineOrders: totalOnlineItems.length,
        numberOfBothOrders: totalBothItems.length,
        totalMoney: total,
        totalCash: logexHave,
        totalOnline: storeHave,
        orders,
      },
      success_en: 'Accounting data retrieved successfully',
      success_ar: 'تم استرجاع بيانات المحاسبة بنجاح',
    });
  },
);
