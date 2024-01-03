import { model, Schema } from 'mongoose';

import { IAttribute } from '../interfaces/attribute/attribute.interface';

const attributeSchema = new Schema<IAttribute>({
  key_ar: {
    type: String,
    required: true,
  },
  key_en: {
    type: String,
    required: true,
  },
  values: {
    type: [
      {
        value_ar: { type: String, required: true },
        value_en: { type: String, required: true },
      },
    ],
    required: true,
    validate: {
      validator: (v: boolean | unknown) => Array.isArray(v) && v.length > 0,
    },
  },
});

export const Attribute = model<IAttribute>('Attribute', attributeSchema);
