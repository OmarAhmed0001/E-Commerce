import { Comment } from '../models/comment.model';

import {
  addToProduct,
  adminDeleteFromProduct,
  deleteFromProductByUser,
  getAll,
  getAllForProduct,
  getAllForUser,
  updateForProductByUser,
} from './factor.comment.review.controller';

// @desc    Add comment to product
// @route   POST /api/v1/comments/product/:productId
// @access  Private (User)
export const addCommentToProduct = addToProduct(Comment, 'comment');

// @desc    Delete Comment
// @route   DELETE /api/v1/comments/user/:id => commentId
// @access  Private (User)
export const deleteComment = deleteFromProductByUser(Comment, 'comment');

// @desc    Update Comment
// @route   PUT /api/v1/comments/user/:id => commentId
// @access  Private (User)
export const updateComment = updateForProductByUser(Comment, 'comment');

// @desc    admin delete Comment
// @route   DELETE /api/v1/comments/admin/:id => commentId
// @access  Private (Admin)
export const adminDeleteComment = adminDeleteFromProduct(Comment, 'comment');

// @desc    Get all Comment for a product
// @route   GET /api/v1/comments/product/:productId
// @access  Public
export const getAllCommentForProduct = getAllForProduct(Comment, ['user']);

// @desc    Get all for a user
// @route   GET /api/v1/comments/user/:userId
// @access  Private
export const getAllCommentForUser = getAllForUser(Comment);

// @desc    Get all Comment
// @route   GET /api/v1/comments/admin
// @access  Private (Admin)
export const getAllComment = getAll(Comment);
