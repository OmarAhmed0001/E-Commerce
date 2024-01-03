import { Document, Types } from 'mongoose';

export interface IMeta extends Document {
  title_meta: string;
  desc_meta: string;
  reference?: Types.ObjectId;
}
