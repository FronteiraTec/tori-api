import { Router } from 'express';
import * as controller from '../controllers/authController';


const router = Router();
// const routerBase = Router();


router.post('/sign-in', controller.signIn);
router.post('/sign-up', controller.signUp);
router.post('/idUFFS', controller.loginIdUFFS);


export default router;