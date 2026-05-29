import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema, bindCoupleSchema, initializeCoupleSchema } from '../utils/validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

router.get('/profile', authenticateToken, userController.getProfile);
router.post('/couple/initialize', authenticateToken, validate(initializeCoupleSchema), userController.initializeCouple);
router.post('/couple/bind', authenticateToken, validate(bindCoupleSchema), userController.bindCouple);
router.get('/couple', authenticateToken, userController.getCouple);

export default router;
