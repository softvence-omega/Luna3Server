import mongoose, { Types } from 'mongoose';
import {
  deleteFile,
  uploadImgToCloudinary,
} from '../../util/uploadImgToCludinary';
import { Thabit } from './habits.interface';
import { habitModel, UserHabitsModel } from './habits.model';
import { ProfileModel } from '../user/user.model';

const createHabit = async (img: any, payload: Partial<Thabit>) => {
  // Validate inputs
  if (!payload || !payload.name || !payload.description) {
    throw new Error('Habit name and description are required.');
  }

  if (!img || !img.path) {
    throw new Error('Image file is required.');
  }

  // Check MongoDB connection state
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready.');
  }

  const session = await habitModel.startSession();

  try {
    await session.startTransaction();
    console.log('Transaction started for habit creation');

    // Upload image to Cloudinary
    const imageName = `${payload.name}-${Date.now()}`; // Unique name
    const uploadResult = await uploadImgToCloudinary(imageName, img.path);
    const imageUrl = uploadResult.secure_url;
    console.log('Image uploaded to Cloudinary:', imageUrl);

    // Create habit payload
    const habitPayload = {
      name: payload.name,
      description: payload.description,
      img: imageUrl,
    };

    // Create and save the habit
    const habit = new habitModel(habitPayload);
    const savedHabit = await habit.save({ session });
    console.log('Habit saved:', savedHabit._id);

    // Commit the transaction
    await session.commitTransaction();
    console.log('Transaction committed');

    return {
      success: true,
      message: 'Habit created successfully.',
      data: {
        habit: savedHabit,
      },
    };
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error creating habit:', error);

    // Clean up local file if upload failed
    if (img && img.path) {
      try {
        await deleteFile(img.path);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
      }
    }

    throw new Error(
      error.message || 'Failed to create habit due to an internal error.',
    );
  } finally {
    session.endSession();
    console.log('Session ended');
  }
};

const getHabit = async () => {
  const result = await habitModel.find();
  return result;
};

const addHabitToUser = async (user_id:Types.ObjectId, payLoad:any) => {
    // Validate inputs
    if (!user_id) {
      throw new Error('Adding habit to life failed: No user ID provided.');
    }
  
    if (!payLoad || !payLoad.habit_id) {
      throw new Error('Adding habit to life failed: Habit ID is required.');
    }
  
    const session = await mongoose.startSession();
  
    try {
      await session.startTransaction();
      console.log('Transaction started for adding habit');
  
      // Check for existing habit
      const findUserWithSameHabit = await UserHabitsModel.findOne({
        user_id: user_id,
        habit_id: payLoad.habit_id,
      }).session(session);
      if (findUserWithSameHabit) {
        throw new Error('You already have this habit.');
      }
      console.log('No duplicate habit found for user:', user_id);
  
      // Find and update profile
      const updatedProfile = await ProfileModel.findOneAndUpdate(
        { user_id: user_id },
        { $push: { habits: payLoad.habit_id } },
        { new: true, session }
      );
      if (!updatedProfile) {
        throw new Error('Profile not found for the provided user ID.');
      }
      console.log('Profile updated with habit:', updatedProfile._id);
  
      // Create user habit
      const newHabit = await UserHabitsModel.create(
        [{ user_id: user_id, ...payLoad }],
        { session }
      );
      console.log('Habit created:', newHabit[0]._id);
  
      // Commit the transaction
      console.log('Committing transaction');
      await session.commitTransaction();
      console.log('Transaction committed');
  
      return {
        success: true,
        message: 'Habit added successfully.',
        data: {
          habit: newHabit[0],
          profile: updatedProfile,
        },
      };
    } catch (error:any) {
      await session.abortTransaction();
      console.error('Error in addHabitToUser:', {
        message: error.message,
        stack: error.stack,
        error,
      });
      throw new Error(error.message || 'Failed to add habit due to an internal error.');
    } finally {
      session.endSession();
      console.log('Session ended');
    }
};


const updateUserHabit = async (user_id:Types.ObjectId, habit_id:Types.ObjectId, payLoad:any) => {
    // Validate inputs
    if (!user_id) {
      throw new Error('Updating habit failed: No user ID provided.');
    }
  
    if (!habit_id) {
      throw new Error('Updating habit failed: No habit ID provided.');
    }
  
    if (!payLoad || Object.keys(payLoad).length === 0) {
      throw new Error('Updating habit failed: At least one field must be provided.');
    }
  
    const session = await mongoose.startSession();
  
    try {
      await session.startTransaction();
      console.log('Transaction started for updating habit');
  
      // Check if habit exists
      const existingHabit = await UserHabitsModel.findOne({
        user_id: user_id,
        habit_id: habit_id,
      }).session(session);
      if (!existingHabit) {
        throw new Error('No habit found for the provided user ID and habit ID.');
      }
      console.log('Existing habit found:', existingHabit._id);


      // console.log("payload", payLoad)
  
      // Update habit with all provided payload fields
      const updatedHabit = await UserHabitsModel.findOneAndUpdate(
        { user_id: user_id, habit_id: habit_id },
        { $set: payLoad },
        { new: true, session }
      );
      if (!updatedHabit) {
        throw new Error('Failed to update habit.');
      }
      console.log('Habit updated:', updatedHabit._id);
  
      // Commit the transaction
      console.log('Committing transaction');
      await session.commitTransaction();
      console.log('Transaction committed');
  
      return {
        success: true,
        message: 'Habit updated successfully.',
        data: {
          habit: updatedHabit,
        },
      };
    } catch (error:any) {
      await session.abortTransaction();
      console.error('Error in updateUserHabit:', {
        message: error.message,
        stack: error.stack,
        error,
      });
      throw new Error(error.message || 'Failed to update habit due to an internal error.');
    } finally {
      session.endSession();
      console.log('Session ended');
    }
  };

const getUserHabits = async (user_id:Types.ObjectId)=>{
const result = await UserHabitsModel.find({user_id:user_id})
return result 
}

const habitServices = {
  createHabit,
  getHabit,
  addHabitToUser,
  updateUserHabit,
  getUserHabits
};

export default habitServices;
