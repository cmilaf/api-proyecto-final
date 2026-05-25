import express from 'express';
import { getAllProducts, searchProducts, createProduct, updateProduct } from '../controllers/product.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/', verifyToken, getAllProducts);
router.get('/search', verifyToken, searchProducts);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);

export default router;