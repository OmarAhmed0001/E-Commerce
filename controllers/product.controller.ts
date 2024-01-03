// Packages NPM Imports
import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';

// Utils
import { ApiFeatures } from '../utils/ApiFeatures';
import ApiError from '../utils/ApiError';
import { createNotificationAll } from '../utils/notification';
import { createMetaData, deleteMetaData } from '../utils/MetaData';
// Models
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { SubCategory } from '../models/subCategory.model';
import { Cart } from '../models/cart.model';
import { Review } from '../models/review.model';
import { Order } from '../models/order.model';
import { Comment } from '../models/comment.model';
import { Repository } from '../models/repository.model';
import { Meta } from '../models/meta.model';
import { Offer } from '../models/offer.model';
import { Brand } from '../models/brand.model';
// Interfaces
import { Status } from '../interfaces/status/status.enum';
import { IQuery } from '../interfaces/factory/factory.interface';
import { IMeta } from '../interfaces/meta/meta.interface';
import { IUser } from '../interfaces/user/user.interface';

// Factory Function
import { getAllItems, getOneItemById } from './factory.controller';

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
export const getAllProducts = getAllItems(
  Product,
  ['attributes', 'category', 'subCategory', 'metaDataId', 'offer'],
  '-directDownloadLink -link',
);

// @desc      Get product by id
// @route     GET /api/v1/products/:id
// @access    Public
export const getProductById = getOneItemById(
  Product,
  ['attributes', 'category', 'subCategory', 'brand', 'metaDataId', 'offer'],
  '-directDownloadLink -link',
);

// @desc      Get product by id
// @route     GET /api/v1/products/:id
// @access    Public
export const getProductByIdDash = getOneItemById(
  Product,
  ['attributes', 'category', 'subCategory', 'brand', 'metaDataId', 'offer'],
  '-directDownloadLink',
);

