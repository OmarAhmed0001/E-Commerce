// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import MoyasarNPM from 'moyasar';

import {
  ITransaction,
  PaymentOptions,
  InvoiceOptions,
} from '../interfaces/moyasar/moyasar.interface';

export default class Moyasar {
  moyasar;
  constructor() {
    this.moyasar = new MoyasarNPM(process.env.MOYASAR_SECRET_KEY);
  }

  async createPayment(paymentOptions: PaymentOptions): Promise<ITransaction> {
    try {
      return await this.moyasar.payment.sendRequest(
        'payments',
        'POST',
        paymentOptions,
      );
    } catch (error) {
      console.log(`Error in creating payment: ${error}`.red);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<ITransaction> {
    try {
      return await this.moyasar.payment.sendRequest(
        `payments/${paymentId}`,
        'GET',
      );
    } catch (error) {
      console.log(`Error in getting payment: ${error}`.red);
      throw error;
    }
  }

  async createInvoice(invoiceOptions: InvoiceOptions): Promise<object> {
    try {
      return await this.moyasar.invoice.sendRequest(
        'invoices',
        'POST',
        invoiceOptions,
      );
    } catch (error) {
      console.log(`Error in creating invoice: ${error}`.red);
      throw error;
    }
  }

  async getInvoice(): Promise<object> {
    return {};
  }

  async createRefund(): Promise<object> {
    return {};
  }

  async getList({ page, per }: { page: number; per: number }): Promise<object> {
    try {
      return await this.moyasar.payment.list({ page, per });
    } catch (error) {
      console.log(`Error in getting list of payments: ${error}`.red);
      throw error;
    }
  }
}
