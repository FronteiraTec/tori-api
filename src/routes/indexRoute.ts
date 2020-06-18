import { Router } from 'express';


import assistanceRouter from './assistanceRoutes';
import authRouter from './authRoutes';
import userRouter from './userRoutes';
// import { encryptTextHex } from 'src/helpers/utilHelper';

const router = Router();

router.use("/assistance", assistanceRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);

// TODO: test all routes


// router.get("/", (req: any, res: any) => {
//     const {id} = req.query;

//     res.json(encryptTextHex(id));
// })

export default router;