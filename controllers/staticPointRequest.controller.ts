import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';

// Models
import { User } from '../models/user.model';
import { StaticPoints } from '../models/staticPointRequest.model';
import { Cart } from '../models/cart.model';
// Utils
import { createNotificationAll } from '../utils/notification';

// Controllers import
import { processUserPointAndTurnintoCurrency } from './pointsManagement.controller';

export const getAllStaticPoints = async (
  req: Request,
  res: Response,
): Promise<object> => {
  const staticPoints = await StaticPoints.find({});
  if (staticPoints.length > 0) {
    return res.status(200).send({ message_en: 'success', data: staticPoints });
  }
  return res.status(400).send({
    error_en: 'Points are Not Found',
    error_ar: 'لم يتم العثور على النقاط',
  });
};

export const insertUserPointRequest = async (
  req: Request,
  res: Response,
): Promise<object> => {
  const { user, pointsManagement } = req.body;
  // // what should be in the body of the user ,
  const deductedAmount = processUserPointAndTurnintoCurrency(
    Math.min(pointsManagement?.max, user?.points),
    pointsManagement?.totalPointConversionForOneUnit,
  );

  // const isExist=await StaticPoints.findOne({name:user?.name})

  const pointRequest = new StaticPoints({
    name: user?.name,
    points: Math.min(user?.points, pointsManagement?.max),
    pointsValue: deductedAmount,
    status: 'initiated',
    user: user?._id,
  });
  await pointRequest.save();
  // send notification to all users
  const sender = user?._id.toString(); // add type guard to check if req.user exists
  const title = `User ${user?.name} Requested Points`;
  const message = `New Point Requested By ${user?.name} for his cart With Email ${user?.email}`;
  const link = `${process.env.Dash_APP_URL}/points`;

  if (title && message && sender && link) {
    await createNotificationAll(
      title,
      message,
      sender,
      ['rootAdmin', 'adminA', 'adminB'],
      link,
    );
  }

  ////////////////////////////////

  return res.status(200).send({
    message_en:
      'your Request is Sent to The Admin , and He Will Process it in no Time',
    message_ar: 'تم إرسال طلبك إلى المسؤول وسيتم معالجته في أسرع وقت ممكن',
  });
  // first  i need the user Id to get his name , and his points ,
  // then i need to calcuate how many money will be deducted wither maximum or not
  // then insert the request ,
};

export const AcceptUserRequestToGrantPoints = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const isRequestExist = await StaticPoints.findById(id);
    if (!isRequestExist)
      res.status(400).send({
        error_en: 'No Such REquest Exist; ',
        error_ar: 'أعتذر ، لكن لا يوجد مثل هذا الطلب في نظامنا',
      });

    try {
      const isCartUpdated = await Cart.findOneAndUpdate(
        { user: isRequestExist?.user },
        {
          // $inc: { totalCartPrice: -isRequestExist?.pointsValue },
          $set: { isPointsUsed: true },
          totalUsedFromPoints: isRequestExist?.pointsValue,
        },
        { new: true },
      );
      if (!isCartUpdated)
        res.status(400).send({
          error_en: "Cart Can't Be Updated: ",
          error_ar: "Cart Can't Be Updated: ",
        });
      else {
        const isUserUpdated = await User.findByIdAndUpdate(
          isRequestExist?.user,
          { $inc: { points: -Number(isRequestExist?.points) } },
        );
        if (!isUserUpdated)
          res.status(400).send({
            error_en: "User Data can't be updated: ",
            error_ar: 'لا يمكن تحديث بيانات المستخدم',
          });
        await StaticPoints.findByIdAndDelete(id);
        res.status(200).send({
          message_en:
            'You Accept The user Request and User Data And His Cart Updated Successfully',
          message_ar:
            'تم قبول طلب المستخدم وبيانات المستخدم وتم تحديث سلة التسوق الخاصة به بنجاح  ',
        });
      }
    } catch (e: unknown) {
      res.status(500).send({
        error_en: `The Error is : ${(e as Error).message}`,
        error_ar: `${(e as Error).message}`,
      });
    }

    // by the id of the request i will first get how many points get converted to 1 nuit currency
    // then update the cart total price and after that will deduct the point from the client it self
    // response to the admin with status success of granting the user point
  },
);

export const rejectUserRequestToGrantPoints = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const isRejected = await StaticPoints.findByIdAndDelete(id);
    if (!isRejected)
      res.status(400).send({
        error_en: 'You Cant Reject the User Request Be Cause its Not Found',
        error_ar: 'لا يمكنك رفض طلب المستخدم لأنه غير موجود',
      });
    res.status(200).send({
      message_en: 'You Rejected User Request',
      message_ar: 'لقد رفضت طلب المستخدم',
    });
  },
);