// @desc      Get all products by category id
// @route     GET /api/v1/products/forSpecificCategory/:categoryId?page=1&limit=10
// @access    Public
export const getAllProductsByCategoryId = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get id form params
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);

    if (!category) {
      return next(
        new ApiError(
          {
            en: 'Category not found',
            ar: 'القسم غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }
    // 2- get all products belong to specific category from MongooseDB
    const query = req.query as IQuery;
    const mongoQuery = Product.find({ category: categoryId });

    // 4- get features
    const { data, paginationResult } = await new ApiFeatures(mongoQuery, query)
      .populate()
      .filter()
      .limitFields()
      .search()
      .sort()
      .paginate();
    if (data.length === 0) {
      return next(
        new ApiError(
          {
            en: 'not found',
            ar: 'غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 6- send response
    res.status(200).json({
      status: 'success',
      results: data.length,
      paginationResult,
      category,
      data: data,
      success_en: 'Successfully',
      success_ar: 'تم بنجاح',
    });
  },
);

// @desc      create new product
// @route     POST /api/v1/products
// @access    Private
export const createProduct = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.body;
    // 1- check if category and subCategory exist
    // 2- check of Brand exist
    if (req.body.brand) {
      const isBrandExist = await Brand.findById(req.body.brand);
      if (!isBrandExist) {
        return next(
          new ApiError(
            {
              en: 'Brand not found',
              ar: 'العلامة التجارية غير موجودة',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
    }
    // 3- create new product
    const { quantity } = req.body;
    if (quantity === 0 || !quantity) {
      // delete req.body.quantity
      delete req.body.quantity;
    }
    req.body.priceAfterDiscount = 0;
    const product = await Product.create(req.body);
    const reference = product._id;

    let MetaData = {};

    // Check if title_meta and desc_meta exist in the request body
    if (req.body.title_meta && req.body.desc_meta) {
      // Assuming createMetaData is an asynchronous function that creates metadata
      MetaData = await createMetaData(req, reference);
      await product.updateOne({ metaDataId: (MetaData as IMeta)._id });
    }

    // send notification to all users
    const { title, message } = req.body;
    const sender = (req.user && (req.user as IUser)._id)?.toString(); // add type guard to check if req.user exists
    const link = `${process.env.APP_URL1}/products/${
      product._id
    }/${product.title_en.replace(/\s/g, '-')}`;

    let notification = {};
    if (title && message && sender) {
      // if (receiver === "all") {
      notification = await createNotificationAll(
        title,
        message,
        sender,
        ['user'],
        link,
      );
      // } else {
      //   notification = await createNotification(title, message, sender, receiver);
      // }
      if (notification === -1) {
        return next(
          new ApiError(
            {
              en: 'notification not created',
              ar: 'لم يتم إنشاء الإشعار',
            },
            StatusCodes.NOT_FOUND,
          ),
        );
      }
    }

    ////////////////////////////////

    // 4- increment subCategoryCount in Category
    await Category.updateOne({ _id: category }, { $inc: { productsCount: 1 } });

    // 5- increment productsCount in SubCategory
    if (req.body.subCategory) {
      await SubCategory.updateOne(
        { _id: req.body.subCategory },
        { $inc: { productsCount: 1 } },
      );
    }
    // 6- increment productsCount in Brand
    if (req.body.brand) {
      await Brand.updateOne(
        { _id: req.body.brand },
        { $inc: { productsCount: 1 } },
      );
    }

    // 7- send response
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: {
        product,
        MetaData,
        notification,
      },
      success_en: 'Product created successfully',
      success_ar: 'تم إنشاء المنتج بنجاح',
    });
  },
);

// @desc      update product
// @route     PUT /api/v1/products/:id
// @access    Private
export const updateProduct = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- Get id from params
    const { id } = req.params;

    // 2- check if meta already exist
    const exist = await Meta.findOne({ reference: id });
    if (!exist && req.body.title_meta && req.body.desc_meta) {
      const newMeta = (await createMetaData(req, id)) as IMeta;
      await Product.findByIdAndUpdate(
        id,
        { metaDataId: newMeta._id, ...req.body },
        { new: true },
      );
    } else if (exist && req.body.title_meta && req.body.desc_meta) {
      await Meta.updateOne(
        { reference: id },
        { title_meta: req.body.title_meta, desc_meta: req.body.desc_meta },
      );
    }

    // 3- update product
    const prevProduct = await Product.findById(id);
    if (!prevProduct) {
      return next(
        new ApiError(
          {
            en: 'Product not found',
            ar: 'المنتج غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    let priceAfterDisc = 0;
    if (prevProduct.offer) {
      const offerUsed = await Offer.findOne({ _id: prevProduct.offer });
      if (offerUsed) {
        priceAfterDisc =
          req.body.priceBeforeDiscount -
          (req.body.priceBeforeDiscount * offerUsed?.percentage) / 100;
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        priceAfterDiscount: priceAfterDisc,
      },
      { new: true },
    );

    if (!product) {
      return next(
        new ApiError(
          {
            en: 'Product not found',
            ar: 'المنتج غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    ////////////////////////////////

    // 4- increment productsCount in Category
    if (req.body.category && !prevProduct.category) {
      await Category.updateOne(
        { _id: req.body.category },
        { $inc: { productsCount: 1 } },
      );
    }

    // 5- increment productsCount in SubCategory
    if (req.body.subCategory && !prevProduct.subCategory) {
      await SubCategory.updateOne(
        { _id: req.body.subCategory },
        { $inc: { productsCount: 1 } },
      );
    }
    // 6- increment productsCount in Brand
    if (req.body.brand && !prevProduct.brand) {
      await Brand.updateOne(
        { _id: req.body.brand },
        { $inc: { productsCount: 1 } },
      );
    }

    //////////////////////////////////

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      data: product,
      success_en: 'Product updated successfully',
      success_ar: 'تم تحديث المنتج بنجاح',
    });
  },
);

// @desc      delete product
// @route     DELETE /api/v1/products/:id
// @access    Private
export const deleteProduct = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- check if product exist
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(
        new ApiError(
          {
            en: 'Product not found',
            ar: 'المنتج غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }
    // 2- check if product in order
    const order = await Order.findOne({ 'orderItems.product': req.params.id });
    if (order) {
      return next(
        new ApiError(
          {
            en: 'Product in order',
            ar: 'المنتج موجود في طلب',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    // 3- check if product in cart and delete it
    await Cart.updateMany(
      { 'cartItems.product': req.params.id },
      { $pull: { cartItems: { product: req.params.id } } },
    );

    // 4- delete cart if cartItems is empty
    await Cart.deleteMany({ cartItems: { $size: 0 } });

    // 5- delete all reviews and comments for this product
    await Comment.findOneAndDelete({ product: req.params.id });
    await Review.findOneAndDelete({ product: req.params.id });

    const deleted = await deleteMetaData(req.params.id);
    if (deleted) {
      // 6- delete product
      await product.deleteOne();
    } else {
      return next(
        new ApiError(
          {
            en: "this Product can't be deleted because MetaData has not  deleted",
            ar: ' لا يمكن حذف هذا المنتج لأن البيانات الوصفية لم يتم حذفها',
          },
          StatusCodes.FAILED_DEPENDENCY,
        ),
      );
    }

    // 7- increment subCategoryCount in Category
    await Category.updateOne(
      { _id: product.category },
      { $inc: { productsCount: -1 } },
    );

    // 8- increment productsCount in SubCategory
    await SubCategory.updateOne(
      { _id: product.subCategory },
      { $inc: { productsCount: -1 } },
    );
    // 9- increment productsCount in Brand
    await Brand.updateOne(
      { _id: product.brand },
      { $inc: { productsCount: -1 } },
    );
    // 10- Find and update the repository in one go, using $pull to remove the product
    await Repository.findOneAndUpdate(
      { 'products.productId': req.params.id }, // Find repository where the product is present
      {
        $pull: { products: { productId: req.params.id } },
        $inc: { quantity: -product.quantity },
      },
      { new: true }, // This ensures that you get the updated document
    );

    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      success_en: 'Product deleted successfully',
      success_ar: 'تم حذف المنتج بنجاح',
    });
  },
);

// @desc      toggle Like By someOne By Id
// @route     POST /api/v1/products/toggleLike
// @access    Private
export const toggleLikeBySomeOneById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get user id from req.user
    const { _id } = (req.user as IUser)!;

    // 2- get product from mongooseDB
    const product = await Product.findById(req.params.productId);

    // 3- check if product not found
    if (!product) {
      return next(
        new ApiError(
          {
            en: `Not Found Any Product By This Id: ${req.body.id}`,
            ar: `${req.body.id} : id لا يوجد منتج بهذا ال`,
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 4- check if user already liked this product
    const isUserAlreadyLiked = await Product.findOne({
      likes: {
        $elemMatch: {
          $eq: _id,
        },
      },
    });

    // 5- if user already liked this product => unlike it
    if (isUserAlreadyLiked) {
      await Product.findOneAndUpdate(
        { _id: req.params.productId },
        {
          $pull: { likes: _id },
        },
        { new: true },
      );
      res.status(StatusCodes.OK).json({
        status: Status.SUCCESS,
        success_en: 'Product unliked successfully',
        success_ar: 'تم إلغاء الإعجاب بالمنتج بنجاح',
      });
      return;
    }

    // 6- if user not liked this product => like it

    await Product.findOneAndUpdate(
      { _id: req.params.productId },
      {
        $push: { likes: _id },
      },
      { new: true },
    );

    // 7- send response
    res.status(StatusCodes.OK).json({
      status: Status.SUCCESS,
      success_en: 'Product liked successfully',
      success_ar: 'تم الإعجاب بالمنتج بنجاح',
    });
  },
);
