import { Review } from '../models/review.model';

import {
  addToProduct,
  adminDeleteFromProduct,
  deleteFromProductByUser,
  getAll,
  getAllForProduct,
  getAllForUser,
  updateForProductByUser,
} from './factor.comment.review.controller';

// @desc    Add review to product
// @route   POST /api/v1/reviews/product/:productId
// @access  Private (User)
export const addReviewToProduct = addToProduct(Review, 'review');

// @desc    Delete review
// @route   DELETE /api/v1/reviews/user/:id => reviewId
// @access  Private (User)
export const deleteReview = deleteFromProductByUser(Review, 'review');

// @desc    Update review
// @route   PUT /api/v1/reviews/user/:id => reviewId
// @access  Private (User)
export const updateReview = updateForProductByUser(Review, 'review');

// @desc    admin delete review
// @route   DELETE /api/v1/reviews/admin/:id => reviewId
// @access  Private (Admin)
export const adminDeleteReview = adminDeleteFromProduct(Review, 'review');

// @desc    Get all reviews for a product
// @route   GET /api/v1/reviews/product/:productId
// @access  Public
export const getAllReviewsForProduct = getAllForProduct(Review);

// @desc    Get all for a user
// @route   GET /api/v1/reviews/user/:userId
// @access  Private
export const getAllReviewsForUser = getAllForUser(Review);

// @desc    Get all reviews
// @route   GET /api/v1/reviews/admin
// @access  Private (Admin)
export const getAllReviews = getAll(Review);
