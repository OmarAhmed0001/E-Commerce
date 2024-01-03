import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';

//Interfaces
import { ICart } from '../interfaces/cart/cart.interface';
import { IProduct } from '../interfaces/product/product.interface';
import { Status } from '../interfaces/status/status.enum';
import { IUser } from '../interfaces/user/user.interface';
import { IQuery } from '../interfaces/factory/factory.interface';
// Models
import { Cart } from '../models/cart.model';
import { Coupon } from '../models/coupon.model';
import { Product } from '../models/product.model';
// Utils
import ApiError from '../utils/ApiError';
import { ApiFeatures } from '../utils/ApiFeatures';

// Controllers
import { deleteOneItemById } from './factory.controller';

interface ICartResponse {
  user: IUser;
  couponUsed: boolean;
  transactionType: string;
  totalQuantity: number;
  totalPrice: number;
  onlineItems: {
    items: any;
    quantity: number;
    totalPrice: number;
  };
  cashItems: {
    items: any;
    quantity: number;
    totalPrice: number;
  };
  isPointUsed: boolean;
}

export const cartResponse = ({
  cart,
  totalPrice,
  totalQuantity,
}: {
  cart: ICart;
  totalPrice: number;
  totalQuantity: number;
}): ICartResponse => {
  const onlineItems = {
    items: cart.cartItems.filter(
      (item) =>
        item.product.paymentType === 'online' ||
        item.product.paymentType === 'both',
    ),
    quantity: cart.cartItems
      .filter(
        (item) =>
          item.product.paymentType === 'online' ||
          item.product.paymentType === 'both',
      )
      .reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cart.cartItems
      .filter(
        (item) =>
          item.product.paymentType === 'online' ||
          item.product.paymentType === 'both',
      )
      .reduce((sum, item) => sum + item.total, 0),
  };

  const cashItems = {
    items: cart.cartItems.filter((item) => item.product.paymentType === 'cash'),
    quantity: cart.cartItems
      .filter((item) => item.product.paymentType === 'cash')
      .reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cart.cartItems
      .filter((item) => item.product.paymentType === 'cash')
      .reduce((sum, item) => sum + item.total, 0),
  };
  const isCash = cashItems.items.length > 0;
  const isOnline = onlineItems.items.length > 0;
  // cash online both
  const transactionType =
    isCash && isOnline ? 'both' : isCash ? 'cash' : 'online';

  // discount points
  if (cart.isPointsUsed && cart.totalUsedFromPoints) {
    if (transactionType === 'online') {
      onlineItems.totalPrice =
        onlineItems.totalPrice - cart.totalUsedFromPoints;
    } else if (transactionType === 'cash') {
      cashItems.totalPrice = cashItems.totalPrice - cart.totalUsedFromPoints;
    } else if (transactionType === 'both') {
      if (cart.totalUsedFromPoints <= cashItems.totalPrice) {
        cashItems.totalPrice = cashItems.totalPrice - cart.totalUsedFromPoints;
      } else {
        const temp =
          Math.max(cart.totalUsedFromPoints, cashItems.totalPrice) -
          Math.min(cart.totalUsedFromPoints, cashItems.totalPrice);
        cashItems.totalPrice = 0;
        onlineItems.totalPrice = onlineItems.totalPrice - temp;
      }
    }
  }

  return {
    user: cart.user as IUser,
    couponUsed: cart.coupon?.used as boolean,
    transactionType,
    totalQuantity,
    totalPrice,
    onlineItems,
    cashItems,
    isPointUsed: cart?.isPointsUsed,
  };
};

const calculateCartItemPrice = ({
  product,
  quantity,
  properties,
}: {
  product: IProduct;
  quantity: number;
  properties?: [
    { key_en: string; key_ar: string; value_en: string; value_ar: string },
  ];
}): number => {
  let totalPrice =
    ((product.priceAfterDiscount || product.priceBeforeDiscount) +
      (product.shippingPrice || 0)) *
    quantity;

  if (properties && properties.length > 0 && product.qualities) {
    const selectedProperties = product.qualities.filter(
      (quality) =>
        properties.findIndex(
          (prop) =>
            prop.key_en === quality.key_en && prop.key_ar === quality.key_ar,
        ) > -1,
    );

    const prices = selectedProperties.map((quality) => {
      const values = quality.values.find((value) =>
        properties.find(
          (prop) =>
            prop.value_en === value.value_en &&
            prop.value_ar === value.value_ar,
        ),
      );

      return values || { price: 0 };
    });

    const extraPrice = prices.reduce((sum, price) => sum + price.price, 0);
    totalPrice =
      ((product.priceAfterDiscount || product.priceBeforeDiscount) +
        (product.shippingPrice || 0) +
        extraPrice) *
      quantity;
  }

  return totalPrice;
};

