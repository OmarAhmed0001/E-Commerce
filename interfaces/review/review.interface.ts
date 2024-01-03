import { IProduct } from '../product/product.interface';
import { IUser } from '../user/user.interface';

export interface IReview {
  user: IUser['_id'] | IUser;
  product: IProduct['_id'] | IProduct;
  rating: number;
  comment: string;
}
