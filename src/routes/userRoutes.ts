import { Router } from 'express';
import * as controller from '../controllers/userController';


const router = Router();
// const routerBase = Router();


router.get('/user', controller.getUser);
router.patch('/user', controller.updateUser);
router.delete('/user', controller.deleteUser);


export default router;