// @desc    Add Product To Cart
// @route   POST /api/v1/cart/:productId
// @body    { quantity }
// @access  Private (user)
export const addToCart = expressAsyncHandler(async (req, res, next) => {
  const { _id } = req.user! as IUser;
  const { quantity, properties } = req.body as {
    quantity: number;
    properties?: [
      { key_en: string; key_ar: string; value_en: string; value_ar: string },
    ];
  };
  const { productId } = req.params;

  // check if the product exists
  const product = await Product.findById(productId);

  if (!product) {
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

  // check if the quantity is more than the available quantity
  if (quantity > product.quantity || product.quantity === 0) {
    return next(
      new ApiError(
        {
          en: 'Quantity Not Available',
          ar: 'الكمية غير متوفرة',
        },
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  // get the cart of the user
  const cart = await Cart.findOne({ user: _id });

  // if no cart, create a new one
  if (!cart) {
    const totalPrice = calculateCartItemPrice({
      product,
      quantity,
      properties,
    });
    // create a new cart
    const cart = await Cart.create({
      user: _id,
      cartItems: [
        {
          properties,
          product: product._id,
          quantity,
          total: totalPrice,
        },
      ],
      totalCartPrice: totalPrice,
    });
    const totalCartPrice = cart.cartItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );
    const populatedCart = await cart.populate([
      { path: 'user', model: 'User', select: 'name email image' },
      {
        path: 'cartItems.product',
        model: 'Product',
        select:
          'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType',
      },
    ]);

    // await Cart.findOneAndUpdate(
    //   { user: _id },
    //   { totalCartPrice: cart.totalCartPrice + totalPrice },
    //   { new: true }
    // );

    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: cartResponse({
        cart: populatedCart.toJSON(),
        totalPrice: totalCartPrice,
        totalQuantity: quantity,
      }),
      totalCartPrice: cart?.totalCartPrice,
      success_en: 'Product Saved To Cart Successfully',
      success_ar: 'تم حفظ المنتج في عربة التسوق بنجاح',
    });
    return;
  }

  // if there is a cart, check if the product is already in the cart
  const itemIndex = cart.cartItems.findIndex(
    (item) => item.product == productId,
  );

  if (itemIndex > -1) {
    // if the product is already in the cart, update the quantity
    cart.cartItems[itemIndex].quantity = quantity;
    cart.cartItems[itemIndex].total = calculateCartItemPrice({
      product,
      quantity,
      properties: properties || cart.cartItems[itemIndex].properties,
    });

    const totalQuantity = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    if (properties && properties.length > 0) {
      cart.cartItems[itemIndex].properties = properties;
    }

    const totalCartPrice = cart.cartItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    cart['totalCartPrice'] = totalCartPrice;
    await cart.save();

    const populatedCart = await cart.populate([
      { path: 'user', model: 'User', select: 'name email image' },
      {
        path: 'cartItems.product',
        model: 'Product',
        select:
          'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType',
      },
    ]);

    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: cartResponse({
        cart: populatedCart.toJSON(),
        totalPrice: totalCartPrice,
        totalQuantity,
      }),
      totalCartPrice: cart?.totalCartPrice,
      success_en: 'Product Saved To Cart Successfully',
      success_ar: 'تم حفظ المنتج في عربة التسوق بنجاح',
    });
    return;
  }

  // if the product is not in the cart, add it
  const total = calculateCartItemPrice({ product, quantity, properties });

  cart.cartItems.push({ product: product._id, quantity, total, properties });

  await Cart.findOneAndUpdate(
    { user: _id },
    { totalCartPrice: cart.totalCartPrice + total },
    { new: true },
  );

  const totalQuantity = cart.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  await cart.save();

  const totalCartPrice = cart.cartItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const populatedCart = await cart.populate([
    { path: 'user', model: 'User', select: 'name email image' },
    {
      path: 'cartItems.product',
      model: 'Product',
      select:
        'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType',
    },
  ]);

  res.status(StatusCodes.CREATED).json({
    status: Status.SUCCESS,
    data: cartResponse({
      cart: populatedCart.toJSON(),
      totalPrice: totalCartPrice,
      totalQuantity,
    }),
    totalCartPrice: cart?.totalCartPrice,
    success_en: 'Product Saved To Cart Successfully',
    success_ar: 'تم حفظ المنتج في عربة التسوق بنجاح',
  });
});

