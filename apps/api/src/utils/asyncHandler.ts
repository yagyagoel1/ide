import { NextFunction, Request, Response } from "express"
import { ApiResponse } from "./apiResponse"

export const asyncHandler  = (requestHandler:any)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        try{
            await requestHandler(req,res,next)
        }catch(error){
            console.error("error in asyncHandler",error)
            res.status(500).json(new ApiResponse(500,"oops something went wrong"))
        }
    }
}