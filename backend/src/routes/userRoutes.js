import express from 'express';
import * as userController from '../controllers/userController.js';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate, registerSchema, loginSchema, bindCoupleSchema, initializeCoupleSchema } from '../utils/validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

router.get('/profile', authenticateToken, userController.getProfile);
router.post('/couple/initialize', authenticateToken, validate(initializeCoupleSchema), userController.initializeCouple);
router.post('/couple/bind', authenticateToken, validate(bindCoupleSchema), userController.bindCouple);
router.get('/couple', authenticateToken, userController.getCouple);

// Admin routes - require both authentication and admin privileges
router.get('/admin/db-info', authenticateToken, requireAdmin, adminController.getDbInfo);
router.post('/admin/clear-db', authenticateToken, requireAdmin, adminController.clearDatabase);

export default router;