// @desc    Get Cart
// @route   GET /api/v1/cart
// @body    {}
// @access  Private (user)
export const getCart = expressAsyncHandler(async (req, res, next) => {
  const { _id } = req.user! as IUser;
  const cart = await Cart.findOne({ user: _id }).populate([
    { path: 'user', model: 'User', select: 'name email image points' },
    {
      path: 'cartItems.product',
      model: 'Product',
      select:
        'title_en title_ar description_en description_ar  rating priceBeforeDiscount priceAfterDiscount images quantity paymentType',
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
  const totalCartPrice = cart.cartItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const totalQuantity = cart.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  res.status(StatusCodes.OK).json({
    status: Status.SUCCESS,
    data: cartResponse({
      cart: cart,
      totalPrice: totalCartPrice,
      totalQuantity,
    }),
    totalCartPrice: cart?.totalCartPrice,
    _id: cart._id,
    success_en: 'Cart Fetched Successfully',
    success_ar: 'تم جلب عربة التسوق بنجاح',
  });
});

// @desc    Get Cart
// @route   GET /api/v1/cart
// @body    {}
// @access  Private (admin)
export const getAllCarts = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as IQuery;
    const mongoQuery = Cart.find({ user: { $ne: null } })
      .populate([{ path: 'user', model: 'User', select: 'name email' }])
      .select('-coupon  -isFreezed -isPointsUsed -updatedAt -__v');

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
          {
            en: 'No Carts Found',
            ar: 'لا يوجد عربات تسوق',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      result: data.length,
      paginationResult,
      data: data,
      success_en: 'Carts Fetched Successfully',
      success_ar: 'تم جلب عربات التسوق بنجاح',
    });
  },
);

