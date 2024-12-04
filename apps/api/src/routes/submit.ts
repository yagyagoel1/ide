import { Router } from "express";
import { createSubmission } from "../controller/createSubmission";
import { responseGenerated } from "../controller/responseGenereated";



const router:ReturnType<typeof Router> = Router();
router.post("/isdone",responseGenerated)
router.post("/create",createSubmission);


export default router;
