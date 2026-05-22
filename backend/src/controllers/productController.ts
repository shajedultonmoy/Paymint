import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import { ProductModel } from '../models/productModel';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const products = await ProductModel.findByUser(req.user!.id);
  res.json(products);
});

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.body.productName && !req.body.name) {
    res.status(400);
    throw new Error('Product name is required');
  }

  const product = await ProductModel.create(req.user!.id, req.body);
  res.status(201).json(product);
});

export const getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await ProductModel.findOwnedById(String(req.params.id), req.user!.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found or not authorized');
  }

  res.json(product);
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await ProductModel.update(String(req.params.id), req.user!.id, req.body);
  if (!product) {
    res.status(404);
    throw new Error('Product not found or not authorized');
  }

  res.json(product);
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const removed = await ProductModel.remove(String(req.params.id), req.user!.id);
  if (!removed) {
    res.status(404);
    throw new Error('Product not found or not authorized');
  }

  res.json({ message: 'Product removed' });
});
