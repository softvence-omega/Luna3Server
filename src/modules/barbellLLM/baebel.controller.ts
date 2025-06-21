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
//==========================>>>>>>>>>>>

const startChatOrGetPreviousChat =catchAsync(async(req,res)=>{
    const user_id = req.user.id
    const convertedId = idConverter(user_id)as Types.ObjectId
    

    const result  = await barbelLLMServices.startChatOrGetPreviousChat(convertedId)

    res.status(200).json({
        success:true,
        message:"chat is retrieved or created",
        data:result
    })
})
const endChat =catchAsync(async(req,res)=>{
    const user_id = req.user.id
    const convertedId = idConverter(user_id)as Types.ObjectId
    

    const result  = await barbelLLMServices.endChat(convertedId)

    res.status(200).json({
        success:true,
        message:"chat is deleted",
        data:result
    })
})

const sendMessageAndGetReply =catchAsync(async(req,res)=>{
    const user_id = req.user.id
    const convertedId = idConverter(user_id)as Types.ObjectId
    const  userFeedback=req.body

    const result  = await barbelLLMServices.sendMessageAndGetReply(convertedId, userFeedback.message)

    res.status(200).json({
        success:true,
        message:"chat is retrieved or created",
        data:result
    })
})


const barbellController= {
    createExerciseRoutine,saveWorkOutPlan,getWorkoutRoutine,updateExerciseRoutine,startChatOrGetPreviousChat,endChat,sendMessageAndGetReply
}

export default barbellController