import { getJobStatus } from "../../utils/queue";
import { getData } from "../../utils/redis";
import { ApiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import {Request,Response} from "express"
export const responseGenerated = asyncHandler(async(req:Request,res:Response)=>{
    const {token}=req.body;

   
//Returns one of these values: 'completed', 'failed', 'delayed', 'active', 'waiting', 'waiting-children', 'unknown'.
    const data = await getJobStatus(token);
    if(data=="failed"){
        return res.status(400).json(new ApiResponse(400, "Submission failed", ));
    }
    else if(data=="waiting" || data=="waiting-children" || data=="active" || data=="delayed"){
        return res.status(200).json(new ApiResponse(200, "Submission in progress", ));
    }
    else if(data=="completed"){

        const data  =await getData(token);
        if(!data){
            return res.status(400).json(new ApiResponse(400, "something went wrong", ));
        }
        else{
            return res.status(200).json(new ApiResponse(200, "Submission completed", data));
        }

    }
    else{
        return res.status(400).json(new ApiResponse(400, "Submission failed", ));
    }



})