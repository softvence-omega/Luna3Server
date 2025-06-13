import mongoose, { Types } from 'mongoose';
import { TExercise } from './exercise.interface';
import {
  deleteFile,
  uploadImgToCloudinary,
} from '../../util/uploadImgToCludinary';
import { ExerciseModel } from './exercise.model';
import { EXERCISE_TYPES } from '../../constents';

const createCommonExercise = async (
  file: any,
  payload: Partial<TExercise>,
  user_id?: Types.ObjectId,
) => {
  // Validate inputs
  if (
    !payload ||
    !payload.name ||
    !payload.description ||
    payload.primaryMuscleGroup ||
    payload.exerciseType
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
        restTime: 'required',
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




const exerciseServicves = {
  createCommonExercise,
  createPersonalizeExercise,
  getExerciseBothCommonAndPersonalize,
  getExerciseById
};
export default exerciseServicves;
