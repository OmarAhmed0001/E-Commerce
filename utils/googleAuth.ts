import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { StatusCodes } from 'http-status-codes';
import dotenv from 'dotenv';

import { User } from '../models/user.model';

import ApiError from './ApiError';
dotenv.config({ path: '../config/config.env' });
export const googlePassport = passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: `${process.env.APP_URL1}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile) {
          return new ApiError(
            {
              en: 'Google authentication failed',
              ar: 'فشل المصادقة من جوجل',
            },
            StatusCodes.BAD_REQUEST,
          );
        }
        const existingUser = await User.findOne({
          email: profile.emails?.[0]?.value,
        }).select('-password');

        if (existingUser) {
          const token = existingUser.createToken();
          return done(null, { user: existingUser, token });
        }

        // User doesn't exist, create a new user
        const newUser = new User({
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          password: profile.id, // You may want to handle this differently
          image: profile.photos?.[0]?.value,
          registrationType: 'email',
        });
        const user = await newUser.save();
        const token = user.createToken();
        // Retrieve the user excluding the 'password' field
        const userWithoutPassword = await User.findById(user._id).select(
          '-password',
        );

        return done(null, { user: userWithoutPassword, token });
      } catch (error: unknown) {
        throw new ApiError(
          { en: (error as Error).message, ar: (error as Error).message },
          StatusCodes.BAD_REQUEST,
        );
      }
    },
  ),
);
