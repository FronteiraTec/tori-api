import { Router } from 'express';
import * as controller from '../controllers/userController';
import { userAuthenticated } from "../middleware/authMiddleware";


const router = Router();
// const routerBase = Router();

router.get('/', userAuthenticated, controller.getUser);
router.patch('/', userAuthenticated, controller.updateUser);


router.get('/search', userAuthenticated, controller.searchUser);
router.put('/profile-picture', userAuthenticated, controller.uploadImage);


//TODO: search user assistances - created by or subscribed 
router.get('/assistance', userAuthenticated, () => {});



// TODO: Logar com cpf e nome de usuário também
// TODO padronizar respostas

export default router;