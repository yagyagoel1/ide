import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {Request,Response} from "express"
export const responseGenerated = asyncHandler(async(req:Request,res:Response)=>{
    const {token}=req.body;

    const response =await fetch(`${process.env.BASE_URL}/submissions/${token}?base64_encoded=false`,{

    method: "GET"
    }
    )

    const data = await response.json();
    if(response.status>=400){
        return res.status(400).json(new ApiResponse(400, "Submission failed", ));
    }
    res.status(201).json(new ApiResponse(200, "Submission created", data));

})