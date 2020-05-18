import { Router } from 'express';


import assistanceRouter from './assistanceRoutes';


const router = Router();

router.use(assistanceRouter)

export default router;