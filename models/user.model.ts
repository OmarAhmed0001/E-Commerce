import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { Schema, Types } from 'mongoose';

import { IUser, Role } from '../interfaces/user/user.interface';

const userSchema = new mongoose.Schema<IUser>(
  {
    points: Number,
    registrationType: {
      type: String,
      enum: ['email', 'phone'],
    },
    verificationCode: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    passwordResetVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: 'default.png',
    },
    revenue: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: [
        'rootAdmin',
        'adminA',
        'adminB',
        'adminC',
        'subAdmin',
        'user',
        'guest',
        'marketer',
      ],
      default: Role.USER,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    addressesList: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        city: String,
        area: String,
        address: String,
        postalCode: String,
      },
    ],
    favourite: [
      {
        type: Types.ObjectId,
        ref: 'Product',
      },
    ],
    changePasswordAt: {
      type: Date,
      default: Date.now(),
    },
    pointsMarketer: [
      {
        order: { type: Types.ObjectId, ref: 'Order' },
        commission: { type: Number, default: 0 },
      },
    ],
    totalCommission: {
      type: Number,
      default: 0,
    },
    couponMarketer: {
      type: Types.ObjectId,
      ref: 'Coupon',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    // const salt = bcrypt.genSaltSync(10);
    const salt = +process.env.BCRYPT_SALT;
    this.password = bcrypt.hashSync(this.password, salt);
  }
  next();
});

userSchema.virtual('imageUrl').get(function () {
  return `${process.env.APP_URL}/uploads/${this.image}`;
});

userSchema.methods.comparePassword = function (this: IUser, password: string) {
  if (!password) return false;

  return bcrypt.compareSync(password, this.password!);
};

userSchema.methods.createToken = function () {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRE = process.env.JWT_EXPIRE;
  return jwt.sign({ _id: this._id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};
userSchema.methods.createGuestToken = function () {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRE_GUEST = process.env.JWT_EXPIRE_GUEST;
  return jwt.sign({ _id: this._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE_GUEST,
  });
};

export const User = mongoose.model<IUser>('User', userSchema);
