import express from 'express';
import { register, login, getAllCustomers } from '../controllers/auth.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/customers', verifyToken, isAdmin, getAllCustomers);

export default router;