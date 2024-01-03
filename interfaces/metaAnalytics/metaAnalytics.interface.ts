import { Document } from 'mongoose';

export interface IAnalyticsMeta extends Document {
  key: string;
  value: string;
}
