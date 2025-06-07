import mongoose, { Schema } from 'mongoose';

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

export const UserModel = mongoose.model('habitCollection', HabitSchema);