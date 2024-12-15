import { getAllLanguages } from "../../controller/getAllLanguages";

import { Router } from "express";
import { redisWebhook } from "../../controller/v2/redisWebhook";
const router:ReturnType<typeof Router> = Router();




router.post("/redisWebhook",redisWebhook);
router.get("/languages",getAllLanguages);

export default router;