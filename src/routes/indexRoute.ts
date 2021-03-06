import { Router } from "express";


import assistanceRouter from "./assistanceRoutes";
import authRouter from "./authRoutes";
import userRouter from "./userRoutes";
import { encryptTextHex, decryptTextHex } from "src/helpers/utilHelper";

const router = Router();

router.use("/assistance", assistanceRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);

router.get("/:id", (req: any, res: any) => {
  const { id } = req.params;

  res.json(encryptTextHex(id));
});

router.get("/d/:id", (req: any, res: any) => {
  const { id } = req.params;

  res.json(decryptTextHex(id));
});

export default router;