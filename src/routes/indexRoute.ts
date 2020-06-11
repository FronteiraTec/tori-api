import { Router } from 'express';


import assistanceRouter from './assistanceRoutes';
import authRouter from './authRoutes';
import userRouter from './userRoutes';
import { saveUserUniqueQrCodeFromRawId, decryptText } from 'src/helpers/outputHelper';

const router = Router();

router.use("/assistance", assistanceRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);


//TODO: encript assistance id and decript it 

export default router;