import { Model, Schema, model } from 'mongoose';

import { IRepository } from '../interfaces/repository/repository.interface';

const repositorySchema = new Schema<IRepository>(
  {
    name_en: {
      type: String,
      required: true,
    },
    name_ar: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Repository: Model<IRepository> = model<IRepository>(
  'Repository',
  repositorySchema,
);
