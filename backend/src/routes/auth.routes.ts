import { Router } from 'express';

import { registerSchema } from '../schemas/auth.schema.js';

import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { register, login, logout, getMyProfile } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', login);
router.post('/logout', logout);

router.use(protect);
router.get('/my-profile', protect, getMyProfile);

export default router;