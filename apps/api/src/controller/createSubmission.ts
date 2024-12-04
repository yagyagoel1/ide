import { Request,Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";

export const createSubmission= asyncHandler(async(req:Request,res:Response)=>{
const {code,language,stdin}=req.body;
//zod validation


//create submission 
const response  = await fetch(`${process.env.BASE_URL}/submissions?base64_encoded=false&wait=false`, {
    method: "POST",
    headers: {
        "content-type": "application/json",
    },
    body: JSON.stringify({
        source_code: code,
        language_id: language,
        stdin: stdin,
    }),
})
const data = await response.json();
if(response.status>=400){
    return res.status(200).json(new ApiResponse(400, "Submission failed", ));
}

res.status(201).json(new ApiResponse(200, "Submission created", data));
})