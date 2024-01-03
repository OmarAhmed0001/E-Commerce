import { Document } from 'mongoose';

export interface IAttribute extends Document {
  key_ar: string;
  key_en: string;
  values: {
    value_ar: string;
    value_en: string;
  }[];
}
