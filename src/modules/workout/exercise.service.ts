import mongoose, { Types } from 'mongoose';
import { TExercise, UserExercisePerform } from './exercise.interface';
import {
  deleteFile,
  uploadImgToCloudinary,
} from '../../util/uploadImgToCludinary';
import { ExerciseModel, UserExercisePerformModel } from './exercise.model';
import { EXERCISE_TYPES } from '../../constents';
import { UserModel, WorkoutASetupModel } from '../user/user.model';



const createCommonExercise = async (
  file: any,
  payload: Partial<TExercise>,
  user_id?: Types.ObjectId,
) => {

  console.log("blueeeee", payload)
  // Validate inputs
  if (
    !payload ||
    !payload.name ||
    !payload.description ||
    !payload.primaryMuscleGroup ||
    !payload.exerciseType
  ) {
    throw new Error('Exercise name and description are required.');
  }

  if (!file || !file.path) {
    throw new Error('Image file is required.');
  }

  // Check MongoDB connection state
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready.');
  }

  try {
    console.log('Starting exercise creation');

    // Upload image to Cloudinary
    const imageName = `${payload.name}-${Date.now()}`; // Unique name
    const uploadResult = await uploadImgToCloudinary(imageName, file.path);
    const imageUrl = uploadResult.secure_url;
    console.log('Image uploaded to Cloudinary:', imageUrl);

    // Create exercise payload
    const exercisePayload = {
      name: payload.name,
      user_id: user_id ? user_id : null,
      description: payload.description,
      img: imageUrl,
      primaryMuscleGroup: payload.primaryMuscleGroup,
      exerciseType: payload.exerciseType,
    };

    // Create the exercise
    const createdExercise = await ExerciseModel.create(exercisePayload);
    console.log('Exercise created:', createdExercise._id);

    return {
      success: true,
      message: 'Exercise created successfully.',
      data: {
        exercise: createdExercise,
      },
    };
  } catch (error: any) {
    console.error('Error creating exercise:', error);

    // Clean up local file if upload failed
    if (file && file.path) {
      try {
        await deleteFile(file.path);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
      }
    }

    throw new Error(
      error.message || 'Failed to create exercise due to an internal error.',
    );
  }
};

const createPersonalizeExercise = async (
  file: any,
  payLoad: Partial<TExercise>,
  User_id: Types.ObjectId,
) => {
  const result = await createCommonExercise(file, payLoad, User_id);
  return result;
};

const getExerciseBothCommonAndPersonalize = async (
  user_id: Types.ObjectId,
): Promise<TExercise[]> => {
  // Validate user_id
  if (!Types.ObjectId.isValid(user_id)) {
    throw new Error('Invalid user ID.');
  }

  // Check MongoDB connection state
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready.');
  }

  try {
    // Fetch exercises, sorting personalized (user_id matches) first, then common (user_id: null)
    const exercises = await ExerciseModel.find({
      $or: [{ user_id: user_id }, { user_id: null }],
    })
      .sort({ user_id: -1 }) // Sort user_id desc: non-null (personalized) first, null last
      .lean(); // Return plain objects for performance

    return exercises;
  } catch (error: any) {
    console.error('Error fetching exercises:', error);
    throw new Error('Failed to retrieve exercises.');
  }
};

const getExerciseById = async (exercise_id: Types.ObjectId) => {
    // Validate exercise_id
    if (!Types.ObjectId.isValid(exercise_id)) {
      throw new Error('Invalid exercise ID.');
    }
  
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection is not ready.');
    }
  
    try {
      // Find exercise
      const findExercise = await ExerciseModel.findOne({ _id: exercise_id }).lean();
      if (!findExercise) {
        throw new Error('Exercise not found.');
      }
  
      // Define common metadata
      const meta = {
        set: 'required',
        reps: 'required',
        resetTime: 'required',
      };
  
      // Determine modifyFoundData based on exerciseType
      let modifyFoundData = {};
      if (findExercise.exerciseType === EXERCISE_TYPES.weight_training) {
        modifyFoundData = { weightLifted: 'required', ...meta };
      } else if (
        findExercise.exerciseType === EXERCISE_TYPES.bodyweight_exercises ||
        findExercise.exerciseType === EXERCISE_TYPES.high_Intensity ||
        findExercise.exerciseType === EXERCISE_TYPES.strength_Training
      ) {
        modifyFoundData = { weightLifted: 'optional', ...meta };
      } else {
        modifyFoundData = { weightLifted: 'false', ...meta };
      }
  
      // Return merged data
      return { ...findExercise, ...modifyFoundData };
    } catch (error:any) {
      console.error('Error fetching exercise:', error);
      throw new Error(error.message || 'Failed to retrieve exercise.');
    }
};



//user exercise perform

