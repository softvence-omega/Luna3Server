import { model, Schema } from "mongoose";
import { TDailyPlan, TExercise, TExercisePlan, TWorkoutPlan } from "./barbel.interface";


// Mongoose schemas
const exerciseSchema = new Schema<TExercise>(
    {
      name: { type: String, required: true },
      sets: { type: String, required: true },
      reps: { type: String, required: true },
      rest_period_minutes: { type: String, required: true },
    },
    { _id: false } // No _id for subdocuments
  );
  
  const dailyPlanSchema = new Schema<TDailyPlan>(
    {
      day: { type: String, required: true },
      focus: { type: String, required: true },
      exercises: { type: [exerciseSchema], required: true },
    },
    { _id: false }
  );
  
  const workoutPlanSchema = new Schema<TWorkoutPlan>(
    {
      plan: { type: [dailyPlanSchema], required: true },
    },
    { _id: false }
  );
  
  const exercisePlanSchema = new Schema<TExercisePlan>(
    {
      user_id: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional, for personalized plans
      workout_plan: { type: workoutPlanSchema, required: true },
    },
    { timestamps: true } // Adds createdAt, updatedAt
  );
  
  // Mongoose model
 export  const ExercisePlanModel = model<TExercisePlan>('ExercisePlan', exercisePlanSchema);