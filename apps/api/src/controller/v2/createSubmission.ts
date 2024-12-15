import { addJobs } from "../../utils/queue";
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";


export const createSubmission= asyncHandler(async(req:Request,res:Response)=>{
    const {code,language,stdin}=req.body;
//zod validation


//create submission
const data = await addJobs(code,language,stdin);
if(!data){
    return res.status(400).json(new ApiResponse(400, "Submission failed", ));
}

res.status(201).json(new ApiResponse(200, "Submission created", data));
})
