import { Types } from "mongoose";
import catchAsync from "../../util/catchAsync";
import idConverter from "../../util/idConvirter";
import exerciseServicves from "./exercise.service";

const createCommonExercise = catchAsync(async(req, res)=>{
    const File= req.file
    if(!File){
        throw new Error("img file is required")
    }
    const data= req.body.data

    if(!data)
    {
        console.log("data must be there")
    }

    const convertData = JSON.parse(data)

 const result = await exerciseServicves.createCommonExercise(File, convertData)
 
 res.status(200).json({
    success:true,
    message:"a common exercise created",
    data:result
 })
})


const createPersonalizeExercise = catchAsync(async(req, res)=>{
    const user_id = req.user.id
    const convertedUserId= idConverter(user_id)
    
    const File= req.file
    if(!File){
        throw new Error("img file is required")
    }
    const data= req.body.data

    if(!data)
    {
        console.log("data must be there")
    }

    const convertData = JSON.parse(data)

 const result = await exerciseServicves.createPersonalizeExercise(File, convertData, convertedUserId as Types.ObjectId)

 res.status(200).json({
    success:true,
    message:"a common exercise created",
    data:result
 })
})

const exerciseController = {
    createCommonExercise,createPersonalizeExercise
}

export default exerciseController