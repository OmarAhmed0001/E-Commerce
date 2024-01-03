import { Document } from 'mongoose';
interface IConversionRates {
  [currency: string]: number;
}

interface IChangeCurrency extends Document {
  baseCurrency: string;
  rates: IConversionRates;
  timestamp: Date;
}
// interface IChangeCurrency {
//     [key: string]: any;
//   }
export default IChangeCurrency;
