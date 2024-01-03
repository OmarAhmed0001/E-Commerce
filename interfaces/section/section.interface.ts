import { Document } from 'mongoose';

export interface ISection extends Document {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image: string;
  type: 'slider' | 'banner' | 'aboutus' | 'privacy';
  alignment: 'vertical' | 'horizontal';
  title_meta: string;
  desc_meta: string;
  metaDataId?: string;
}
