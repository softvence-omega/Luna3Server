export type TUserRole = 'admin' | 'user';

export const userRole = {
  user: 'user',
  admin: 'admin',
} as const;

export const EXERCISE_TYPES = {
  cardio: 'cardio',
  strength_Training: 'strength_Training',
  stretching: 'stretching',
  balance_Training: 'balance_Training',
  high_Intensity: 'high_Intensity',
  weight_training: 'weight_training',
  bodyweight_exercises: 'bodyweight_exercises',
} as const;


export type TErrorSource = {
  path: string | number;
  message: string;
}[];
