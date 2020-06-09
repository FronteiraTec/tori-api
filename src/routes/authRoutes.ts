import { Router } from 'express';
import * as controller from '../controllers/authController';

const router = Router();

router.post('/sign-in', controller.signIn);
router.post('/sign-up', controller.signUp);
router.post('/sign-in-uffs', controller.signInUFFS);
router.get('/available', controller.verifyAvailability);

export default router;