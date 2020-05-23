import { Router } from 'express';


import assistanceRouter from './assistanceRoutes';
import authRouter from './authRoutes';
import userRouter from './userRoutes';



const router = Router();

router.use(assistanceRouter);
router.use("/auth", authRouter);
router.use(userRouter);

export default router;