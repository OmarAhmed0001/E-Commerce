import { Document, Types } from 'mongoose';

import { IProduct } from '../product/product.interface';
import { IUser } from '../user/user.interface';

export interface IOrder extends Document {
  user: IUser['_id'] | IUser;
  cartId: string;
  invoiceId?: string;
  paymentStatus: 'payment_not_paid' | 'payment_paid' | 'payment_failed';
  totalPrice: number;
  totalQuantity: number;
  city: string;
  phone: string;
  active: boolean;
  tracking?: { path: string; orderNumberTracking: string }[];
  status:
    | 'initiated'
    | 'created'
    | 'on going'
    | 'on delivered'
    | 'completed'
    | 'refund';
  // status: "initiated" | "created" | "in delivery" | "delivered" | "return";
  name: string;
  area: string;
  address: string;
  postalCode: string;
  orderNotes: string;
  email: string;
  verificationCode: string;
  isVerified: boolean;
  verificationCodeExpiresAt: number; // 1 hour
  paymentType: 'online' | 'cash' | 'both';
  sendToDelivery: boolean;
  payWith: {
    type: 'creditcard' | 'applepay' | 'stcpay' | 'none';
    source?: {
      type: string;
      company: string;
      name: string;
      number: string;
      gateway_id: string;
      reference_number: string | null;
      token: string | null;
      message: string | null;
      transaction_url: string;
    } & (
      | ({
          type: 'creditcard';
        } & {
          company: string;
          name: string;
          number: string;
          message?: string;
          reference_number?: string;
        })
      | ({
          type: 'applepay';
        } & {
          transaction: object;
        })
      | ({
          type: 'stcpay';
        } & {
          transaction: object;
        })
    );
  };
  onlineItems: {
    items: {
      product: IProduct['_id'] | IProduct;
      quantity: number;
      totalPrice: number;
      properties?: {
        key_en: string;
        key_ar: string;
        value_en: string;
        value_ar: string;
      }[];
      repositories: [
        {
          repository: Types.ObjectId;
          quantity: number;
        },
      ];
    }[];
    quantity: number;
    totalPrice: number;
  };
  cashItems: {
    items: {
      product: IProduct['_id'] | IProduct;
      quantity: number;
      totalPrice: number;
      properties?: {
        key_en: string;
        key_ar: string;
        value_en: string;
        value_ar: string;
      }[];
      repositories: [
        {
          repository: Types.ObjectId;
          quantity: number;
        },
      ];
    }[];
    quantity: number;
    totalPrice: number;
    active: boolean;
  };
  createdAt: Date;
}

export interface IOrderItems extends Document {
  items: {
    product: IProduct['_id'] | IProduct;
    quantity: number;
    totalPrice: number;
    properties?: {
      key_en: string;
      key_ar: string;
      value_en: string;
      value_ar: string;
    }[];
    repositories: [
      {
        repository: Types.ObjectId;
        quantity: number;
      },
    ];
  }[];
}

export interface ISourceOrder extends Document {
  source: {
    type: 'creditcard' | 'applepay' | 'stcpay' | 'none';
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

export interface IOrderResponse {
  message_en: string;
  message_ar: string;
  status: boolean;
  statusCode: number;
  data: {
    store: Types.ObjectId;
    order_id: Types.ObjectId;
    dropShipping: {
      sendToDelivery: boolean;
      status: string;
      products: [
        {
          title_en: string;
          title_ar: string;
          quantity: number;
          weight: number;
          deliveryType: 'normal' | 'dropshipping';
          paymentType: 'cash' | 'online';
          price: number;
          properties: {
            key_ar: string;
            key_en: string;
            value_ar: string;
            value_en: string;
          }[];
          image: string;
        },
      ];
      provider:
        | 'saee'
        | 'GLTexpress'
        | 'kwickBox'
        | 'smsa'
        | 'J&Texpress'
        | 'none';
    };
    normal: {
      sendToDelivery: boolean;
      status: string;
      products: [
        {
          title_en: string;
          title_ar: string;
          quantity: number;
          weight: number;
          deliveryType: 'normal' | 'dropshipping';
          paymentType: 'cash' | 'online';
          price: number;
          properties: {
            key_ar: string;
            key_en: string;
            value_ar: string;
            value_en: string;
          }[];
          image: string;
        },
      ];
      provider:
        | 'saee'
        | 'GLTexpress'
        | 'kwickBox'
        | 'smsa'
        | 'J&Texpress'
        | 'none';
    };
    receiver: {
      name: string;
      phone: string;
      information: {
        area: string;
        city: string;
        address: string;
        postalCode: string;
      };
    };
    price: number;
    quantity: number;
    status: 'created' | 'on going' | 'on delivered' | 'completed' | 'refund';
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v: 0;
  };
}

export interface IOrderTrackingOrderResponse {
  status: boolean;
  message_en: string;
  message_ar: string;
  data:
    | {
        status:
          | 'created'
          | 'on going'
          | 'on delivered'
          | 'completed'
          | 'refund';
        tracking?: {
          path: string;
          orderNumberTracking: string;
        }[];
      }
    | undefined;
}
