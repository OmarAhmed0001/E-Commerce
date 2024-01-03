import { Schema, Types, model } from 'mongoose';

import { IProduct } from '../interfaces/product/product.interface';

const productSchema = new Schema<IProduct>(
  {
    title_en: {
      type: String,
      required: true,
    },
    title_ar: {
      type: String,
      required: true,
    },
    description_en: {
      type: String,
      required: true,
    },
    description_ar: {
      type: String,
      required: true,
    },
    priceBeforeDiscount: {
      type: Number,
      required: true,
    },
    priceAfterDiscount: {
      type: Number,
    },
    shippingPrice: {
      type: Number,
    },
    quantity: {
      type: Number,
      default: 100_000_000,
    },
    images: [
      {
        type: String,
        default: '',
      },
    ],
    sales: {
      type: Number,
      default: 0,
    },
    paymentType: {
      type: String,
      enum: ['online', 'cash'],
      required: true,
    },
    deliveryType: {
      type: String,
      enum: ['normal', 'dropshipping'],
      required: true,
    },
    keywords: [
      {
        type: String,
      },
    ],
    attributes: {
      type: [
        {
          key_ar: { type: String, required: true },
          key_en: { type: String, required: true },
          values: {
            type: [
              {
                value_ar: { type: String, required: true },
                value_en: { type: String, required: true },
              },
            ],
            required: true,
            validate: {
              validator: (v: boolean) => Array.isArray(v) && v.length > 0,
            },
          },
        },
      ],
      default: [],
      required: false,
    },
    qualities: {
      type: [
        {
          key_ar: { type: String, required: true },
          key_en: { type: String, required: true },
          values: {
            type: [
              {
                value_ar: { type: String, required: true },
                value_en: { type: String, required: true },
                color: { type: String },
                price: { type: Number, default: 0 },
              },
            ],
            required: true,
            validate: {
              validator: (v: boolean) => Array.isArray(v) && v.length > 0,
            },
          },
        },
      ],
      default: [],
      required: false,
    },
    qualitiesImages: {
      type: [
        {
          image: { type: String, required: true },
          qualities: {
            type: [
              {
                key_ar: { type: String, required: true },
                key_en: { type: String, required: true },
                value_ar: { type: String, required: true },
                value_en: { type: String, required: true },
              },
            ],
            required: true,
          },
        },
      ],
      default: [],
      required: false,
    },
    likes: {
      type: [{ user: { type: Types.ObjectId, ref: 'User' } }],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      required: true,
    },
    category: {
      type: Types.ObjectId,
      ref: 'Category',
    },
    subCategory: {
      type: Types.ObjectId,
      ref: 'SubCategory',
    },
    brand: {
      type: Types.ObjectId,
      ref: 'Brand',
    },
    metaDataId: {
      type: Types.ObjectId,
      ref: 'Meta',
    },
    offer: {
      type: Types.ObjectId,
      ref: 'Offer',
    },
    link: {
      type: String,
    },
    extention: {
      //extension.
      type: String,
    },
    directDownloadLink: {
      type: String,
    },
    repoQuantity: {
      type: Number,
      default: 0,
    },
    repoIds: [
      {
        type: Types.ObjectId,
        ref: 'Repository',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual('imagesUrl').get(function (this: IProduct) {
  return this.images.map((image) => `${process.env.APP_URL}/uploads/${image}`);
});

productSchema.pre('save', function (next) {
  if (this.link && this.isModified('link')) {
    const shareableLink = this.link || '';
    const fileIdMatch = shareableLink.match(/\/d\/(.+?)\//);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      this.directDownloadLink = `https://drive.google.com/uc?id=${fileId}&export=download`;
    } else {
      this.directDownloadLink = '';
    }
  }
  next();
});

productSchema.virtual('finalPrice').get(function (this: IProduct) {
  return this.priceAfterDiscount || this.priceBeforeDiscount;
});

export const Product = model<IProduct>('Product', productSchema);
