import { Schema, model } from 'mongoose';

import { ISection } from '../interfaces/section/section.interface';

const sectionSchem = new Schema<ISection>({
  title_en: {
    type: String,
    default: '',
  },
  title_ar: {
    type: String,
    default: '',
  },
  description_en: {
    type: String,
    default: '',
  },
  description_ar: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: [
      'slider',
      'banner',
      'aboutus',
      'privacy',
      'usage',
      'retrieval',
      'public',
    ],
  },
  alignment: {
    type: String,
    enum: ['horizontal', 'vertical'],
    default: 'horizontal',
  },
  metaDataId: { type: Schema.Types.ObjectId, ref: 'Meta' },
});

sectionSchem.virtual('imageUrl').get(function (this: ISection) {
  if (this.image) {
    return `${process.env.APP_URL}/uploads/${this.image}`;
  }
  return '';
});

export const Section = model<ISection>('Section', sectionSchem);
