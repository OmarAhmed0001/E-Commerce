import { Schema, model, Types } from 'mongoose';

export interface IStaticPointRequest {
  name: string;
  points: number;
  pointsValue: number;
  status: string;
  user: Types.ObjectId;
}
const staticPointSchema = new Schema<IStaticPointRequest>(
  {
    name: String,
    points: Number,
    pointsValue: Number,
    status: { type: String, enum: ['initiated'] },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const StaticPoints = model<IStaticPointRequest>(
  'StaticPoints',
  staticPointSchema,
);
