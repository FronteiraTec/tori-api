import { Router } from 'express';


import assistanceRouter from './assistanceRoutes';
import authRouter from './authRoutes';



const router = Router();

router.use(assistanceRouter)
router.use("/auth", authRouter)

export default router;