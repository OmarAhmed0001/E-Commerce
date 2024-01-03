import { Schema, model } from 'mongoose';

import { IAnalyticsMeta } from '../interfaces/metaAnalytics/metaAnalytics.interface';

const analyticsMetaSchema = new Schema<IAnalyticsMeta>({
  key: { type: String, enum: ['google', 'snap', 'facebook', 'tiktok', 'tag'] },
  value: String,
});

export const AnalyticsMeta = model<IAnalyticsMeta>(
  'AnalyticsMeta',
  analyticsMetaSchema,
);
