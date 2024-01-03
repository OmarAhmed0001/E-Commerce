import { Document, Types } from 'mongoose';

export interface IRepository extends Document {
  name_en: string;
  name_ar: string;
  quantity: number;
  products: [{ productId: Types.ObjectId; quantity: number }];
  address: string;
}
