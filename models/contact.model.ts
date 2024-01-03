import { Schema, model } from 'mongoose';

import { IContact } from '../interfaces/contact/contact.interface';

const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    contactType: {
      type: String,
      enum: ['complaints', 'suggestions', 'customerService'],
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Contact = model<IContact>('Contact', contactSchema);
