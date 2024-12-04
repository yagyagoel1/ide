import { getAllLanguages } from "../controller/getAllLanguages";

import { Router } from "express";
const router:ReturnType<typeof Router> = Router();





router.get("/languages",getAllLanguages);

export default router;