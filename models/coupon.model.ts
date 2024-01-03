import { Schema, model } from 'mongoose';

import { ICoupon } from '../interfaces/coupon/coupon.interface';

const couponSchema = new Schema<ICoupon>(
  {
    type: {
      type: String,
      enum: ['normal', 'marketing'],
      default: 'normal',
    },
    title: {
      type: String,
    },
    code: {
      type: String,
      unique: true,
    },
    limit: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
    discountDepartment: {
      key: {
        type: String,
        enum: ['allProducts', 'products', 'categories', 'subcategories'],
      },
      value: [
        {
          type: Schema.Types.ObjectId,
        },
      ],
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    users: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        usedNumber: {
          type: Number,
          default: 0,
        },
      },
    ],
    commissionMarketer: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Coupon = model<ICoupon>('Coupon', couponSchema);
