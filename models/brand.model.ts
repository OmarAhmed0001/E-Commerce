import { Schema, Types, model } from 'mongoose';

import { IBrand } from '../interfaces/brand/brand.interface';
// 1- Create Schema
const BrandSchema = new Schema<IBrand>(
  {
    name_en: {
      type: String,
      required: true,
    },
    name_ar: {
      type: String,
      required: true,
    },
    desc_en: {
      type: String,
    },
    desc_ar: {
      type: String,
    },
    subCategory: {
      type: Types.ObjectId,
      ref: 'SubCategory',
    },
    image: [
      {
        type: String,
        default: '',
      },
    ],
    productsCount: { type: Number, default: 0 },
    metaDataId: { type: Types.ObjectId, ref: 'Meta' },
  },
  { timestamps: true },
);

BrandSchema.virtual('imageUrl').get(function (this: IBrand) {
  if (this.image) {
    return `${process.env.APP_URL}/uploads/${this.image}`;
  }
  return ``;
});
// 2- Create Model
export const Brand = model<IBrand>('Brand', BrandSchema);
