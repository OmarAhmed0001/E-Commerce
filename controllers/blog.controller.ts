import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

import { IUser } from '../interfaces/user/user.interface';
import ApiError from '../utils/ApiError';
import { Blog } from '../models/blog.model';

import {
  createNewItem,
  deleteOneItemById,
  updateOneItemById,
} from './factory.controller';

// @desc     Get All Blogs
// @route    GET/api/v1/blogs
// @access   Public
export const getAllBlogs = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- find all blogs
    const blogs = await Blog.find({}).populate([
      {
        path: 'comments.user.userId',
        select: 'name role image',
      },
      {
        path: 'comments.replies.user.userId',
        select: 'name role image',
      },
    ]);

    // 2- check if there is no blogs
    if (blogs.length === 0) {
      return next(
        new ApiError(
          {
            en: 'not found',
            ar: 'لا يوجد اي نتيجة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 3- send response
    res.status(StatusCodes.OK).json({
      status: 'success',
      results: blogs.length,
      data: blogs,
    });
  },
);

// @desc     Get One Blog
// @route    GET/api/v1/blogs/:id
// @access   Public
export const getOneBlog = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get blog id
    const blogId = req.params.id;

    // 2- find blog
    const blog = await Blog.findById(blogId).populate([
      {
        path: 'comments.user.userId',
        select: 'name role image',
      },
      {
        path: 'comments.replies.user.userId',
        select: 'name role image',
      },
    ]);

    // 3- check if blog not found
    if (!blog) {
      return next(
        new ApiError(
          {
            en: 'Blog Not Found',
            ar: 'المدونة غير موجودة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 4- send response
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: blog,
    });
  },
);

// @desc     Create New Blog
// @route    POST/api/v1/blogs
// @access   Private
export const createBlog = createNewItem(Blog);

// @desc     Update Specific Blog By Id
// @route    PUT/api/v1/blogs/:id
// @access   Private
export const updateBlog = updateOneItemById(Blog);

// @desc     Delete Specific Blog By Id
// @route    DELETE/api/v1/blogs/:id
// @access   Private
export const deleteBlog = deleteOneItemById(Blog);

// @desc     Add Comment To Blog
// @route    POST/api/v1/blogs/addComment/:id
// @access   Private
export const addComment = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // id of the blog
    const blogId = req.params.id;

    // id of the user
    const userId = (req.user! as IUser)._id;

    // comment
    const comment: string = req.body.comment;

    // find the blog
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(
        new ApiError(
          {
            en: 'Blog Not Found',
            ar: 'المدونة غير موجودة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // add the comment
    await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: {
          comments: {
            user: { userId: userId, email: (req.user! as IUser).email },
            comment,
          },
        },
      },
      { new: true },
    );

    // send response
    res.status(StatusCodes.OK).json({
      status: 'success',
      success_en: 'Comment Added Successfully',
      success_ar: 'تم اضافة التعليق بنجاح',
    });
  },
);

// @desc     Add Comment To Blog
// @route    POST/api/v1/blogs/deleteComment/:id
// @access   Private
export const deleteComment = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // id of the blog
    const blogId = req.params.id;

    // id of the user
    const userId = (req.user! as IUser)._id;

    // comment
    const commentId: string = req.body.commentId;

    // find the blog
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return next(
        new ApiError(
          {
            en: 'Blog Not Found',
            ar: 'المدونة غير موجودة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // find the comment
    const comment = blog.comments.find(
      (comment) => comment._id.toString() === commentId,
    );

    if (!comment) {
      return next(
        new ApiError(
          {
            en: 'Comment Not Found',
            ar: 'التعليق غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // check if the user is the owner of the comment

    if (
      comment.user.toString() !== userId.toString() &&
      ((req.user! as IUser).role === 'guest' ||
        (req.user! as IUser).role === 'marketer')
    ) {
      return next(
        new ApiError(
          {
            en: 'You Are Not The Owner Of The Comment',
            ar: 'أنت لست صاحب التعليق',
          },
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    // delete the comment
    await Blog.findByIdAndUpdate(
      { _id: blogId },
      {
        $pull: {
          comments: {
            _id: commentId,
          },
        },
      },
      { new: true },
    );

    // send response
    res.status(StatusCodes.OK).json({
      status: 'success',
      success_en: 'Comment Deleted Successfully',
      success_ar: 'تم حذف التعليق بنجاح',
    });
  },
);

// @desc     Add Reply To Comment
// @route    POST/api/v1/blogs/addReply/:id
// @access   Private
export const addReply = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const blogId = req.params.id;
    const userId = (req.user! as IUser)._id;
    const commentId = req.body.commentId;
    const reply = req.body.reply;

    const blog = await Blog.findOne({
      _id: blogId,
    });
    if (!blog) {
      return next(
        new ApiError(
          {
            en: 'Blog Not Found',
            ar: 'المدونة غير موجودة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // i want add reply to the comment
    blog.comments.filter((comment) => {
      if (comment?._id.toString() === commentId) {
        comment.replies.push({
          user: { userId: userId, email: (req.user! as IUser).email || '' },
          reply,
          _id: new Types.ObjectId(),
        });
      }
    });

    // save the blog
    await blog.save();

    // send response
    res.status(StatusCodes.OK).json({
      status: 'success',
      success_en: 'Reply Added Successfully',
      success_ar: 'تم اضافة الرد بنجاح',
    });
  },
);

// @desc     Delete Reply From Comment
// @route    POST/api/v1/blogs/deleteReply/:id
// @access   Private
export const deleteReply = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const blogId = req.params.id;
    const userId = (req.user! as IUser)._id;
    const commentId = req.body.commentId;
    const replyId = req.body.replyId;

    const blog = await Blog.findOne({ _id: blogId });
    if (!blog) {
      return next(
        new ApiError(
          {
            en: 'Blog Not Found',
            ar: 'المدونة غير موجودة',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const comment = blog.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return next(
        new ApiError(
          {
            en: 'Comment Not Found',
            ar: 'التعليق غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const replyIndex = comment.replies.findIndex(
      (r) => r._id.toString() === replyId,
    );
    if (replyIndex === -1) {
      return next(
        new ApiError(
          {
            en: 'Reply Not Found',
            ar: 'الرد غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // check if the user is the owner of the reply
    if (
      comment.replies[replyIndex].user.userId.toString() !==
        userId.toString() &&
      ((req.user! as IUser).role === 'guest' ||
        (req.user! as IUser).role === 'marketer')
    ) {
      return next(
        new ApiError(
          {
            en: 'You Are Not The Owner Of The Reply',
            ar: 'أنت لست صاحب الرد',
          },
          StatusCodes.UNAUTHORIZED,
        ),
      );
    }

    comment.replies.splice(replyIndex, 1);

    // Save the updated blog
    await blog.save();

    // send response
    res.status(StatusCodes.OK).json({
      status: 'success',
      success_en: 'Reply Deleted Successfully',
      success_ar: 'تم حذف الرد بنجاح',
    });
  },
);
