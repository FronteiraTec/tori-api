import { Router } from 'express';
import * as controller from '../controllers/userController';
import { userAuthenticated } from "../middleware/authMiddleware";
import { allowedSearchField } from 'src/middleware/permissionMiddleware';


const router = Router();

router.get('/', userAuthenticated, allowedSearchField, controller.getAll);
router.patch('/', userAuthenticated, controller.updateUser);
router.delete("/", userAuthenticated, controller.deleteUser);
router.get('/search', userAuthenticated, controller.searchUser);
router.put('/profile-picture', userAuthenticated, controller.uploadImage);
router.get('/assistance/created', userAuthenticated, controller.assistanceCreated);
router.get('/assistance/subscribed', userAuthenticated, allowedSearchField, controller.assistanceSubscribed);
router.post("/generate-qr-code", userAuthenticated, controller.generateQrCode);

export default router;