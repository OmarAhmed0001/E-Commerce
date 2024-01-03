import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

// Models
import { User } from '../models/user.model';
// Interfaces
import { Status } from '../interfaces/status/status.enum';
// Utils
import ApiError from '../utils/ApiError';
import { sendEmail } from '../utils/sendEmail';
import { sendSMSTaqnyat } from '../utils/sendSMSTaqnyat';

//@desc Send news via email
//@route POST /api/v1/sendNews/viaEmail
//@access Private (Admin)
export const sendNewsViaEmail = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, message, subject, subSubject } = req.body;

    const body = `
    subSubject: ${subSubject}
    
    message: ${message}
  `;

    if (email.length === 0) {
      // If no email is provided, send news to all users with role "user"
      const users = await User.find({
        role: 'user',
        registrationType: 'email',
      });
      if (users.length === 0) {
        return next(
          new ApiError(
            {
              en: 'No users registered with email',
              ar: 'لا يوجد مستخدمين مسجلين بالبريد الالكترون',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
      // Use Promise.all to parallelize the email sending process
      await Promise.all(
        users.map(async (user) => {
          if (user.email) {
            try {
              await sendEmail({
                email: user.email,
                subject,
                message: body,
              });
            } catch (err) {
              console.log(err);
            }
          }
        }),
      );
    } else {
      // If no phone number is provided, send news to all users with role "user"
      const users = await User.find({
        role: 'user',
        registrationType: 'email',
        email: email,
      });
      if (!users) {
        return next(
          new ApiError(
            {
              en: 'No users registered with email',
              ar: 'لا يوجد مستخدمين مسجلين بالبريد الالكترون',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
      // Send news to the specified email
      await sendEmail({ email, subject, message: body });
    }

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      success_en: 'News sent successfully',
      success_ar: 'تم ارسال الاخبار بنجاح',
    });
  },
);

//@desc Send news via SMS
//@route POST /api/v1/sendNews/viaSMS
//@access Private (Admin)
export const sendNewsViaSMS = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone, message } = req.body;

    if (phone.length === 0) {
      // If no phone number is provided, send news to all users with role "user"
      const users = await User.find({
        role: 'user',
        registrationType: 'phone',
      });
      if (users.length === 0) {
        return next(
          new ApiError(
            {
              en: 'No users registered with phone number',
              ar: 'لا يوجد مستخدمين مسجلين برقم الهاتف',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
      // Use Promise.all to parallelize the SMS sending process
      await Promise.all(
        users.map(async (user) => {
          if (user.phone) {
            try {
              await sendSMSTaqnyat({
                recipient: parseInt(user.phone),
                code: message,
              });
            } catch (err) {
              console.log(err);
            }
          }
        }),
      );
    } else {
      // Send news to the specified phone number
      // If no phone number is provided, send news to all users with role "user"
      const users = await User.find({
        role: 'user',
        registrationType: 'phone',
        phone: phone,
      });
      if (!users) {
        return next(
          new ApiError(
            {
              en: 'No users registered with phone number',
              ar: 'لا يوجد مستخدمين مسجلين برقم الهاتف',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
      await sendSMSTaqnyat({ recipient: parseInt(phone), code: message });
    }

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      success_en: 'News sent successfully',
      success_ar: 'تم ارسال الاخبار بنجاح',
    });
  },
);
