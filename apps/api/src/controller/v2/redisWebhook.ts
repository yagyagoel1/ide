
import { addJobs } from "../../utils/queue";
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { setData } from "../../utils/redis";

import dotenv from "dotenv"

dotenv.config();
export const redisWebhook= asyncHandler(async(req:Request,res:Response)=>{  
const {
    taskId,
    code,
    language,
    userInput,
    dockerData,
    dockerError,
    time
    
} = req.body;
//change this to something secure
if(process.env.TOKEN !== req.headers.authorization){
    return res.status(401).json(new ApiResponse(401, "Unauthorized", ));
}

//zod validation

if (!taskId || !code || !language || !userInput || !dockerData || !dockerError || !time) {
    return res.status(400).json(new ApiResponse(400, "Invalid data", ));
}
await setData(taskId, {
    code,
    language,
    userInput,
    dockerData,
    dockerError,
    time,
    
});


res.status(201).json(new ApiResponse(200, "data pushed"));
})
