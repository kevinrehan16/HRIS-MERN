import { Router } from 'express';

import { registerSchema } from '../schemas/auth.schema.js';
import { validate } from '../middlewares/validate.middleware.js';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', login);

export default router;