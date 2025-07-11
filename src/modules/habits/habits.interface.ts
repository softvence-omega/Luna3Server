import { Types } from "mongoose";

export type Thabit ={
    img:string;
    name:string;
    description:string;
}

export type TUserHabits= {
    user_id:Types.ObjectId,
    habit_id:Types.ObjectId,
    isPushNotification:boolean,
    reminderTime:Date,
    nextReminderTime:Date,
    reminderInterval:Number,
    reminderDays:[String]
  }

