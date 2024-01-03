import { Schema, Types, model } from 'mongoose';

import { IMeta } from '../interfaces/meta/meta.interface';
const metaSchema = new Schema<IMeta>(
  {
    title_meta: {
      type: String,
      required: true,
    },
    desc_meta: {
      type: String,
      required: true,
    },
    reference: {
      type: Types.ObjectId,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Meta = model<IMeta>('Meta', metaSchema);
