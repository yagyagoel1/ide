import { Router } from "express";

import submitRouter from "./submit";
import basicRouter from "./basicRoutes";

const router:ReturnType<typeof Router>  = Router();

router.use("/submissions", submitRouter);
router.use("/basic", basicRouter);
export default router;
