import mongoose, { Schema } from 'mongoose';

import IChangeCurrency from '../interfaces/changeCurrency/changeCurrency.interface';
const changeCurrencySchema = new Schema<IChangeCurrency>({
  baseCurrency: String,
  rates: {
    type: Map,
    of: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const changeCurrency = mongoose.model<IChangeCurrency>(
  'ExchangeRate',
  changeCurrencySchema,
);

export default changeCurrency;
