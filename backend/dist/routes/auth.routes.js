import { Router } from 'express';
import { registerSchema } from '../schemas/auth.schema.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { register, login, logout, getMyProfile } from '../controllers/auth.controller.js';
const router = Router();
router.post('/login', login);
router.post('/logout', logout);
// Account provisioning is an HR administrator workflow, never a public signup endpoint.
router.post('/register', protect, restrictTo('ADMIN'), validate(registerSchema), register);
router.get('/my-profile', protect, getMyProfile);
export default router;
//# sourceMappingURL=auth.routes.js.map