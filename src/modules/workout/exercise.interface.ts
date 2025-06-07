import { Types } from "mongoose";

export type TExercise = {
    img: string;
    user_id?:Types.ObjectId;
    name: string;
    description:string;
    primaryMuscleGroup: string;
    exerciseType: 'cardio' | 'strength_Training' | 'stretching' | 'balance_Training' | 'high_Intensity' | 'weight_lifting' | 'bodyweight_exercises';
  };

  export type TUserExercise={
    exercise_id:Types.ObjectId;
    user_id:Types.ObjectId;
    set:number;
    weightLifted:number;
    reps:number;
    restTime:number;
    isCompleted:boolean

  }
