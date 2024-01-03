import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import expressAsyncHandler from 'express-async-handler';

import PointsManagement from '../models/pointsManagement';
import { User } from '../models/user.model';
import { Cart } from '../models/cart.model';
import { StaticPoints } from '../models/staticPointRequest.model';
import { IPointsManagement } from '../interfaces/pointsManagement/pointsManagements.interface';
import { IUser } from '../interfaces/user/user.interface';
import { ICart } from '../interfaces/cart/cart.interface';
import { IOrder } from '../interfaces/order/order.interface';
import { Status } from '../interfaces/status/status.enum';
import ApiError from '../utils/ApiError';

export const getAllPointsManagements = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const pointsMangement = await PointsManagement.findOne();

    // const points = await User.find({ email: { $regex: "user" } })
    if (!pointsMangement) {
      return next(
        new ApiError(
          {
            en: 'Points not found',
            ar: 'النقاط غير موجودة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      message_en: 'Success',
      message_ar: 'نجاح',
      pointsMangement,
      data: [],
    });
  },
);

export const createPointsManagement = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Change Promise<Response> to Promise<void>
    // check if the same given meta is been created before then update it or else create it
    // await InsertAllDumyUsers();
    const PointsManagementExist = await PointsManagement.findOne();
    if (PointsManagementExist) {
      const other = await PointsManagement.findOneAndUpdate(
        {},
        { ...req.body },
        { new: true },
      );
      res.status(StatusCodes.OK).json({
        // Remove 'return'
        status: Status.SUCCESS,
        message_en: 'updated successfully',
        message_ar: 'تم التحديث بنجاح',
        data: other,
      });
    } else {
      const newOther = new PointsManagement({ ...req.body });
      await newOther.save();
      res.status(StatusCodes.OK).json({
        // Remove 'return'
        status: Status.SUCCESS,
        message_en: 'created successfully',
        message_ar: 'تم الإنشاء بنجاح',
        data: newOther,
      });
    }
  },
);

export const getPoinst = async (): Promise<IPointsManagement | null> => {
  let pointsManagement;
  // get the
  if (!pointsManagement) {
    pointsManagement = await PointsManagement.findOne({});
    // return pointsManagement;
  }

  return pointsManagement;
};

export const processUserPointAndTurnintoCurrency = (
  userPoints: number,
  totalPointConversionForOneUnit: number,
): number => {
  const THE_TOTAL_MONEY_GRANTED = Math.floor(
    userPoints / totalPointConversionForOneUnit,
  );
  return THE_TOTAL_MONEY_GRANTED;
};
// TODO: Check this logic
const assure_order_is_not_100Percent_free = (
  total_money_deducted: number,
  totalcartPrice: number,
) => {
  // it should not be calculated in all cases only if the order would be granted For free
  // so i think i should have also the value of
  const THE_AMOUNT_THAT_IS_NOT_FREE = 0.2;
  const THE_TOTAL_AFTER_DEDUCTION = Math.abs(
    total_money_deducted - total_money_deducted * THE_AMOUNT_THAT_IS_NOT_FREE,
  );
  const temp =
    total_money_deducted == totalcartPrice
      ? Math.floor(THE_TOTAL_AFTER_DEDUCTION)
      : Math.floor(total_money_deducted);
  return Number(temp);
};