const performExercise = async (user_id: Types.ObjectId, payLoad: Partial<{
  exercise_id: Types.ObjectId;
  set: number;
  weightLifted?: number;
  reps: number;
  resetTime: number;
  isCompleted: boolean;
  totalCaloryBurn?: number;
}>) => {
  // Find user
  const user = await WorkoutASetupModel.findOne({ user_id }).lean();
  if (!user) {
    throw new Error("User not found");
  }

  // Validate user_id
  if (!Types.ObjectId.isValid(user_id)) {
    throw new Error("Invalid user ID");
  }

  // Validate required payload fields
  if (!payLoad.exercise_id || payLoad.set == null || payLoad.reps == null || payLoad.resetTime == null) {
    throw new Error("exercise_id, set, reps, and resetTime are required");
  }

  // Validate exercise_id
  if (!Types.ObjectId.isValid(payLoad.exercise_id as Types.ObjectId)) {
    throw new Error("Invalid exercise ID");
  }

  // Check MongoDB connection
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB connection is not ready");
  }

  try {
    // Find exercise
    const findExercise = await ExerciseModel.findOne({ _id: payLoad.exercise_id }).lean();
    if (!findExercise) {
      throw new Error("Exercise not found");
    }

    // Validate weightLifted based on exerciseType
    let validatedWeightLifted: number = payLoad.weightLifted ?? 0;

    if (findExercise.exerciseType === "weight_training") {
      if (validatedWeightLifted <= 0) {
        throw new Error("weightLifted is required and must be a positive number for weight_training");
      }
    } else if (
      findExercise.exerciseType === "bodyweight_exercises" ||
      findExercise.exerciseType === "high_Intensity" ||
      findExercise.exerciseType === "strength_Training"
    ) {
      // weightLifted is optional; keep as is
    } else {
      // For cardio, stretching, balance_Training, set weightLifted to 0
      validatedWeightLifted = 0;
    }

    // Prepare data to save
    const exercisePerformData = {
      exercise_id: payLoad.exercise_id,
      user_id,
      set: payLoad.set,
      weightLifted: validatedWeightLifted,
      reps: payLoad.reps,
      resetTime: payLoad.resetTime,
      isCompleted: false,
    };

    // Save to UserExercisePerformModel
    const savedExercisePerform = await UserExercisePerformModel.create(exercisePerformData);

    return savedExercisePerform;
  } catch (error: any) {
    console.error("Error creating user exercise perform:", error);
    throw new Error(error.message || "Failed to create user exercise perform");
  }
};

const markExerciseAsCompleated = async (user_id: Types.ObjectId, Performed_exercise_id: Types.ObjectId) => {
  try {
    // Validate inputs
    if (!Types.ObjectId.isValid(user_id)) {
      throw new Error("Invalid user ID");
    }
    if (!Types.ObjectId.isValid(Performed_exercise_id)) {
      throw new Error("Invalid performed exercise ID");
    }

    // Find user
    const user = await WorkoutASetupModel.findOne({ user_id }).lean();
    if (!user) {
      throw new Error("User not found");
    }

    // Find performed exercise
    const performedExercise = await UserExercisePerformModel.findOne({
      _id: Performed_exercise_id,
      user_id
    }).lean();
    if (!performedExercise) {
      throw new Error("Performed exercise not found");
    }

    // Find exercise details
    const exercise = await ExerciseModel.findOne({ _id: performedExercise.exercise_id }).lean();
    if (!exercise) {
      throw new Error("Exercise not found");
    }

    // Prepare data for calorie calculation AI route
    const dataForCaloryCount = {
      userHight: user.height, // Assuming typo in original ("userHight" instead of "height")
      userWeight: user.weight,
      exerciseName: exercise.name,
      exerciseType: exercise.exerciseType,
      exerciseDescription: exercise.description,
      weightLifted: performedExercise.weightLifted,
      reps: performedExercise.reps,
      set: performedExercise.set,
      resetTime: performedExercise.resetTime
    };

    console.log("Data for calorie count:", dataForCaloryCount);

    // TODO: Call AI route to calculate totalCaloryBurn
    // Example: const totalCaloryBurn = await aiService.calculateCalories(dataForCaloryCount);
    const totalCaloryBurn = 0; // Placeholder until AI route is implemented

    // Update exercise as completed with calorie burn
    const markAsDone = await UserExercisePerformModel.findOneAndUpdate(
      { _id: Performed_exercise_id, user_id },
      { isCompleted: true, totalCaloryBurn },
      { new: true }
    );

    if (!markAsDone) {
      throw new Error("Failed to mark exercise as completed");
    }

    return markAsDone;
  } catch (error: any) {
    console.error(`Error marking exercise as completed for user ${user_id}:`, error);
    throw new Error(error.message || "Failed to mark exercise as completed");
  }
};


const exerciseServicves = {
  createCommonExercise,
  createPersonalizeExercise,
  getExerciseBothCommonAndPersonalize,
  getExerciseById,
  performExercise,
  markExerciseAsCompleated
};
export default exerciseServicves;
