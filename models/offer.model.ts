import { Schema, model } from 'mongoose';

import { IOffer } from '../interfaces/offer/offer.interface';

const offerSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    typeOfBanner: {
      type: String,
      enum: ['vertical', 'horizontal'],
      required: true,
    },
    imageOfBanner: {
      type: String,
      required: true,
    },
    discountDepartment: {
      key: {
        type: String,
        enum: ['allProducts', 'products', 'categories', 'subcategories'],
        required: true,
      },
      value: [
        {
          type: Schema.Types.ObjectId,
          required: true,
        },
      ],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Offer = model<IOffer>('Offer', offerSchema);
