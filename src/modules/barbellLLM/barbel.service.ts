import { Types } from 'mongoose';
import { WorkoutASetupModel } from '../user/user.model';
import { error } from 'console';
import config from '../../config';
import { TExercisePlan } from './barbel.interface';
import { ExercisePlanModel } from './barbel.model';

interface CreateExerciseRoutinePayload {
    goal: string;
    days_per_week: number;
    available_equipment: string;
    fitness_level:string
    
}

const createExerciseRoutine = async (
    user_id: Types.ObjectId,
    payload: CreateExerciseRoutinePayload
  ): Promise<TExercisePlan> => {
    // Validate inputs
    if (!user_id || !Types.ObjectId.isValid(user_id)) {
      throw new Error('Invalid user ID');
    }
    if (!payload || !payload.goal || !payload.days_per_week || !payload.available_equipment) {
      throw new Error('Goal, days_per_week, and available_equipment are required');
    }
  
    // Fetch user’s workout setup
    const getWorkOutPlan = await WorkoutASetupModel.findOne({ user_id });
    if (!getWorkOutPlan) {
      throw new Error('Workout setup not found for user');
    }
  
    // Construct payload for AI API
    const constructDataForWorkoutRoutine = {
      age: getWorkOutPlan.age,
      gender: getWorkOutPlan.gender,
      weight_kg: getWorkOutPlan.weight,
      height_cm: getWorkOutPlan.height,
      fitness_level: payload.fitness_level, // Fixed: Use fitness_level, not height
      main_goal: payload.goal,
      days_per_week: payload.days_per_week,
      available_equipment: payload.available_equipment,
      notes: 'I have a previous shoulder injury, so no overhead presses.',
    };
  
    const aiWorkoutPlanEndPoint = 'create-workout-plan';
    const fullAiApi = `${config.AI_BASE_URL}${aiWorkoutPlanEndPoint}`;
  
    try {
      // Log payload for debugging
      console.log('AI API payload:', constructDataForWorkoutRoutine);
  
      // Make POST request to AI API
      const response = await fetch(fullAiApi, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(constructDataForWorkoutRoutine),
      });
  
      console.log('AI response status:', response.status, response.statusText);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI API error response:', errorData);
        throw new Error(`AI API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      }
  
      // Return raw AI response
      const data = await response.json();
      console.log('AI response:', data);
      return data;
    } catch (error: any) {
      console.error('Error creating exercise routine:', error.message);
      throw new Error(error.message || 'Failed to create exercise routine');
    }
};


const saveWorkOutPlan = async (user_id: Types.ObjectId, payLoad: any) => {
    if (!Types.ObjectId.isValid(user_id)) throw new Error('Invalid user ID');
    if (!payLoad.data.workout_plan) throw new Error('Invalid workout plan payload');
  
    console.log('Payload:', payLoad);
  
    const routine = {
      user_id,
      workout_plan: payLoad.data.workout_plan,
    };
  
    const existingPlan = await ExercisePlanModel.findOne({ user_id });
  
    if (existingPlan) {
      const updatedPlan = await ExercisePlanModel.findOneAndReplace(
        { user_id },
        routine,
        { new: true }
      );
      console.log('Replaced workout plan for user:', user_id);
      return updatedPlan;
    }
  
    const newPlan = await ExercisePlanModel.create(routine);
    console.log('Saved new workout plan for user:', user_id);
    return newPlan;
};

const getWorkoutRoutine = async(user_id:Types.ObjectId)=>{
    const result = await ExercisePlanModel.findOne({user_id:user_id})
    return result
}

const updateExerciseRoutine = async(user_id:Types.ObjectId, feedBack:String)=>{
const findExistingWorkoutPlan = await ExercisePlanModel.findOne({user_id:user_id})
if(!findExistingWorkoutPlan)
{
  throw Error("findExistingWorkoutPlan is not found")
}
const updateExerciseRoutinePayload={
  original_plan:findExistingWorkoutPlan.workout_plan.plan,
  feedback:feedBack
} 




}

const barbelLLMServices = { createExerciseRoutine,saveWorkOutPlan,getWorkoutRoutine,updateExerciseRoutine };

export default barbelLLMServices;
