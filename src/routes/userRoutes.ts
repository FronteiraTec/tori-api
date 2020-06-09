import { Router } from 'express';
import * as controller from '../controllers/userController';
import { userAuthenticated } from "../middleware/authMiddleware";
import { allowedSearchField } from 'src/middleware/permissionMiddleware';


const router = Router();
// const routerBase = Router();

router.get('/', userAuthenticated, allowedSearchField ,controller.getAll);
router.patch('/', userAuthenticated, controller.updateUser);

router.get('/search', userAuthenticated, controller.searchUser);
router.put('/profile-picture', userAuthenticated, controller.uploadImage);

//TODO: search user assistance - created by or subscribed 
router.get('/assistance', userAuthenticated, () => {});

export default router;