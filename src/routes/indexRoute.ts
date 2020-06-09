import { Router } from 'express';


import assistanceRouter from './assistanceRoutes';
import authRouter from './authRoutes';
import userRouter from './userRoutes';

const router = Router();

router.use("/assistance", assistanceRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);



export default router;