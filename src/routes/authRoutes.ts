import { Router } from 'express';
import * as controller from '../controllers/authController';


const router = Router();
// const routerBase = Router();



router.post('/sign-in', controller.signIn);
router.post('/sign-up', controller.signUp);
router.post('/sign-in-uffs', controller.signInUFFS);

//TODO: taken
/*
Endpoint para verificar cpfs cadastrados
Endpoint para verificar email cadastrados
Endpoint para verificar username cadastrados
*/
router.post('/taken', () => {});



export default router;