import { Schema, model } from 'mongoose';

import { IComment } from '../interfaces/comment/comment.interface';

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const Comment = model<IComment>('Comment', commentSchema);
