import { VisitorHistory } from '../models/visitorHistory.model';

import {
  getAllItems,
  getOneItemById,
  // updateOneItemById, //TODO: Uncomment when needed
  // deleteOneItemById,
  // createNewItem,
} from './factory.controller';

// @desc    Get All VisitorHistory
// @route   POST /api/v1/visitorHistory
// @access  Private (Admin)
export const getAllVisitorsHistory = getAllItems(VisitorHistory);

// @desc    Get Specific VisitorHistory By Id
// @route   POST /api/v1/VisitorHistory/:id
// @access  Private (Admin)
export const getVisitorHistoryById = getOneItemById(VisitorHistory);

// // @desc    Create New VisitorHistory
// // @route   POST /api/v1/VisitorHistory
// // @access  Private (Admin)
// export const createVisitorHistory = createNewItem(VisitorHistory);

// // @desc    Update VisitorHistory By Id
// // @route   POST /api/v1/VisitorHistory/:id
// // @access  Private (Admin)
// export const updateVisitorHistory = updateOneItemById(VisitorHistory);

// // @desc    Delete VisitorHistory By Id
// // @route   POST /api/v1/VisitorHistory/:id
// // @access  Private (Admin)
// export const deleteVisitorHistory = deleteOneItemById(VisitorHistory);
