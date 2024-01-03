import { Schema, model } from 'mongoose';

import { IBlog } from '../interfaces/blog/blog.interface';

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    comments: [
      {
        user: {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
          email: {
            type: String,
          },
        },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        replies: [
          {
            user: {
              userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
              },
              email: {
                type: String,
              },
            },
            reply: {
              type: String,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Blog = model<IBlog>('Blog', blogSchema);
