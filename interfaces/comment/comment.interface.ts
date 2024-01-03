import { IProduct } from '../product/product.interface';
import { IUser } from '../user/user.interface';

export interface IComment {
  user: IUser['_id'] | IUser;
  product: IProduct['_id'] | IProduct;
  comment: string;
}
