import { Types } from "mongoose";
import catchAsync from "../../util/catchAsync";
import idConverter from "../../util/idConvirter";
import barbelLLMServices from "./barbel.service";

const createExerciseRoutine =catchAsync(async(req,res)=>{
    const user_id = req.user.id
    const convertedId = idConverter(user_id)as Types.ObjectId
    const payLoad= req.body

    const result  = await barbelLLMServices.createExerciseRoutine(user_id, payLoad)

    res.status(200).json({
        success:true,
        message:"work out routine generated",
        data:result
    })
})


const saveWorkOutPlan =catchAsync(async(req,res)=>{
    const user_id = req.user.id
    const convertedId = idConverter(user_id)as Types.ObjectId
    const payLoad= req.body

    const result  = await barbelLLMServices.saveWorkOutPlan(user_id, payLoad)

    res.status(200).json({
        success:true,
        message:"work out routine is saved",
        data:result
    })
})

const getWorkoutRoutine =catchAsync(async(req,res)=>{
    const user_id = req.user.id
    const convertedId = idConverter(user_id)as Types.ObjectId
    

    const result  = await barbelLLMServices.getWorkoutRoutine(convertedId)

    res.status(200).json({
        success:true,
        message:"work out routine is saved",
        data:result
    })
})

const updateExerciseRoutine =catchAsync(async(req,res)=>{
    const user_id = req.user.id
    const convertedId = idConverter(user_id)as Types.ObjectId
    const feedBack = req.body

    

    const result  = await barbelLLMServices.updateExerciseRoutine(convertedId,feedBack.feedBack)

    res.status(200).json({
        success:true,
        message:"work out routine is updated",
        data:result
    })
})

const barbellController= {
    createExerciseRoutine,saveWorkOutPlan,getWorkoutRoutine,updateExerciseRoutine
}

export default barbellController