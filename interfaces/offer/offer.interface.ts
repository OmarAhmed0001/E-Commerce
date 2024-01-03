import { Types, Document } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  percentage: number;
  startDate: Date;
  endDate: Date;
  typeOfBanner: string;
  imageOfBanner: string;
  discountDepartment: {
    key: string;
    value: [Types.ObjectId];
  };
  active: boolean;
}
