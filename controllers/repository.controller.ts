import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import expressAsyncHandler from 'express-async-handler';
import { Types } from 'mongoose';

// Models
import { Repository } from '../models/repository.model';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
// Interfaces
import { IProduct } from '../interfaces/product/product.interface';
import { Status } from '../interfaces/status/status.enum';
// Utils
import ApiError from '../utils/ApiError';

import {
  getAllItems,
  getOneItemById,
  updateOneItemById,
} from './factory.controller';
// import { IRepository } from "../interfaces/repository/repository.interface";

// @desc    Get All Repositories
// @route   POST /api/v1/repositories
// @access  Private (Admin)
export const getAllRepositories = getAllItems(Repository, [
  'products.productId',
]);

// @desc    Get Specific Repository By Id
// @route   Get /api/v1/repositories/:id
// @access  Private (Admin)
export const getRepositoryById = getOneItemById(Repository, [
  'products.productId',
]);

// @desc    Create a new repository
// @route   POST /api/v1/repositories
// @access  Private (Admin)
export const createRepository = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get data from body
    const { name_en, name_ar, products, address } = req.body;

    // 2- validate products array
    if (!Array.isArray(products) || products.length === 0) {
      const repository = new Repository({
        name_en,
        name_ar,
        quantity: 0,
        products,
        address,
      });

      const newRepository = await repository.save();

      // 6- send response
      res.status(StatusCodes.CREATED).json({
        status: 'success',
        data: newRepository,
        success_en: 'Repository created successfully',
        success_ar: 'تم إنشاء المستودع بنجاح',
      });
    }
    const repository = await Repository.findOne({ name_ar, name_en });
    if (repository) {
      return next(
        new ApiError(
          {
            en: 'Repository name already exists',
            ar: 'اسم المستودع موجود بالفعل',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    // 4- calculate total quantity from product quantities
    const totalQuantity = products.reduce(
      (total: number, product: IProduct) => total + product.quantity,
      0,
    );

    // 5- create a new repository
    const newRepository = new Repository({
      name_en,
      name_ar,
      quantity: totalQuantity,
      products,
      address,
    });

    const RepositoryResult = await newRepository.save();

    // 3- validate each product in the array
    for (const product of products) {
      const { productId, quantity } = product;

      if (!productId || !quantity || quantity < 0) {
        return next(
          new ApiError(
            {
              en: 'Invalid product data',
              ar: 'بيانات المنتج غير صالحة',
            },
            StatusCodes.BAD_REQUEST,
          ),
        );
      }

      const eachProduct: IProduct | null =
        await Product.findById(productId).exec();

      if (!eachProduct) {
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
      //const=remainingQuantity= eachProduct.repoQuantity - productQuantity
      const remainingQuantity = eachProduct.quantity - eachProduct.repoQuantity;

      // if(remaining )
      if (quantity > remainingQuantity) {
        return next(
          new ApiError(
            {
              en: 'Quantity must be less than Product quantity',
              ar: 'يجب أن تكون الكمية أقل من أو تساوي كمية المنتج',
            },
            StatusCodes.BAD_REQUEST,
          ),
        );
      }
      //eachProduct.repoQuantity-=quanity;
      // eachProduct.repoQuantity += quantity;
      // await eachProduct.save();
      await Product.findByIdAndUpdate(
        { _id: productId },
        {
          $inc: { repoQuantity: quantity },
          $addToSet: { repoIds: RepositoryResult._id },
        }, // Increment repoQuantity by the product quantity
        { new: true },
      );
    }

    // 6- send response
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: RepositoryResult,
      success_en: 'Repository created successfully',
      success_ar: 'تم إنشاء المستودع بنجاح',
    });
  },
);

// @desc    Update Repository By Id
// @route   POST /api/v1/repositories/:id
// @access  Private (Admin)
export const updateRepository = updateOneItemById(Repository);

// @desc    Delete Repository By Id
// @route   POST /api/v1/repositories/:id
// @access  Private (Admin)
export const deleteRepository = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const repositoryId = req.params.id;

    // Find the repository to be deleted
    const repository = await Repository.findById(repositoryId)
      .populate('products.productId')
      .exec();

    if (!repository) {
      return next(
        new ApiError(
          {
            en: 'Repository not found',
            ar: 'المستودع غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    if (repository.products.length > 0) {
      return next(
        new ApiError(
          {
            en: 'Repository has products',
            ar: 'المستودع يحتوي على منتجات',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    // Delete the repository
    await Repository.deleteOne({ _id: repository._id });

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: null,
      success_en: 'Repository deleted successfully',
      success_ar: 'تم حذف المستودع بنجاح',
    });
  },
);
// @desc    Add Product To Repository By Id
// @route   POST /api/v1/repositories/:id/add-product
// @access  Private (Admin)
export const addProductToRepository = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get data from body
    const { productId, quantity } = req.body;
    const repositoryId = req.params.id;

    // 2- find repository by ID
    const repository = await Repository.findById(repositoryId);
    //check if repository is found
    if (!repository) {
      return next(
        new ApiError(
          {
            en: 'Repository not found',
            ar: 'المستودع غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // 3- find product by ID
    const product = await Product.findById(productId);
    //check if product is found
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
    // calculate remaining quantity
    const remainingQuantity = product.quantity - product.repoQuantity;
    //check if the remaining quantity is less than the quantity to be added (quantity must be less than the remaining quantity)
    if (quantity > remainingQuantity) {
      return next(
        new ApiError(
          {
            en: 'Quantity must be less than Product quantity',
            ar: 'يجب أن تكون الكمية أقل من أو تساوي كمية المنتج',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    // check if the quantity is less than 0
    if (product.quantity < 0 || quantity < 0) {
      return next(
        new ApiError(
          {
            en: 'Quantity must be greater than 0',
            ar: 'يجب أن تكون الكمية أكبر من 0',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    // product.repoQuantity += quantity;
    // await product.save();
    await Product.findByIdAndUpdate(
      { _id: productId },
      {
        $inc: { repoQuantity: quantity },
        $addToSet: { repoIds: repositoryId },
      }, // Increment repoQuantity by the product quantity
      { new: true },
    );
    // 4- check if the product already exists in the repository
    const existingProduct = repository.products.find(
      (item) => item.productId.toString() === product._id.toString(),
    );

    if (existingProduct) {
      // Update the quantity of the existing product and the repository
      existingProduct.quantity = +existingProduct.quantity + +quantity; // convert to numbers and add
      repository.quantity = +repository.quantity + +quantity;
    } else {
      // Add the product to the repository if it doesn't exist
      repository.products.push({
        productId,
        quantity,
      });
      repository.quantity = +repository.quantity + +quantity;
    }

    await repository.save();

    // 5- send response
    res.status(StatusCodes.CREATED).json({
      status: Status.SUCCESS,
      data: repository,
      success_en: 'Product added to repository successfully',
      success_ar: 'تمت إضافة المنتج إلى المستودع بنجاح',
    });
  },
);

// @desc    Delete Product From Repository By Id
// @route   DELETE /api/v1/repositories/:id/products/:productId
// @access  Private (Admin)
export const deleteProductFromRepository = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const repositoryId = req.params.id;
    const productId = req.params.productId;

    // Find the repository
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      return next(
        new ApiError(
          {
            en: 'Repository not found',
            ar: 'المستودع غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // Find the product in the repository
    const productIndex = repository.products.findIndex(
      (item) => item.productId.toString() === productId,
    );
    if (productIndex === -1) {
      return next(
        new ApiError(
          {
            en: 'Product not found in the repository',
            ar: 'المنتج غير موجود في المستودع',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // Get the product details
    const productDetails = repository.products[productIndex];
    // Get the product from collection
    const product = await Product.findById(productId);
    //check if product is found
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
    // check if the quantity is less than 0
    if (product.quantity < 0 || product.repoQuantity < 0) {
      return next(
        new ApiError(
          {
            en: 'Quantity must be greater than 0',
            ar: 'يجب أن تكون الكمية أكبر من 0',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    if (product.repoQuantity < productDetails.quantity) {
      return next(
        new ApiError(
          {
            en: 'Quantity must be less than Product quantity',
            ar: 'يجب أن تكون الكمية أقل من أو تساوي كمية المنتج',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    // Update the repoQuantity of the product
    await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { repoQuantity: -productDetails.quantity },
        $pull: { repoIds: repositoryId },
      }, // Decrement repoQuantity by the product quantity
      { new: true },
    );

    // Update the repository details
    repository.quantity -= productDetails.quantity;
    repository.products.splice(productIndex, 1);

    // Save the changes
    await repository.save();

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: repository,
      success_en: 'Product deleted from repository successfully',
      success_ar: 'تم حذف المنتج من المستودع بنجاح',
    });
  },
);

// @desc    Update Product In Repository By Id
// @route   PUT /api/v1/repositories/:id/products/:productId
// @access  Private (Admin)
export const updateProductInRepository = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: repositoryId, productId } = req.params;
    const { quantity } = req.body;

    // Find repository by id
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      return next(
        new ApiError(
          { en: 'Repository not found', ar: 'المستودع غير موجود' },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // Find product in repository
    const productIndex = repository.products.findIndex(
      (item: { productId: Types.ObjectId; quantity: number }) =>
        item.productId.toString() === productId,
    );
    if (productIndex === -1) {
      return next(
        new ApiError(
          {
            en: 'Product not found in the repository',
            ar: 'المنتج غير موجود في المستودع',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const productDetails = repository.products[productIndex];

    // Reset product quantity in Product Collection
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { repoQuantity: -productDetails.quantity } },
      { new: true },
    );
    if (!updatedProduct) {
      return next(
        new ApiError(
          { en: 'Product not found', ar: 'المنتج غير موجود' },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    // Reset repository quantity
    repository.quantity -= productDetails.quantity;
    await repository.save();

    // Reset repository product quantity
    repository.products[productIndex].quantity = 0;
    await repository.save();

    // Check if the new quantity is valid
    if (
      productDetails.quantity < 0 ||
      +quantity < 0 ||
      +quantity < productDetails.quantity
    ) {
      return next(
        new ApiError(
          { en: 'Invalid quantity', ar: 'كمية غير صالحة' },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    if (updatedProduct.quantity - updatedProduct.repoQuantity < +quantity) {
      return next(
        new ApiError(
          {
            en: 'Quantity must be less than Product quantity',
            ar: 'يجب أن تكون الكمية أقل من أو تساوي كمية المنتج',
          },
          StatusCodes.BAD_REQUEST,
        ),
      );
    }
    // Update product quantity in Product Collection
    await Product.findByIdAndUpdate(
      productId,
      { $inc: { repoQuantity: quantity } },
      { new: true },
    );

    // Update repository quantity
    repository.quantity += +quantity;
    await repository.save();

    // Update repository product quantity
    repository.products[productIndex].quantity = +quantity;
    await repository.save();

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: repository,
      success_en: 'Product updated in repository successfully',
      success_ar: 'تم تحديث المنتج في المستودع بنجاح',
    });
  },
);

// @desc    Get All Repositories For All Products
// @route   POST /api/v1/repositories/allProduct/:orderId
// @access  Private (Admin)
export const getAllRepositoriesForAllProducts = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- get data from body
    const { id } = req.params;

    // 2- find order By Id
    const order = await Order.findById(id);

    if (!order) {
      return next(
        new ApiError(
          {
            en: 'Order not found',
            ar: 'الطلب غير موجود',
          },
          StatusCodes.NOT_FOUND,
        ),
      );
    }

    const onlineItems = order?.onlineItems?.items;
    const cashItems = order?.cashItems?.items;
    const productsWithReops: {
      productId: string;
      product_title_en: string;
      product_title_ar: string;
      Repos: Types.ObjectId[];
    }[] = [];

    await Promise.all(
      onlineItems.map(async (item) => {
        const product = await Product.findById(item.product).populate(
          'repoIds',
        );
        if (product) {
          productsWithReops.push({
            productId: product._id,
            product_title_en: product.title_en,
            product_title_ar: product.title_ar,
            Repos: product.repoIds,
          });
        }
      }),
    );

    await Promise.all(
      cashItems.map(async (item) => {
        const product = await Product.findById(item.product).populate(
          'repoIds',
        );
        if (product) {
          productsWithReops.push({
            productId: product._id,
            product_title_en: product.title_en,
            product_title_ar: product.title_ar,
            Repos: product.repoIds,
          });
        }
      }),
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: productsWithReops,
      success_en: 'Repositories retrieved successfully',
      success_ar: 'تم استرجاع المستودعات بنجاح',
    });
  },
);
