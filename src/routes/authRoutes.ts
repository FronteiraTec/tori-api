import { Router } from 'express';
import * as controller from '../controllers/authController';


const router = Router();
// const routerBase = Router();


router.post('/sign-in', controller.signIn);
router.post('/sign-up', controller.signUp);
router.post('/id-uffs', controller.loginIdUFFS);


export default router;