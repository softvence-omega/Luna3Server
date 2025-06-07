import { model, Schema } from "mongoose";
import { TExercise, TUserExercise } from "./exercise.interface";


const ExerciseSchema = new Schema<TExercise>({
    img: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      required: false,
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
      enum: ['cardio', 'strength_Training', 'stretching', 'balance_Training', 'high_Intensity', 'weight_lifting', 'bodyweight_exercises'],
      required: true,
    },
  });
  
  const UserExerciseSchema = new Schema<TUserExercise>({
    exercise_id: {
      type: Schema.Types.ObjectId,
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
      required: true,
    },
    reps: {
      type: Number,
      required: true,
    },
    restTime: {
      type: Number,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  });
  
  // Models
  export const ExerciseModel = model<TExercise>('Exercise', ExerciseSchema);
  export const UserExerciseModel = model<TUserExercise>('UserExercise', UserExerciseSchema);