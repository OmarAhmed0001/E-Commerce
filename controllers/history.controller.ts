import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

import { Order } from '../models/order.model';
import { User } from '../models/user.model';
import { VisitorHistory } from '../models/visitorHistory.model';
import { Status } from '../interfaces/status/status.enum';
import { Role } from '../interfaces/user/user.interface';
import { IOrder } from '../interfaces/order/order.interface';

// @desc     Get All Users That Signed Up In One Day
// @route    GET/api/v1/history/getUserEachDay
// @access   Private (Admins) TODO: add the rest of the roles
export const getUserEachDay = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    const startToday = new Date(new Date().setHours(2, 0, 0, 0));
    const endToday = new Date(new Date().setHours(25, 59, 59, 999));

    const users = await User.find({
      createdAt: {
        $gte: startToday,
        $lt: endToday,
      },
      role: {
        $ne: Role.Guest,
      },
    }).select('-password');

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      results: users.length,
      data: users,
      success_en: 'found successfully',
      success_ar: 'تم العثور بنجاح',
    });
  },
);

// @desc     Get All Guest Users That Signed Up In One Day
// @route    GET/api/v1/history/getGuestUserEachDay
// @access   Private (Admins) TODO: add the rest of the roles
export const getGuestUserEachDay = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    const startToday = new Date(new Date().setHours(2, 0, 0, 0));
    const endToday = new Date(new Date().setHours(25, 59, 59, 999));

    const users = await User.find({
      createdAt: {
        $gte: startToday,
        $lt: endToday,
      },
      role: Role.Guest,
    }).select('-password');

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      results: users.length,
      data: users,
      success_en: 'found successfully',
      success_ar: 'تم العثور بنجاح',
    });
  },
);

// @desc     Get All Orders and Total Money That inside One Day
// @route    GET/api/v1/history/getOrdersEachDayAndTotalMoney
// @access   Private (Admins) TODO: add the rest of the roles
export const getOrdersEachDayAndTotalMoney = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    const startToday = new Date(new Date().setHours(2, 0, 0, 0));
    const endToday = new Date(new Date().setHours(25, 59, 59, 999));

    const orders = await Order.find({
      status: {
        $ne: 'initiated',
      },
      createdAt: {
        $gte: startToday,
        $lt: endToday,
      },
    });

    const totalMoney = orders.reduce(
      (acc: number, order: IOrder) => acc + order.totalPrice,
      0,
    );

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      results: orders.length,
      totalMoney: totalMoney,
      success_en: 'found successfully',
      success_ar: 'تم العثور بنجاح',
    });
  },
);

// @desc     Get All Status Details
// @route    GET/api/v1/history/getAllStatusDetails
// @access   Private (Admins) TODO: add the rest of the roles
export const getAllStatusDetails = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    const orders = await Order.find({}).select('status');
    const status = orders.map((order: IOrder) => order.status);
    const statusDetails = {
      initiated: status.filter((s: string) => s === 'initiated').length,
      created: status.filter((s: string) => s === 'created').length,
      onGoing: status.filter((s: string) => s === 'on going').length,
      onDelivered: status.filter((s: string) => s === 'on delivered').length,
      completed: status.filter((s: string) => s === 'completed').length,
      refund: status.filter((s: string) => s === 'refund').length,
    };

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      results: orders.length,
      statusDetails,
      success_en: 'found successfully',
      success_ar: 'تم العثور بنجاح',
    });
  },
);

// @desc     Get All Orders in Each month
// @route    GET/api/v1/history/getOrdersEachMonth
// @access   Private (Admins) TODO: add the rest of the roles
export const getOrdersEachMonth = expressAsyncHandler(
  async (req: Request, res: Response /*, next: NextFunction*/) => {
    const months: { [key: string]: number } = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };
    const orders = await Order.find({});

    orders.map((order: IOrder) => {
      const newDate = new Date(order.createdAt);
      if (
        Object.keys(months).includes(
          moment(newDate.setMonth(newDate.getMonth())).format('MMMM'),
        )
      ) {
        months[
          `${moment(newDate.setMonth(newDate.getMonth())).format('MMMM')}`
        ]++;
      }
    });
    res.status(200).send({
      status: Status.SUCCESS,
      results: orders.length,
      months,
      success_en: 'found successfully',
      success_ar: 'تم العثور بنجاح',
    });
  },
);

// @desc    Get All VisitorHistory
// @route   POST /api/v1/visitorHistory
// @access  Private (Admin)
export const getAllVisitorsHistory = expressAsyncHandler(
  async (req: Request, res: Response /*,next:NextFunction*/) => {
    const data = await VisitorHistory.find({});
    const transformedData: Array<[string, number | string]> = [
      ['Country', 'Popularity'],
      // Add more countries and their corresponding counts as needed
    ];

    data.forEach((element) => {
      transformedData.push([element.country, element.count]);
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: transformedData,
      success_en: 'found successfully',
      success_ar: 'تم العثور بنجاح',
    });
  },
);
