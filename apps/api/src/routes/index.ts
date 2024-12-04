import { Router } from "express";

import submitRouter from "./submit";


const router:ReturnType<typeof Router>  = Router();

router.use("/submissions", submitRouter);

export default router;
