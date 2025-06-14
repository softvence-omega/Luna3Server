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


// Get both common and personalized exercises
const getExerciseBothCommonAndPersonalize = catchAsync(async (req, res) => {
    const userId = req.user?.id; // Assuming user ID is attached to req.user from authentication middleware
    if (!userId) {
      throw new Error('User not authenticated.');
    }
    const convertedUserId = idConverter(userId) as Types.ObjectId;
  
    const exercises = await exerciseServicves.getExerciseBothCommonAndPersonalize(convertedUserId);
  
    res.status(200).json({
      success: true,
      message: 'Exercises retrieved successfully.',
      data: exercises,
    });
  });
  
  // Get exercise by ID
  const getExerciseById = catchAsync(async (req, res) => {
    const exerciseId  = req.query.exerciseId as string;
    if (!Types.ObjectId.isValid(exerciseId)) {
      throw new Error('Invalid exercise ID.');
    }
    const convertedExerciseId = idConverter(exerciseId) as Types.ObjectId;
  
    const exercise = await exerciseServicves.getExerciseById(convertedExerciseId);
  
    res.status(200).json({
      success: true,
      message: 'Exercise retrieved successfully.',
      data: exercise,
    });
  });
  


  // Perform an exercise
  const performExercise = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated.');
    }
    const convertedUserId = idConverter(userId) as Types.ObjectId;
  
    const payload = req.body;
  
    const savedExercisePerform = await exerciseServicves.performExercise(convertedUserId, payload);
  
    res.status(201).json({
      success: true,
      message: 'Exercise performed successfully.',
      data: savedExercisePerform,
    });
  });
  
  // Mark exercise as completed
  const markExerciseAsCompleated = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated.');
    }
    const convertedUserId = idConverter(userId) as Types.ObjectId;
  
    const  performedExerciseId  = req.query.performedExerciseId as string;
    if (!Types.ObjectId.isValid(performedExerciseId)) {
      throw new Error('Invalid performed exercise ID.');
    }
    const convertedPerformedExerciseId = idConverter(performedExerciseId) as Types.ObjectId;
  
    const updatedExercise = await exerciseServicves.markExerciseAsCompleated(
      convertedUserId,
      convertedPerformedExerciseId
    );
  
    if (!updatedExercise) {
      throw new Error('Performed exercise not found or user not authorized.');
    }
  
    res.status(200).json({
      success: true,
      message: 'Exercise marked as completed successfully.',
      data: updatedExercise,
    });
  });


const exerciseController = {
    createCommonExercise,createPersonalizeExercise,getExerciseBothCommonAndPersonalize,getExerciseById,performExercise,markExerciseAsCompleated
}

export default exerciseController