// @desc    Delete Cart
// @route   DELETE /api/v1/cart/:productId
// @body    {}
// @access  Private (user)
export const deleteCartItem = expressAsyncHandler(async (req, res, next) => {
  const { _id } = req.user! as IUser;
  const { productId } = req.params;
  // check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
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
  // get the cart of the user and delete the product from it
  const cart = await Cart.findOneAndUpdate(
    { user: _id },
    { $pull: { cartItems: { product: productId } } },
    { new: true },
  ).populate([
    { path: 'user', model: 'User', select: 'name email image' },
    {
      path: 'cartItems.product',
      model: 'Product',
      select:
        'title_en title_ar priceBeforeDiscount priceAfterDiscount images quantity paymentType',
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

  // check if cart cartItems is empty
  if (cart.cartItems.length < 1) {
    await Cart.findOneAndDelete({ user: _id });
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: null,
      success_en: 'Product Deleted From Cart Successfully',
      success_ar: 'تم حذف المنتج من عربة التسوق بنجاح',
    });
    return;
  }

  const totalCartPrice = cart.cartItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const totalQuantity = cart.cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  await Cart.findByIdAndUpdate(
    { _id: cart._id },
    { totalCartPrice },
    { new: true },
  );

  res.status(StatusCodes.OK).json({
    status: Status.SUCCESS,
    data: cartResponse({
      cart: cart.toJSON(),
      totalPrice: totalCartPrice,
      totalQuantity,
    }),
    success_en: 'Product Deleted From Cart Successfully',
    success_ar: 'تم حذف المنتج من عربة التسوق بنجاح',
  });
});

// @desc    Delete Cart
// @route   Delete /api/v1/cart/:id
// @body    {}
// @access  Private (admin)
export const deleteCart = deleteOneItemById(Cart);

// @desc    Verify Coupon
// @route   POST /api/v1/cart/coupon
// @body    { coupon }
// @access  Private (user)
export const verifyCoupon = expressAsyncHandler(async (req, res, next) => {
  // 1- get the data
  const { code, productsIds } = req.body;
  // const { _id } = req.user! as IUser;

  // 2- check if the coupon is valid
  const CouponExist = await Coupon.findOne({ code });
  if (!CouponExist) {
    return next(
      new ApiError(
        {
          en: 'Coupon Not Found',
          ar: 'الكوبون غير موجود',
        },
        StatusCodes.NOT_FOUND,
      ),
    );
  }

  // 3- check if the cart used coupon before
  const cart = await Cart.findOne({
    user: (req.user! as IUser)._id,
    'coupon.used': false,
  });
  if (!cart) {
    return next(
      new ApiError(
        {
          en: 'That Cart Used Coupon Before',
          ar: 'عربة التسوق تم استخدام الكوبون بها من قبل',
        },
        StatusCodes.NOT_FOUND,
      ),
    );
  }

  // 4- check if the coupon is normal increase the used number
  if (CouponExist.type === 'normal') {
    const checkUsedCoupon = await Coupon.findOne({
      _id: CouponExist._id,
      'users.user': (req.user! as IUser)._id,
    });

    if (!checkUsedCoupon) {
      await Coupon.findOneAndUpdate(
        { _id: CouponExist._id },
        {
          $push: {
            users: {
              user: (req.user! as IUser)._id,
              usedNumber: 1,
            },
          },
        },
        { new: true },
      );
    } else {
      const result = await Coupon.findOneAndUpdate(
        {
          _id: CouponExist._id,
          'users.user': (req.user! as IUser)._id,
          'users.usedNumber': { $lt: CouponExist.limit },
        },
        {
          $inc: {
            'users.$.usedNumber': 1,
          },
        },
        { new: true },
      );
      if (!result) {
        return next(
          new ApiError(
            {
              en: 'Coupon Limit Exceeded',
              ar: 'تجاوز الحد الأقصى للكوبون',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
    }

    let minusFromTotal = 0;
    const result = cart.cartItems.map((item) => {
      const product: IProduct = productsIds.find(
        (productId: string) => productId === item.product.toString(),
      );
      if (product) {
        const miuns = Math.floor((item.total * CouponExist.discount) / 100);
        item.total = item.total - miuns;
        minusFromTotal = minusFromTotal + miuns;
      }
      return item;
    });

    // 8- update the cart
    const output = await Cart.findByIdAndUpdate(
      cart._id,
      {
        cartItems: result,
        coupon: { couponReference: CouponExist._id, used: true },
        totalCartPrice: cart.totalCartPrice - minusFromTotal,
      },
      { new: true },
    );
    if (!output) {
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

    // 5- response with the updated cart
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: output,
      success_en: 'Coupon Verified Successfully',
      success_ar: 'تم التحقق من الكوبون بنجاح',
    });
  } else if (CouponExist.type === 'marketing') {
    // 3- apply the coupon on the products
    let totalForMarketer = 0;
    let minusFromTotal = 0;
    const result = cart.cartItems.map((item) => {
      const product: IProduct = productsIds.find(
        (productId: string) => productId === item.product.toString(),
      );
      if (product) {
        const miuns = Math.floor((item.total * CouponExist.discount) / 100);
        totalForMarketer =
          totalForMarketer +
          (item.total * CouponExist.commissionMarketer) / 100;
        item.total = item.total - miuns;
        minusFromTotal = minusFromTotal + miuns;
      }
      return item;
    });

    // 4- update the cart
    const output = await Cart.findByIdAndUpdate(
      cart._id,
      {
        cartItems: result,
        coupon: {
          couponReference: CouponExist._id,
          commissionMarketer: totalForMarketer,
          used: true,
        },
        totalCartPrice: cart.totalCartPrice - minusFromTotal,
      },
      { new: true },
    );
    if (!output) {
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

    // 5- response with the updated cart
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: output,
      success_en: 'Coupon Verified Successfully',
      success_ar: 'تم التحقق من الكوبون بنجاح',
    });
  }
});
