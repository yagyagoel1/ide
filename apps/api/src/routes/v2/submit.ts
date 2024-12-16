import { Router } from "express";
import { responseGenerated } from "../../controller/v2/responseGeneration";
import { createSubmission } from "../../controller/v2/createSubmission";



const router:ReturnType<typeof Router> = Router();
router.post("/isdone",responseGenerated)
router.post("/create",createSubmission);


export default router;
