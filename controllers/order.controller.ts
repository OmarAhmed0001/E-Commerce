// Packages NPM Imports
import crypto from 'crypto';

import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
// Interfaces Imports
import { Types } from 'mongoose';

import { ICart } from '../interfaces/cart/cart.interface';
import { IQuery } from '../interfaces/factory/factory.interface';
import { InvoiceOptions } from '../interfaces/moyasar/moyasar.interface';
import { IRepository } from '../interfaces/repository/repository.interface';
import { IUser } from '../interfaces/user/user.interface';
import { Status } from '../interfaces/status/status.enum';
// Models Imports
import { Cart } from '../models/cart.model';
import { Category } from '../models/category.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { Repository } from '../models/repository.model';
import { User } from '../models/user.model';
// Utils Imports
import ApiError from '../utils/ApiError';
import { ApiFeatures } from '../utils/ApiFeatures';
import Logex from '../utils/logex';
import Moyasar from '../utils/moyasar';
import { createNotificationAll } from '../utils/notification';

// Controllers Imports
import { calculateUserPoints } from './pointsManagement.controller';

const generateItemsData = (items: ICart['cartItems']) => {
  const itemsData = items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    totalPrice: item.total,
    properties: item.properties,
  }));
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.total, 0);
  return { items: itemsData, quantity, totalPrice };
};

interface addressInterface {
  city: string;
  area: string;
  address: string;
  postalCode: string;
}

interface ICreateItemShipping {
  repository: Types.ObjectId;
  quantity: number;
}
interface PaymentResult {
  id: string;
  url: string;
  // include other properties as needed...
}

