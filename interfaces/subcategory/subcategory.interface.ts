import { Document, Types } from 'mongoose';

export interface ISubCategory extends Document {
  name_en: string;
  name_ar: string;
  image?: string;
  productsCount?: number;
  brandsCount?: number;
  category: Types.ObjectId;
  title_meta: string;
  desc_meta: string;
  metaDataId?: string;
}
