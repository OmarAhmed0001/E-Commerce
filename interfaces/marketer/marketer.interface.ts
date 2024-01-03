import { Types, Document } from 'mongoose';

export interface IMarketer extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  code: string;
  discount: number;
  discountDepartment: {
    key: string;
    value: [Types.ObjectId];
  };
  commissionMarketer: number;
  url: string;
}
