import { Types, Document } from 'mongoose';

import { ISubCategory } from '../subcategory/subcategory.interface';
import { ICategory } from '../category/category.interface';
import { IUser } from '../user/user.interface';
import { IOffer } from '../offer/offer.interface';
import { IBrand } from '../brand/brand.interface';

export interface IProduct extends Document {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  priceBeforeDiscount: number;
  priceAfterDiscount: number;
  shippingPrice: number;
  quantity: number;
  images: string[];
  sales: number;
  paymentType: 'online' | 'cash';
  keywords: [string];
  attributes: [
    {
      key_ar: string;
      key_en: string;
      values: [{ value_ar: string; value_en: string }];
    },
  ];
  qualities: [
    {
      key_ar: string;
      key_en: string;
      values: [
        { value_ar: string; value_en: string; price: number; color: string },
      ];
    },
  ];
  qualitiesImages: [
    {
      image: '';
      qualities: [
        {
          key_ar: string;
          key_en: string;
          value_ar: string;
          value_en: string;
        },
      ];
    },
  ];
  category: ICategory['_id'] | ICategory;
  subCategory: Types.ObjectId | ISubCategory;
  brand: Types.ObjectId | IBrand;
  likes: [{ user: IUser['_id'] | IUser }];
  rating: number;
  deliveryType: 'normal' | 'dropshipping';
  weight: number;
  metaDataId?: string;
  title_meta?: string;
  desc_meta?: string;
  offer: Types.ObjectId | IOffer;
  title?: string;
  message?: string;
  receiver?: string;
  role?: string;
  link?: string;
  extention?: string;
  directDownloadLink?: string;
  repoQuantity: number;
  repoIds: [Types.ObjectId];
  coupons: [Types.ObjectId];
}
