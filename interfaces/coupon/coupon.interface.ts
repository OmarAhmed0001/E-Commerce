import { Types, Document } from 'mongoose';

export interface ICoupon extends Document {
  type: string;
  title: string;
  code: string;
  limit: number;
  discount: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
  discountDepartment: {
    key: string;
    value: [Types.ObjectId];
  };
  products: [
    {
      product: Types.ObjectId;
    },
  ];
  users: [
    {
      user: Types.ObjectId;
      usedNumber: number;
    },
  ];
  commissionMarketer: number;
}
