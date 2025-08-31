import { model, Schema } from "mongoose";
import { TExercise, UserExercisePerform,  } from "./exercise.interface";


const ExerciseSchema = new Schema<TExercise>({
    img: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      required: false,
      default:null
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    primaryMuscleGroup: {
      type: String,
      required: true,
    },
    exerciseType: {
      type: String,
      enum: ['cardio', 'strength_Training', 'stretching', 'balance_Training', 'high_Intensity', 'weight_training', 'bodyweight_exercises'],
      required: true,
    },
  });


  const UserExercisePerformSchema = new Schema<UserExercisePerform>({
    exercise_id: {
      type: Schema.Types.ObjectId,
      ref:"Exercise",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref:"userCollection"
    },
    set: {
      type: Number,
      required: true,
    },
    weightLifted: {
      type: Number,
      required: false,
      default:0
    },
    reps: {
      type: Number,
      required: true,
    },
    resetTime: {
      type: Number,
      required: true,
    },
    timeToPerform: {
      type: Number,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    totalCaloryBurn: {
      type: Number,
      required: false,
      default: 0,
    },
  },
{timestamps:true});
  
  // Models
  export const ExerciseModel = model<TExercise>('Exercise', ExerciseSchema);
  export const UserExercisePerformModel = model<UserExercisePerform>('UserExercisePerformModel', UserExercisePerformSchema);