import mongoose, { Schema, Types } from 'mongoose';
import { TUserHabits } from './habits.interface';

const HabitSchema = new Schema({
  img: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const UserHabitsSchema = new Schema<TUserHabits>({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'habitCollection',
  },
  habit_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'habitCollection',
  },
  isPushNotification: {
    type: Boolean,
    required: true,
    default: false,
  },
  reminderTime: {
    type: Date,
    required: true,
  },
  nextReminderTime: {
    type: Date,
    required: true,
  },
  reminderInterval: {
    type: Number,
    required: true,
  },
  reminderDays: {
    type: [String],
    required: true,
  },
});

export const habitModel = mongoose.model('habitCollection', HabitSchema);
export const UserHabitsModel = mongoose.model(
  'UserHabitCollection',
  UserHabitsSchema,
);
