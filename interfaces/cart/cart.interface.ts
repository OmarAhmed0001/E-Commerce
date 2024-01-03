import { Types } from 'mongoose';

import { IProduct } from '../product/product.interface';
import { IUser } from '../user/user.interface';

export interface ICart extends Document {
  _id: Types.ObjectId;
  user: IUser['_id'] | IUser;
  isPointsUsed: boolean;
  isFreezed: boolean;
  cartItems: [
    {
      product: IProduct['_id'] | IProduct;
      quantity: number;
      total: number;
      properties?: [
        {
          key_en: string;
          key_ar: string;
          value_en: string;
          value_ar: string;
        },
      ];
    },
  ];
  coupon?: {
    couponReference: Types.ObjectId;
    used: boolean;
    commissionMarketer: number;
  };
  totalCartPrice: number;
  totalUsedFromPoints: number;
}

export interface ICartItems extends Document {
  cartItems: [
    {
      product: IProduct['_id'] | IProduct;
      quantity: number;
      total: number;
      properties?: [
        {
          key_en: string;
          key_ar: string;
          value_en: string;
          value_ar: string;
        },
      ];
    },
  ];
}
