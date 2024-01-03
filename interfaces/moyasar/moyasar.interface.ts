export interface PaymentWebhookResponse {
  id: string;
  type: 'payment_failed' | 'payment_paid';
  created_at: string;
  secret_token: string;
  account_name: string | null;
  live: boolean;
  data: {
    id: string;
    status: string;
    amount: number;
    fee: number;
    currency: string;
    refunded: number;
    refunded_at: string | null;
    captured: number;
    captured_at: string | null;
    voided_at: string | null;
    description: string;
    amount_format: string;
    fee_format: string;
    refunded_format: string;
    captured_format: string;
    invoice_id: string | null;
    ip: string;
    callback_url: string;
    created_at: string;
    updated_at: string;
    metadata?: object;
    source: {
      type: string;
      company: string;
      name: string;
      number: string;
      gateway_id: string;
      reference_number: string | null;
      token: string | null;
      message: string | null;
      transaction_url: string;
    };
  };
}

export interface ITransaction {
  id: string;
  status: string;
  amount: number;
  fee: number;
  currency: string;
  refunded: number;
  refunded_at: string | null;
  captured: number;
  captured_at: string | null;
  voided_at: string | null;
  description: string;
  amount_format: string;
  fee_format: string;
  refunded_format: string;
  captured_format: string;
  invoice_id: string | null;
  ip: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    cart_id: string;
    order_id: string;
    user_id: string;
    total_quantity: number;
  };
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    gateway_id: string;
    reference_number: string | null;
    token: string | null;
    message: string | null;
    transaction_url: string;
  };
}

export interface PaymentOptions {
  amount: number;
  currency: 'SAR' | 'CAD' | 'USD';
  description: string;
  callback_url: string;
  metadata?: object; // up to 30 key-value pairs
  source: {
    type: 'sadad' | 'creditcard' | 'applepay' | 'stcpay';
  } & (
    | ({ type: 'creditcard' } & {
        number: string;
        cvc: string;
        month: string;
        year: string;
        first_name?: string;
        name: string;
      })
    | ({ type: 'applepay' } & {
        token: string;
      })
    | ({ type: 'stcpay' } & {
        mobile: string;
        branch?: string;
        cashier?: string;
      })
  );
}

export interface InvoiceOptions {
  amount: number;
  currency?: 'SAR' | 'CAD' | 'USD';
  description: string;
  success_url?: string;
  back_url?: string;
  metadata?: object; // up to 30 key-value pairs
}
