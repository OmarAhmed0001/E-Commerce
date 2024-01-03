/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import {
  IOrder,
  IOrderResponse,
  IOrderTrackingOrderResponse,
} from '../interfaces/order/order.interface';

export default class Logex {
  api_key = process.env.LOGEX_API_KEY;
  client = axios.create({
    baseURL: process.env.LOGEX_URL,
    headers: {
      Authorization: `Bearer ${this.api_key}`,
    },
  });
  constructor() {}

  async createOrder(order: IOrder): Promise<IOrderResponse> {
    if (order.status === 'initiated' || !order.isVerified) {
      throw new Error('Order is not verified');
    }

    // TODO:make sure that the order has populated items
    const products = [
      ...order.onlineItems.items.map((item) => item),
      ...order.cashItems.items.map((item) => item),
    ];
    const data = {
      order_id: order._id,
      dropShipping: {
        products: products
          .filter((item) => item?.product?.deliveryType === 'dropshipping')
          .map((item) => ({
            title_en: item.product.title_en,
            title_ar: item.product.title_ar,
            image: item.product.imagesUrl?.[0] || 'image.png',
            weight: item.product.weight,
            deliveryType: item.product.deliveryType,
            paymentType: item.product.paymentType,
            properties: item.properties,
            quantity: item.quantity,
            price: item.totalPrice,
          })),
      },
      normal: {
        products: products
          .filter((item) => item?.product?.deliveryType === 'normal')
          .map((item) => ({
            title_en: item.product.title_en,
            title_ar: item.product.title_ar,
            quantity: item.quantity,
            properties: item.properties,
            image: item.product.imagesUrl?.[0] || 'image.png',
            weight: item.product.weight,
            deliveryType: item.product.deliveryType,
            paymentType: item.product.paymentType,
            price: item.totalPrice,
          })),
      },
      receiver: {
        name: order?.name,
        phone: order?.phone,
        information: {
          area: order?.area,
          city: order?.city,
          address: order?.address,
          postalCode: order?.postalCode,
        },
      },
      price:
        order?.cashItems?.items?.length > 0 ? order?.cashItems?.totalPrice : 0,
      quantity: order?.totalQuantity,
    };

    try {
      const res = await this.client.post('/orders', data);
      return res?.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  }

  async getOrders(): Promise<object> {
    try {
      const res = await this.client.get('/orders');
      return res?.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  }

  async trackOrder(orderNumberTracking: string): Promise<object> {
    try {
      const res = await this.client.get(
        `/orders/trackOrder/${orderNumberTracking}`,
      );
      return res?.data;
    } catch (error: any) {
      return error?.response?.data;
    }
  }

  async trackOrderStatus(
    order_id: string,
  ): Promise<IOrderTrackingOrderResponse> {
    try {
      const res = await this.client.get(`orders/trackOrder/${order_id}`);
      return res?.data as {
        status: true;
        message_en: string;
        message_ar: string;
        data: {
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
        };
      };
    } catch (error: any) {
      return error?.response?.data as {
        status: false;
        message_en: string;
        message_ar: string;
        data: undefined;
      };
    }
  }
}
