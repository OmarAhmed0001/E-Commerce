import { Types, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  description: string;
  image: string;
  comments: [
    {
      _id: Types.ObjectId;
      user: {
        userId: Types.ObjectId;
        email: string;
      };
      comment: string;
      replies: [
        {
          _id: Types.ObjectId;
          user: {
            userId: Types.ObjectId;
            email: string;
          };
          reply: string;
        },
      ];
    },
  ];
}
