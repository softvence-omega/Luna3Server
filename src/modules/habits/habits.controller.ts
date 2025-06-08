import { Types } from "mongoose";
import catchAsync from "../../util/catchAsync";
import idConverter from "../../util/idConvirter";
import habitServices from "./habits.service";

const createHabit= catchAsync(async(req,res)=>{

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
    
    const result = await habitServices.createHabit(File, convertData);
    
    res.status(200).json({
        status: 'success',
        message: 'Habit created successfully',
        data: result,
    });
})



const getHabit= catchAsync(async(req,res)=>{

    
    const result = await habitServices.getHabit();
    
    res.status(200).json({
        status: 'success',
        message: 'Habit fetched successfully',
        data: result,
    });
})


const addHabitToLife= catchAsync(async(req,res )=>{
const userId= req.user.id
const convertedUserid = idConverter(userId)

const result = await habitServices.addHabitToLife(convertedUserid as Types.ObjectId, req.body)
res.status(200).json({
    status: 'success',
    message: 'Habit added to life successfully',
    data: result,
});
})


const updateUserHabit= catchAsync(async(req,res )=>{
const userId= req.user.id
const convertedUserid = idConverter(userId)
const habit_id= req.query.habit_id as string
const convirtedhabitId= idConverter(habit_id)

const result = await habitServices.updateUserHabit(convertedUserid as Types.ObjectId, convirtedhabitId as Types.ObjectId, req.body)
res.status(200).json({
    status: 'success',
    message: 'Habit added to life successfully',
    data: result,
});
})

const habitController ={
    createHabit,getHabit,addHabitToLife,updateUserHabit
}
export default habitController