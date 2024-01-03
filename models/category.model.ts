import { Schema, model } from 'mongoose';

import { ICategory } from '../interfaces/category/category.interface';

const categorySchema = new Schema<ICategory>(
  {
    name_en: { type: String, required: true },
    name_ar: { type: String, required: true },
    slug_en: { type: String },
    slug_ar: { type: String },
    revenue: { type: Number, default: 0 },
    subCategoriesCount: { type: Number, default: 0 },
    productsCount: { type: Number, default: 0 },
    image: { type: String, default: '' },
    metaDataId: { type: Schema.Types.ObjectId, ref: 'Meta' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

categorySchema.virtual('imageUrl').get(function (this: ICategory) {
  if (this.image) {
    return `${process.env.APP_URL}/uploads/${this.image}`;
  }
  return '';
});

export const Category = model<ICategory>('Category', categorySchema);
