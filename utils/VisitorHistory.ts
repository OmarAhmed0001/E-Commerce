import { StatusCodes } from 'http-status-codes';

import { VisitorHistory } from '../models/visitorHistory.model';

import ApiError from './ApiError';

export const createAndUpdateVisitorHistory = async (
  country: string,
  ip: string,
): Promise<object> => {
  try {
    // Input validation
    if (!country || !ip) {
      throw new ApiError(
        {
          en: 'Country or IP is missing',
          ar: 'IP لم تدخل البلد أو ',
        },
        StatusCodes.BAD_REQUEST,
      );
    }

    // Check if the IP already exists in the IP array for the given country
    const existingRecord = await VisitorHistory.findOne({ country, ip: ip });

    if (!existingRecord) {
      // IP doesn't exist, create a new record
      const updatedVisitorHistory = await VisitorHistory.findOneAndUpdate(
        { country },
        {
          $inc: { count: 1 },
          $addToSet: { ip: ip },
        },
        { upsert: true, new: true }, // Upsert ensures a new record is created if not found
      );

      return updatedVisitorHistory;
    } else {
      // IP already exists, do not update the record
      return existingRecord;
    }
  } catch (error) {
    // Handle errors and return an ApiError
    return new ApiError(
      {
        en: 'Failed to create/update IP history',
        ar: 'فشل في إنشاء / تحديث سجل الآيبي',
      },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
