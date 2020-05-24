import { Router } from 'express';
import * as controller from '../controllers/userController';
import { userAuthenticated } from "../middleware/authenticationmiddleware";


const router = Router();
// const routerBase = Router();


router.get('/user/search', userAuthenticated, controller.searchUser);
router.get('/user', userAuthenticated, controller.getUser);


router.patch('/user', userAuthenticated, controller.updateUser);

router.put('/user/image', userAuthenticated, controller.uploadImage);


// TODO: Logar com cpf e nome de usuário também
// TODO Endpoint para verificar cpfs cadastrados
// TODO Endpoint para verificar email cadastrados
// TODO Endpoint para verificar username cadastrados
// TODO padronizar respostas

export default router;