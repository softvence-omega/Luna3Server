import { Types } from "mongoose";

export type TExercise = {
    name: string;
    sets: string;
    reps: string;
    rest_period_minutes: string;
  };
  
  export type TDailyPlan = {
    day: string;
    focus: string;
    exercises: TExercise[];
  };
  
  export type TWorkoutPlan = {
    plan: TDailyPlan[];
  };
  
  export type TExercisePlan = {
    user_id:Types.ObjectId;
    workout_plan: TWorkoutPlan;
  };


  export type TEachChat=
    {
      response_id?: string,
      user_id: string,
      user_feedback: "string",
      ai_response:string,
      timestamp:string
      status:string,
      session_id:string

    }
  

  export type TUserChatList = {
    user_id:Types.ObjectId,
    chatList:[TEachChat]
  }