const dynamicallyApplyPointsForSpecificUser = async (
  user: IUser,
  pointsManagement: IPointsManagement,
) => {
  let isDone = false;
  const userCart = (await Cart.findOne({ user: user?._id }).sort(
    '-createdAt',
  )) as ICart;
  if (userCart?.isPointsUsed) {
    // TODO: Refactor this error message to use ApiError
    throw new Error(
      JSON.stringify({
        error_en: 'You Cant Make more than one Request Per Order',
        error_ar: 'لا يمكنك تقديم أكثر من طلب واحد لكل طلب',
      }),
    );
  }
  console.log('userCart', userCart);

  const { max, totalPointConversionForOneUnit } = pointsManagement;
  // const tempTotalDedeuctionInCurrency: number;
  // const tempTotalDeductionInPoints: number;

  const tempTotalDedeuctionInCurrency = processUserPointAndTurnintoCurrency(
    Math.min(user?.points, max),
    totalPointConversionForOneUnit,
  );
  const tempTotalDeductionInPoints = Math.floor(
    Math.abs(user?.points - Math.min(user?.points, max)),
  );

  const no_free_perncentage = assure_order_is_not_100Percent_free(
    tempTotalDedeuctionInCurrency,
    userCart?.totalCartPrice,
  );
  if (tempTotalDedeuctionInCurrency >= userCart?.totalCartPrice) {
    throw new Error(
      JSON.stringify({
        error_en: 'This Order is To Low to Request Points For',
        error_ar: 'هذا الطلب منخفض جدًا لطلب النقاط.',
      }),
    );
  }
  if (userCart?.totalCartPrice - no_free_perncentage <= 0)
    throw new Error(
      JSON.stringify({
        error_en: 'This Order is To Low to Request Points For',
        error_ar: 'هذا الطلب منخفض جدًا لطلب النقاط.',
      }),
    );

  Cart.findByIdAndUpdate(
    userCart?._id,
    {
      // $inc: { totalCartPrice: -no_free_perncentage },
      $set: { isPointsUsed: true },
      totalUsedFromPoints: no_free_perncentage,
    },
    { new: true },
  )
    .then(() => {
      User.findByIdAndUpdate(
        user?._id,
        { $set: { points: tempTotalDeductionInPoints } },
        { new: true },
      ).then(() => {
        isDone = true;
      });
    })
    .catch(() => {
      isDone = false;
    });

  return isDone;
};

const staticallyApplyPointsForSpecificUser = async (
  user: IUser,
  pointsManagement: IPointsManagement,
) => {
  // this will make call the other Route that we have
  const userCart = (await Cart.findOne({ user: user?._id }).sort(
    '-createdAt',
  )) as ICart;

  const { totalPointConversionForOneUnit, max } = pointsManagement;
  const totalAllowed = processUserPointAndTurnintoCurrency(
    max,
    totalPointConversionForOneUnit,
  );
  if (totalAllowed >= userCart?.totalCartPrice) {
    throw new Error(
      JSON.stringify({
        error_en: 'This Order is To Low to Request Points For',
        error_ar: 'هذا الطلب منخفض جدًا لطلب النقاط',
      }),
    );
  } else {
    const isExist = await StaticPoints.findOne({ name: user?.name });
    if (isExist) {
      // return res.status(400).send({error_en:'You Have Already Sent Request That is not Been Processed'})
      throw new Error(
        JSON.stringify({
          error_en:
            'You Already have sent Request that is been processed Before',
          error_ar: 'لقد أرسلت بالفعل طلبًا تم معالجته من قبل',
        }),
      );
    }
    const { data } = await axios.post(
      `${process.env.APP_URL}/api/v1/static-point-request`,
      {
        user,
        pointsManagement,
      },
    );
    return data;
  }
};

export const grantUserPointsBasedOnByAdminPermissionOrDynamic = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const user = req?.user as IUser;
  const pointsMangement = (await getPoinst()) as IPointsManagement;

  if (user?.points < pointsMangement?.min) {
    res.status(400).send({
      error_en: 'Dont Have Enough Points',
      error_ar: 'لا تملك نقاط كافية لاسترداد هذه القسيمة',
    });
  }
  if (pointsMangement?.status == 'dynamic') {
    if (user?.points >= pointsMangement.min) {
      await dynamicallyApplyPointsForSpecificUser(user, pointsMangement)
        .then((data) => {
          console.log('data', data);
          res.status(200).send({
            message_en: 'Your Request is been Granted',
            message_ar: 'تم قبول طلبك لاستخدام نقاطك',
            data,
          });
        })
        .catch((e) => {
          res
            .status(400)
            .send(
              JSON.parse(
                e.message ||
                  '{error_en:"Some Thing Went Wrong",error_ar:"حدث خطأ ما"}',
              ),
            );
        });
    }
  } else {
    await staticallyApplyPointsForSpecificUser(user, pointsMangement)
      .then((data) => {
        res.status(200).send(JSON.stringify(data));
      })
      .catch((e) => {
        res.status(400).send(JSON.parse(e.message));
      });
  }
  return next(
    new ApiError(
      {
        en: 'Points not enough',
        ar: 'النقاط غير كافية',
      },
      StatusCodes.NOT_FOUND,
    ),
  );
};

// calculate user point from the order i will get the order then i will extract the total price of each product (product_price*quantity) accumulation

export const calculateUserPoints = async (order: IOrder): Promise<number> => {
  // get the points first to calculate how many point the user should have on that order
  const points = await getPoinst();
  const tempPoints =
    (Number(points?.noOfPointsInOneUnit) || 0) * order?.totalPrice;
  return Math.floor(tempPoints);
};
