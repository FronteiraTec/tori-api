import { Router } from 'express';


import assistanceRouter from './assistanceRoutes';
import authRouter from './authRoutes';
import userRouter from './userRoutes';
import { saveUserUniqueQrCodeFromRawId, decryptText } from 'src/helpers/outputHelper';

const router = Router();

router.use("/assistance", assistanceRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);

//TODO: route to get userImage
//TODO: encript assistance id and decript it 
//TODO: route to confirm user presence on assistance

export default router;