import express from 'express';
import { createOrder, getMyOrders } from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();
router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);

export default router;