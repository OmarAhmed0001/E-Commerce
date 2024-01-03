import { Document } from 'mongoose';

export interface IBrand extends Document {
  name_en: string;
  name_ar: string;
  desc_en?: string;
  desc_ar?: string;
  subCategory?: string;
  image?: string;
  productsCount?: number;
  title_meta: string;
  desc_meta: string;
  metaDataId?: string;
}
