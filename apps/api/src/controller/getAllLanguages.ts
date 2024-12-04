import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
export const getAllLanguages = asyncHandler(async(req:Request,res:Response)=>{  
    const response = await fetch(`${process.env.BASE_URL}/languages`,{
        method: "GET"
    })
    const data = await response.json();
    if(response.status>=400){
        return res.status(400).json(new ApiResponse(400, "Submission failed", ));
    }
    res.status(200).json(new ApiResponse(200, "Languages fetched", data));
})