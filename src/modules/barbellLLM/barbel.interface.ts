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