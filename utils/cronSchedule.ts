import cron from 'node-cron';
import { Types } from 'mongoose';

import { Coupon } from '../models/coupon.model';
import { User } from '../models/user.model';
import { Offer } from '../models/offer.model';
import { Role } from '../interfaces/user/user.interface';
import { Product } from '../models/product.model';
import changeCurrency from '../models/changeCurrency.model';

// @desc    Get Specific Coupon By Name And Specific Products
export const closeAllCouponsThatEnded = cron.schedule(
  '10 0 * * *',
  async () => {
    // 1- get all offers that endDate is today
    const date = new Date();

    // 2- update it to false
    await Coupon.updateMany(
      { endDate: { $lt: date }, active: true },
      { active: false },
    );
  },
);

// @ desc    Remove All Guest Users
export const RemoveAllGuestUsers = cron.schedule('15 0 * * *', async () => {
  const users = await User.find({ role: Role.Guest });
  if (users.length > 0) {
    users.forEach(async (user) => {
      await User.findByIdAndDelete(user._id);
    });
  }
});

// @ desc    Remove All Offers That Ended
export const closeAllOffersThatEnded = cron.schedule('0 0 * * *', async () => {
  // 1- get all offers that endDate is today
  const date = new Date();
  const offers = await Offer.find({ endDate: { $lt: date }, active: true });
  if (!offers) return;

  // 2- update it to false
  await Offer.updateMany(
    { endDate: { $lt: date }, active: true },
    { active: false },
  );

  // 3- get all offers id
  const offersId = offers.map((item) => item._id) as Types.ObjectId[];

  // 4- using bulkOption to remove all offers from all products
  const products = await Product.find({ offer: { $in: offersId } });

  // 5- update priceAfterDiscount to priceBeforeDiscount
  const bulkOption = products.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      update: {
        $unset: { offer: '' },
        $set: { priceAfterDiscount: 0 },
      },
    },
  }));
  await Product.bulkWrite(bulkOption, {});
});

// Perform the initial update
export const updateExchangeRates = cron.schedule('* 1 * * *', async () => {
  try {
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/SAR',
      {
        headers: {
          'X-Api-Key': '155ed066805b89ec2dcb286c',
        },
      },
    );

    const data = await response.json();
    const exchangeRates = data.rates;
    changeCurrency.deleteMany({}).exec();
    // Save the updated exchange rate data to the database
    const newExchangeRate = new changeCurrency({
      baseCurrency: 'SAR',
      rates: exchangeRates,
    });

    await newExchangeRate.save();
  } catch (error) {
    console.error('Error fetching and saving exchange rates:', error);
  }
});
