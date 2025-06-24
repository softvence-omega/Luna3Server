import { Types } from 'mongoose';
import { WorkoutASetupModel } from '../user/user.model';
import { error } from 'console';
import config from '../../config';
import { TExercisePlan } from './barbel.interface';
import { ExercisePlanModel, UserChatListModel } from './barbel.model';
import { chownSync } from 'fs';

interface CreateExerciseRoutinePayload {
  goal: string;
  days_per_week: number;
  available_equipment: string;
  fitness_level: string;
}

const createExerciseRoutine = async (
  user_id: Types.ObjectId,
  payload: CreateExerciseRoutinePayload,
): Promise<TExercisePlan> => {
  // Validate inputs
  if (!user_id || !Types.ObjectId.isValid(user_id)) {
    throw new Error('Invalid user ID');
  }
  if (
    !payload ||
    !payload.goal ||
    !payload.days_per_week ||
    !payload.available_equipment
  ) {
    throw new Error(
      'Goal, days_per_week, and available_equipment are required',
    );
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
    console.log('AI API payload:======>>>>>', constructDataForWorkoutRoutine);

    console.log("hitting api for work out plan", fullAiApi);

    // Make POST request to AI API
    const response = await fetch(fullAiApi, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(constructDataForWorkoutRoutine),
    });

    console.log('AI response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI API error response:', errorData);
      throw new Error(
        `AI API request failed with status ${response.status}: ${JSON.stringify(errorData)}`,
      );
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
  if (!payLoad.data.workout_plan)
    throw new Error('Invalid workout plan payload');

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
      { new: true },
    );
    console.log('Replaced workout plan for user:', user_id);
    return updatedPlan;
  }

  const newPlan = await ExercisePlanModel.create(routine);
  console.log('Saved new workout plan for user:', user_id);
  return newPlan;
};

const getWorkoutRoutine = async (user_id: Types.ObjectId) => {
  const result = await ExercisePlanModel.findOne({ user_id: user_id });
  return result;
};


const updateExerciseRoutine = async (
  user_id: Types.ObjectId,
  feedBack: string,
) => {
  const aiWorkoutPlanEndPoint = 'update-workout-plan';
  const fullAiApi = `${config.AI_BASE_URL}${aiWorkoutPlanEndPoint}`;
  // Find existing workout plan
  const findExistingWorkoutPlan = await ExercisePlanModel.findOne({ user_id });
  if (!findExistingWorkoutPlan) {
    throw Error('findExistingWorkoutPlan is not found');
  }

  // Construct payload for AI API
  console.log("========>>>>>",findExistingWorkoutPlan.workout_plan.plan)
  const updateExerciseRoutinePayload = {
    original_plan:{ 
      "plan":findExistingWorkoutPlan.workout_plan.plan
    },
    feedback: `${feedBack}`,
  };
  console.log('here i am =========>>>>>>>>>>>>', updateExerciseRoutinePayload);

  try {
    // Log payload for debugging
    console.log('AI API payload:', updateExerciseRoutinePayload);
    console.log("hitting api for update exercise routine", fullAiApi);
    // Make POST request to AI API
    const response = await fetch(fullAiApi, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateExerciseRoutinePayload),
    });

    console.log('AI response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI API error response:', errorData);
      throw new Error(
        `AI API request failed with status ${response.status}: ${JSON.stringify(errorData)}`,
      );
    }

    // Parse AI response
    const data = await response.json();
    console.log('AI response:========<<<<<<<', data);

    // Validate response structure
    if (!data.workout_plan || !Array.isArray(data.workout_plan.plan)) {
      throw new Error(
        'Invalid AI response format: workout_plan.plan is missing or not an array',
      );
    }

    // Update the existing workout plan in the database
    findExistingWorkoutPlan.workout_plan = data.workout_plan;
    await findExistingWorkoutPlan.save();

    return data.workout_plan;
  } catch (error:any) {
    console.error('Error updating exercise routine:', error.message);
    throw new Error(error.message || 'Failed to update exercise routine');
  }
};


//chat action 
const startChatOrGetPreviousChat = async (user_id:Types.ObjectId)=>{
  const findChatList = await UserChatListModel.findOne({user_id:user_id})
  if(!findChatList)
  {
    const userChatList = await UserChatListModel.create({user_id:user_id})
    return userChatList
  }
  else
  {
    return findChatList
  }
  
}
const endChat = async (user_id:Types.ObjectId)=>{
  const findChatList = await UserChatListModel.findOne({user_id:user_id})
  if(findChatList)
  {
    const userChatList = await UserChatListModel.deleteOne({user_id:user_id})
    return userChatList
  }
  else
  {
    throw Error ("nko chat list is found to delete")
  }
  
}

const sendMessageAndGetReply = async (user_id: Types.ObjectId, message: string) => {
  const session_id = user_id.toString();
  if (!user_id || !message || !session_id) {
    throw new Error("user_id, message, or session_id not provided");
  }

  const aiWorkoutPlanEndPoint = 'generate-response';
  const fullAiApi = `${config.AI_BASE_URL}${aiWorkoutPlanEndPoint}`;

  try {
    console.log("hitting api for chat", fullAiApi);
    const response = await fetch(fullAiApi, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id.toString(),
        user_feedback: message,
        session_id,
      }),
    });

    if (!response.ok) {
      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error(`Validation Error: ${JSON.stringify(errorData.detail)}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Save the response to the database
    await UserChatListModel.findOneAndUpdate(
      { user_id: user_id },
      {
        $push: {
          chatList: {
            response_id: data.response_id,
            user_id: data.user_id,
            user_feedback: data.user_feedback,
            ai_response: data.ai_response,
            timestamp: data.timestamp,
            status: data.status,
            session_id: data.session_id,
          },
        },
      },
      { new: true, upsert: true } // Return updated document and create if not exists
    );

    return {
      response_id: data.response_id,
      user_id: data.user_id,
      user_feedback: data.user_feedback,
      ai_response: data.ai_response,
      timestamp: data.timestamp,
      status: data.status,
      session_id: data.session_id,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch AI response: ${error.message}`);
  }
};

const barbelLLMServices = {
  createExerciseRoutine,
  saveWorkOutPlan,
  getWorkoutRoutine,
  updateExerciseRoutine,
  startChatOrGetPreviousChat,
  endChat,
  sendMessageAndGetReply
};

export default barbelLLMServices;