// @desc    Create Order
// @route   POST /api/v1/orders
// @access  Private (User)
export const createOrder = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get user
    const { _id } = req.user! as IUser;
    const { city, orderNotes, phone, email, name, area, address, postalCode } =
      req.body;

    // 2- add address in database for user
    const newAddress = { city, area, address, postalCode } as addressInterface;
    const addresses = await User.findById((req.user! as IUser).id).select(
      'addressesList',
    );
    let resultAddresses = [{}];
    if (addresses) {
      resultAddresses = addresses.addressesList.filter((item) => {
        if (
          item.city === city &&
          item.area === area &&
          item.address === address &&
          item.postalCode === postalCode
        ) {
          return true;
        }
        return false;
      });
    }

    if (resultAddresses.length === 0) {
      if (newAddress) {
        const userLogged = await User.findByIdAndUpdate(
          (req.user! as IUser)._id,
          {
            $addToSet: { addressesList: newAddress },
          },
          {
            new: true,
          },
        );
        if (userLogged) {
          // if length equal 5 delete oldest address in arry
          if (userLogged.addressesList.length > 5) {
            await User.findByIdAndUpdate(
              (req.user! as IUser)._id,
              {
                $pull: {
                  addressesList: { _id: userLogged.addressesList[0]._id },
                },
              },
              {
                new: true,
              },
            );
          }
        }
      }
    }

    // 3- check if user has cart
    const cart = await Cart.findOne({ user: _id }).populate([
      { path: 'user', model: 'User', select: 'name email phone image' },
      {
        path: 'cartItems.product',
        model: 'Product',
        select:
          'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType sendToDelivery',
      },
    ]);

    if (!cart) {
      return next(
        new ApiError(
          {
            en: 'Cart is Empty',
            ar: 'عربة التسوق فارغة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    if (cart.cartItems.length < 1) {
      return next(
        new ApiError(
          {
            en: 'Cart is Empty',
            ar: 'عربة التسوق فارغة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 4- check if user have order with same cart id

    const hasOrder = await Order.findOne({
      cartId: cart._id,
      $or: [
        { isVerified: false },
        {
          isVerified: true,
          status: 'initiated',
          $or: [{ paymentType: 'online' }, { paymentType: 'both' }],
        },
      ],
    });

    if (hasOrder) {
      // delete order
      await Order.findByIdAndDelete(hasOrder._id);
    }

    // 5- get user info and send a verification code to the user phone number
    // const verificationCode = Math.floor(
    //   100000 + Math.random() * 900000
    // ).toString();
    const verificationCode = '123456';
    const verificationCodeExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    const hashVerificationCode = crypto
      .createHash('sha256')
      .update(verificationCode)
      .digest('hex');

    // 3) send the reset code via email
    // try {
    //   await sendSMSTaqnyat({
    //     recipient: parseInt(req.body.phone),
    //     code: verificationCode,
    //   });
    // } catch (err) {
    //   return next(
    //     new ApiError(
    //       {
    //         en: "There Is An Error In Sending SMS",
    //         ar: "هناك خطأ في إرسال الرسالة القصيرة",
    //       },
    //       StatusCodes.INTERNAL_SERVER_ERROR
    //     )
    //   );
    // }

    // 6- calculate total price and quantity

    const totalPrice = cart.cartItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );
    const totalQuantity = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const isOnline = cart.cartItems.some(
      (item) => item.product.paymentType === 'online',
    );
    const isCash = cart.cartItems.some(
      (item) => item.product.paymentType === 'cash',
    );

    const isBoth = cart.cartItems.some(
      (item) => item.product.paymentType === 'both',
    );

    const paymentType =
      isCash && (isOnline || isBoth)
        ? 'both'
        : isOnline || isBoth
          ? 'online'
          : 'cash';

    const cashData = cart.cartItems.filter(
      (item) => item.product.paymentType === 'cash',
    ) as ICart['cartItems'];

    const onlineData = cart.cartItems.filter(
      (item) =>
        item.product.paymentType === 'online' ||
        item.product.paymentType === 'both',
    ) as ICart['cartItems'];

    const onlineItems = generateItemsData(onlineData);
    const cashItems = generateItemsData(cashData);

    if (cart.isPointsUsed && cart.totalUsedFromPoints) {
      if (paymentType === 'online') {
        onlineItems.totalPrice =
          onlineItems.totalPrice - cart.totalUsedFromPoints;
      } else if (paymentType === 'cash') {
        cashItems.totalPrice = cashItems.totalPrice - cart.totalUsedFromPoints;
      } else if (paymentType === 'both') {
        if (cart.totalUsedFromPoints <= cashItems.totalPrice) {
          cashItems.totalPrice =
            cashItems.totalPrice - cart.totalUsedFromPoints;
        } else {
          const temp =
            Math.max(cart.totalUsedFromPoints, cashItems.totalPrice) -
            Math.min(cart.totalUsedFromPoints, cashItems.totalPrice);
          cashItems.totalPrice = 0;
          onlineItems.totalPrice = onlineItems.totalPrice - temp;
        }
      }
    }

    // 7- check quantity
    cart.cartItems.map(async (cart) => {
      const id = cart.product;
      const product = await Product.findById(id);
      if (product) {
        if (cart.product.quantity > product.quantity) {
          return next(
            new ApiError(
              {
                en: `Product Quantity is not enough ${product.title_en}`,
                ar: `كمية المنتج غير كافية ${product.title_ar}`,
              },
              StatusCodes.NOT_FOUND,
            ),
          );
        }
      }
    });

    // 8- create order
    const order = await Order.create({
      user: _id,
      cartId: cart._id,
      totalPrice,
      totalQuantity,
      city,
      phone,
      email,
      name,
      area,
      address,
      postalCode,
      orderNotes,
      verificationCode: hashVerificationCode,
      verificationCodeExpiresAt,
      paymentType,
      payWith: {
        source: {},
      },
      onlineItems: onlineItems,
      cashItems: cashItems,
    });
    const {
      // verificationCode: _,
      // verificationCodeExpiresAt: __,
      // payWith,
      ...orderResponse
    } = order.toObject();

    // send notification to all users
    const sender = _id.toString(); // add type guard to check if req.user exists
    const title = `New Order Created By ${name}`;
    const message = `New Order Created By ${name} With Email ${email}`;
    const link = `${process.env.Dash_APP_URL}/orders/${order._id}`;

    let notification = {};
    if (title && message && sender && link) {
      notification = await createNotificationAll(
        title,
        message,
        sender,
        ['rootAdmin', 'adminA', 'adminB', 'adminC', 'subAdmin'],
        link,
      );
      if (notification === -1) {
        return next(
          new ApiError(
            {
              en: 'notification not created',
              ar: 'لم يتم إنشاء الإشعار',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
    }

    ////////////////////////////////

    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: orderResponse,
      success_en: 'Order Initiated Successfully',
      success_ar: 'تم إنشاء الطلب بنجاح',
    });
  },
);

// @desc    Verify Order
// @route   POST /api/v1/orders/verifyOrder
// @access  Private (User)
export const verifyOrder = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = req.user! as IUser;
    const { code, phone } = req.body;
    const hashVerificationCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
    const order = await Order.findOne({
      user: _id,
      verificationCode: hashVerificationCode,
      verificationCodeExpiresAt: { $gt: Date.now() },
      phone: phone,
    });

    if (!order) {
      return next(
        new ApiError(
          {
            en: 'Invalid Code',
            ar: 'كود غير صحيح',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    // verify order
    order.isVerified = true;
    order.verificationCodeExpiresAt = 0;

    //  online , cash , both
    let bulkOption;
    let userPoints: number;
    let cart: ICart | null;
    switch (order.paymentType) {
      case 'cash':
        // create cash payment
        // update products sales
        bulkOption = order.cashItems.items.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: {
              $inc: { sales: +item.quantity, quantity: -item.quantity },
            },
          },
        }));
        await Product.bulkWrite(bulkOption, {});

        // delete cart
        userPoints = await calculateUserPoints(order);

        // STEPS FOR DELETING THE CART
        cart = await Cart.findByIdAndDelete(order.cartId);
        if (!cart) {
          return next(
            new ApiError(
              {
                en: 'Cart Not Found',
                ar: 'عربة التسوق غير موجودة',
              },
              StatusCodes.NOT_FOUND,
            ),
          );
        }
        // find marketer and update points
        if (
          cart?.coupon?.couponReference &&
          cart?.coupon?.used &&
          cart?.coupon?.commissionMarketer
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

        await User.updateOne(
          { _id: _id },
          { $inc: { revenue: order.cashItems.totalPrice, points: userPoints } },
        );

        await Promise.all(
          order.cashItems.items.map(async (item) => {
            const product = await Product.findOne({ _id: item.product });
            await Category.updateOne(
              { _id: product?.category },
              { $inc: { revenue: item.totalPrice } },
            );
          }),
        );

        // change status to created and payWith to none
        order.status = 'created';
        order.payWith.type = 'none';
        await order.save();

        res.status(StatusCodes.OK).json({
          status: Status.SUCCESS,
          data: order,
          paymentType: order.paymentType,
          success_en: 'Order Created Successfully',
          success_ar: 'تم إنشاء الطلب بنجاح',
        });
        break;
      default:
        await order.save();
        res.status(StatusCodes.CREATED).json({
          status: Status.SUCCESS,
          data: order,
          metadata: {
            cart_id: order.cartId,
            user_id: _id,
            order_id: order._id,
            total_quantity: order.totalQuantity,
            total_price: order.onlineItems.totalPrice,
            city: order.city,
            orderNotes: order.orderNotes,
            description: `Payment for order: ${order.phone}, ${order.email}, ${order.city}, pay ${order.onlineItems.totalPrice} from the total price ${order.totalPrice}`,
            phone: order.phone,
            email: order.email,
            paymentType: 'online',
          },
          paymentType: order.paymentType,
          success_en: 'Order Verified Successfully',
          success_ar: 'تم التحقق من الطلب بنجاح',
        });
        break;
    }
  },
);

// @desc    Create Online Order
// @route   POST /api/v1/orders/online
// @access  Private (User)
// export const createOnlineOrder = expressAsyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     // create online payment
//     const { _id } = req.user! as IUser;
//     const cart = await Cart.findOne({ user: _id });

//     if (!cart) {
//       return next(
//         new ApiError(
//           {
//             en: "Cart is Empty",
//             ar: "عربة التسوق فارغة",
//           },
//           StatusCodes.NOT_FOUND
//         )
//       );
//     }

//     const order = await Order.findOne({ user: _id, cartId: cart._id });

//     if (!order) {
//       return next(
//         new ApiError(
//           {
//             en: "Order Not Found",
//             ar: "الطلب غير موجود",
//           },
//           StatusCodes.NOT_FOUND
//         )
//       );
//     }

//     const { city, orderNotes, phone, email } = order;
//     const { type, cvc, month, year, number, name } = req.body;
//     const moyasar = new Moyasar();
//     const callback_url = `https://saritestsecond.online:3000/thanksOrder`;
//     let paymentOptions;
//     switch (type) {
//       case "creditcard":
//         paymentOptions = {
//           amount: order.onlineItems.totalPrice * 100,
//           currency: "SAR",
//           description: `Payment for order: ${phone}, ${email}, ${city}`,
//           callback_url,
//           metadata: {
//             cart_id: order.cartId,
//             user_id: _id,
//             order_id: order._id,
//             total_quantity: order.totalQuantity,
//             total_price: order.onlineItems.totalPrice,
//             city,
//             orderNotes,
//             description: `Payment for order: ${phone}, ${email}, ${city}, pay ${order.onlineItems.totalPrice} from the total price ${order.totalPrice}`,
//             phone,
//             email,
//             paymentType: "online",
//           },
//           source: {
//             type,
//             cvc,
//             month,
//             year,
//             number,
//             first_name: name,
//             name: name,
//           },
//         };
//         break;
//       case "applepay":
//         paymentOptions = {} as any;
//         break;
//       case "stcpay":
//         paymentOptions = {} as any;
//         break;
//       default:
//         return next(
//           new ApiError(
//             {
//               en: "Invalid Payment Type",
//               ar: "نوع الدفع غير صحيح",
//             },
//             StatusCodes.BAD_REQUEST
//           )
//         );
//     }

//     const paymentResult = await moyasar.createPayment(paymentOptions);
//     res.status(StatusCodes.CREATED).json({
//       status: Status.SUCCESS,
//       data: {
//         currency: paymentResult.currency,
//         amount_format: paymentResult.amount_format,
//         description: paymentResult.description,
//         transaction_url: paymentResult.source.transaction_url,
//       },
//       paymentType: order.paymentType,
//       success_en: "Order Created Successfully",
//       success_ar: "تم إنشاء الطلب بنجاح",
//     });
//   }
// );

// @desc    Create Online Order (Invoice)
// @route   POST /api/v1/orders/online
// @access  Private (User)
export const createOnlineOrderInvoice = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // create online payment
    const { _id } = req.user! as IUser;
    const cart = await Cart.findOne({ user: _id });

    if (!cart) {
      return next(
        new ApiError(
          {
            en: 'Cart is Empty',
            ar: 'عربة التسوق فارغة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const order = await Order.findOne({ user: _id, cartId: cart._id });

    if (!order) {
      return next(
        new ApiError(
          {
            en: 'Order Not Found',
            ar: 'الطلب غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const { city, orderNotes, phone, email } = order;
    // const { type, cvc, month, year, number, name } = req.body;
    const moyasar = new Moyasar();
    const success_url = 'https://saritestsecond.online:3000/thanksOrder';
    const back_url = 'https://saritestsecond.online:3000/cart';
    const invoiceOptions = {
      amount: order.onlineItems.totalPrice * 100,
      currency: 'SAR',
      description: `Pay ${order.onlineItems.totalPrice} SAR`,
      // description: `Payment for order: ${phone}, ${email}, ${city}`,
      success_url,
      back_url,
      metadata: {
        cart_id: order.cartId,
        user_id: _id,
        order_id: order._id,
        total_quantity: order.totalQuantity,
        total_price: order.onlineItems.totalPrice,
        city,
        orderNotes,
        description: `Payment for order: ${phone}, ${email}, ${city}, pay ${order.onlineItems.totalPrice} from the total price ${order.totalPrice}`,
        phone,
        email,
        paymentType: 'online',
      },
    } as InvoiceOptions;

    const paymentResult = (await moyasar.createInvoice(
      invoiceOptions,
    )) as PaymentResult;
    order.invoiceId = paymentResult.id;
    await order.save();
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: {
        transaction_url: paymentResult.url,
      },
      paymentType: order.paymentType,
      success_en: 'Order Created Successfully',
      success_ar: 'تم إنشاء الطلب بنجاح',
    });
  },
);

// @desc    Get My Orders
// @route   GET /api/v1/orders/myOrders
// @access  Private (User)
export const getMyOrders = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { _id } = req.user! as IUser;

    const orders = await Order.find({
      user: _id,
      active: true,
      status: 'created',
    }).populate([
      { path: 'user', model: 'User', select: 'name email phone image' },
      {
        path: 'onlineItems.items.product',
        model: 'Product',
        select:
          'directDownloadLink title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery',
      },
      {
        path: 'cashItems.items.product',
        model: 'Product',
        select:
          'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery',
      },
    ]);

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: orders,
      success_en: 'Orders Fetched Successfully',
      success_ar: 'تم جلب الطلبات بنجاح',
    });
  },
);

// @desc    Get Order By Id
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await Order.findById({ _id: id, active: true }).populate([
      { path: 'user', model: 'User', select: 'name email phone image' },
      {
        path: 'onlineItems.items.product',
        model: 'Product',
        select:
          'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery',
      },
      {
        path: 'cashItems.items.product',
        model: 'Product',
        select:
          'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery',
      },
      {
        path: 'onlineItems.items.repositories.repository',
        model: 'Repository',
        select: 'name_en name_ar',
      },
      {
        path: 'cashItems.items.repositories.repository',
        model: 'Repository',
        select: 'name_en name_ar',
      },
    ]);

    if (!order) {
      return next(
        new ApiError(
          {
            en: 'Order Not Found',
            ar: 'الطلب غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: order,
      success_en: 'Order Fetched Successfully',
      success_ar: 'تم جلب الطلب بنجاح',
    });
  },
);

// @desc    Get Order By Id
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderByCartId = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const cartId = req.params.id;
    const { _id } = req.user! as IUser;
    const order = await Order.findById({
      cartId,
      userId: _id,
      active: true,
    }).populate([
      { path: 'user', model: 'User', select: 'name email phone image' },
      {
        path: 'onlineItems.items.product',
        model: 'Product',
        select:
          'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery',
      },
      {
        path: 'cashItems.items.product',
        model: 'Product',
        select:
          'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery',
      },
      {
        path: 'onlineItems.items.repositories.repository',
        model: 'Repository',
        select: 'name_en name_ar',
      },
      {
        path: 'cashItems.items.repositories.repository',
        model: 'Repository',
        select: 'name_en name_ar',
      },
    ]);

    if (!order) {
      return next(
        new ApiError(
          {
            en: 'Order Not Found',
            ar: 'الطلب غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: order,
      success_en: 'Order Fetched Successfully',
      success_ar: 'تم جلب الطلب بنجاح',
    });
  },
);

// @desc    Get All Orders
// @route   GET /api/v1/orders
// @access  Private (Admin)
export const getAllOrders = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as IQuery;
    const mongoQuery = Order.find({ active: true });
    const orders = await Order.find({ active: true }).populate([
      {
        path: 'onlineItems.items.product',
        model: 'Product',
        select: 'title_en title_ar images quantity',
      },
      {
        path: 'cashItems.items.product',
        model: 'Product',
        select: 'title_en title_ar images quantity ',
      },
    ]);
    const { data, paginationResult } = await new ApiFeatures(mongoQuery, query)
      .populate()
      .filter()
      .limitFields()
      .search()
      .sort()
      .paginate();
    if (data.length === 0) {
      return next(
        new ApiError(
          { en: 'not found', ar: 'غير موجود' },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      results: data.length,
      paginationResult,
      data: data,
      orders,
      success_en: 'Orders Fetched Successfully',
      success_ar: 'تم جلب الطلبات بنجاح',
    });
  },
);

// @desc    update order status
// @route   PUT /api/v1/orders/:id
// @access  Private (Admin)
export const updateOrderStatus = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
      },
    );

    if (!order) {
      return next(
        new ApiError(
          {
            en: 'Order Not Found',
            ar: 'الطلب غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: order,
      success_en: 'Order Status Updated Successfully',
      success_ar: 'تم تحديث حالة الطلب بنجاح',
    });
  },
);

// @desc    delete order
// @route   DELETE /api/v1/orders/:id
// @access  Private (Admin)
// export const deleteOrder = deleteOneItemById(Order);
export const deleteOrder = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get id for item from params
    const { id } = req.params;

    const order = await Order.findById({ _id: id });
    if (!order) {
      return next(
        new ApiError(
          {
            en: 'Order Not Found',
            ar: 'الطلب غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const updatedActiveItem = await Order.findByIdAndUpdate(
      { _id: id },
      { active: false },
      { new: true },
    );

    if (!updatedActiveItem) {
      return next(
        new ApiError(
          {
            en: 'An error occurred while updating',
            ar: 'حدث خطأ أثناء التحديث',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 4- send response
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      success_en: 'deleted successfully',
      success_ar: 'تم الحذف بنجاح',
    });
  },
);

// @desc    create item from order to specific repository
// @route   POST /api/v1/orders/createItemRepository
// @access  Private (Admin)
export const createItemRepository = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, itemId, typeOfItem, repos } = req.body;
    const flag: boolean[] = [];
    const order = await Order.findById(id);
    if (!order) {
      return next(
        new ApiError(
          {
            en: 'Order Not Found',
            ar: 'الطلب غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }
    if (typeOfItem === 'online') {
      const item = order.onlineItems.items.find(
        (item) => item.product.toString() === itemId,
      );
      if (!item) {
        return next(
          new ApiError(
            {
              en: 'Product Not Found',
              ar: 'المنتج غير موجود',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
      item.repositories = repos;
    } else {
      const item = order.cashItems.items.find(
        (item) => item.product.toString() === itemId,
      );
      if (!item) {
        return next(
          new ApiError(
            {
              en: 'Product Not Found',
              ar: 'المنتج غير موجود',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
      item.repositories = repos;
    }

    const Repositories: IRepository[] = [];
    const prod = await Product.findById(itemId);
    if (!prod) {
      return next(
        new ApiError(
          {
            en: 'Product Not Found',
            ar: 'المنتج غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }
    // update quantity of product from array in repository
    await Promise.all(
      repos.map(async (repo: ICreateItemShipping) => {
        const Repos = await Repository.findOne({ _id: repo.repository });

        if (Repos) {
          Repositories.push(Repos);
          const product = Repos.products.find(
            (item) => item.productId.toString() === itemId,
          );

          if (product) {
            if (product.quantity >= repo.quantity) {
              product.quantity -= repo.quantity;
              Repos.quantity -= repo.quantity;

              flag.push(true);
            } else {
              flag.push(false);
              return next(
                new ApiError(
                  {
                    en: 'Insufficient Quantity in Repository',
                    ar: 'الكمية غير كافية في المستودع',
                  },
                  StatusCodes.BAD_REQUEST,
                ),
              );
            }
          }
          //await Repos.save();
          // Update the repoQuantity in the product schema
          prod.repoQuantity -= repo.quantity;
        }

        if (!Repos) {
          return next(
            new ApiError(
              {
                en: 'Repository Not Found',
                ar: 'المستودع غير موجود',
              },
              StatusCodes.NOT_FOUND,
            ),
          );
        }
      }),
    );

    if (flag.every((item) => item === true)) {
      await order.save();
      await prod.save();
      Promise.all(
        Repositories.map(async (item) => {
          await item.save();
        }),
      );
    } else {
      return next(
        new ApiError(
          {
            en: 'Insufficient Quantity in Repository',
            ar: 'الكمية غير كافية في المستودع',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      success_en: 'Item Created Successfully',
      success_ar: 'تم إنشاء العنصر بنجاح',
    });
  },
);

// @desc    create shipping order
// @route   POST /api/v1/orders/shipping/:id
// @access  Private (Admin)
export const createShippingOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { id } = req.params;

  let order = await Order.findById(id).populate([
    { path: 'user', model: 'User', select: 'name email phone image' },
    {
      path: 'onlineItems.items.product',
      model: 'Product',
      select:
        'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery weight ',
    },
    {
      path: 'cashItems.items.product',
      model: 'Product',
      select:
        'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType deliveryType sendToDelivery weight ',
    },
  ]);

  if (!order) {
    return next(
      new ApiError(
        {
          en: 'Order Not Found',
          ar: 'الطلب غير موجود',
        },
        StatusCodes.NOT_FOUND,
      ),
    );
  }

  // check if order is already sent to delivery
  if (order.sendToDelivery) {
    return next(
      new ApiError(
        {
          en: 'Order Already Sent To Delivery',
          ar: 'تم إرسال الطلب بالفعل للتوصيل',
        },
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  if (!order.isVerified) {
    return next(
      new ApiError(
        {
          en: 'Order Not Verified',
          ar: 'الطلب غير موثق',
        },
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  order = order.toObject();
  const logex = new Logex();
  const response = await logex.createOrder(order);
  if (!response) {
    return next(
      new ApiError(
        {
          en: 'Error In Creating Order',
          ar: 'خطأ في إنشاء الطلب',
        },
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  if (!response?.status) {
    return next(
      new ApiError(
        {
          en: response.message_en,
          ar: response.message_ar,
        },
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  // update order sendToDelivery to true
  await Order.findByIdAndUpdate(id, { sendToDelivery: true });

  res.status(StatusCodes.OK).json({
    status: Status.SUCCESS,
    data: response?.data,
    success_en: 'Order Created Successfully',
    success_ar: 'تم إنشاء الطلب بنجاح',
  });
};

// @desc    track Order
// @route   GET /api/v1/orders/trackOrder/:id
// @access  Private (Admin)
export const trackOrder = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const order_id = req.params.id;
    const order = await Order.findById(order_id);
    if (!order) {
      return next(
        new ApiError(
          {
            en: 'Order Not Found',
            ar: 'الطلب غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }
    const logex = new Logex();
    const response = await logex.trackOrderStatus(order_id);
    if (!response) {
      return next(
        new ApiError(
          {
            en: 'Error In Tracking Order',
            ar: 'خطأ في تتبع الطلب',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    if (!response.status) {
      return next(
        new ApiError(
          {
            en: response.message_en,
            ar: response.message_ar,
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    if (response.status && response.data) {
      order.status = response.data.status;
      order.tracking = response.data.tracking;
    }

    await order.save();

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: response.data,
      success_en: 'Order Tracked Successfully',
      success_ar: 'تم تتبع الطلب بنجاح',
    });
  },
);
