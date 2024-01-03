import { Document } from 'mongoose';

export interface ICategory extends Document {
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  revenue?: number;
  subCategoriesCount?: number;
  productsCount?: number;
  image?: string;
  title_meta: string;
  desc_meta: string;
  metaDataId?: string;
}
