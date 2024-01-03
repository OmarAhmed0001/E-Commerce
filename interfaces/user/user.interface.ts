import { Document, Types } from 'mongoose';

export enum Role {
  RootAdmin = 'rootAdmin',
  AdminA = 'adminA',
  AdminB = 'adminB',
  AdminC = 'adminC',
  SubAdmin = 'subAdmin',
  USER = 'user',
  Guest = 'guest',
  Marketer = 'marketer',
}

export interface IRole {
  rootAdmin: string;
  adminA: string;
  adminB: string;
  adminC: string;
  subAdmin: string;
  user: string;
  guest: string;
  marketer: string;
}

export interface IUser extends Document {
  points: number;
  _id: Types.ObjectId;
  registrationType: string;
  verificationCode: string | undefined;
  passwordResetExpires: Date | undefined;
  passwordResetVerified: boolean | undefined;
  name: string;
  email?: string;
  password?: string;
  phone?: string;
  role: Role;
  revenue: number;
  image: string;
  imageUrl?: string;
  orders: string[];
  addressesList: [
    {
      _id: string;
      city: string;
      area: string;
      address: string;
      postalCode: string;
    },
  ];
  favourite: string[];
  changePasswordAt?: Date;
  pointsMarketer: [
    {
      order: Types.ObjectId;
      commission: number;
    },
  ];
  totalCommission: number;
  couponMarketer?: string;
  createToken: () => string;
  createGuestToken: () => string;
  comparePassword: (password: string) => boolean;
}
