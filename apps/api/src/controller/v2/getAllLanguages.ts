import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
export const getAllLanguages = asyncHandler(async(req:Request,res:Response)=>{  
    const response = {"1":"node","2" :"python"}
    res.status(200).json(new ApiResponse(200, "Languages fetched", response));
})