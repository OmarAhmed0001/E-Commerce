import { model, Schema } from 'mongoose';

import { IVisitorHistory } from '../interfaces/visitorHistory/visitorHistory.interface';

const VisitorHistorySchema: Schema = new Schema<IVisitorHistory>({
  count: { type: Number, default: 1, required: true },
  country: { type: String, required: true },
  ip: { type: [{ type: String, required: true }], required: true },
});

export const VisitorHistory = model<IVisitorHistory>(
  'VisitorHistory',
  VisitorHistorySchema,
);
