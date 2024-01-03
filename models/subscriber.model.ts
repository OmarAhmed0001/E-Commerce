import mongoose from 'mongoose';

import { ISubscriber } from '../interfaces/subscriber/subscriber.interface';

const subscriberSchema = new mongoose.Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Subscriber = mongoose.model<ISubscriber>(
  'Subscriber',
  subscriberSchema,
);
