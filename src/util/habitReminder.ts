import { Types } from 'mongoose';
import admin from '../firebaseSetup/firebase';
import cron from 'node-cron';
import { UserHabitsModel } from '../modules/habits/habits.model'; // Adjust path as needed
import { sendSingleNotification } from '../firebaseSetup/sendPushNotification';
import axios from 'axios';

// Utility function to check if date1 is same as or later than date2
const isSameOrLaterDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() > date2.getFullYear() ||
    (date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() > date2.getMonth()) ||
    (date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() >= date2.getDate())
  );
};

// Utility function to check if two dates are in the same minute
const isSameMinute = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate() &&
    date1.getHours() === date2.getHours() &&
    date1.getMinutes() === date2.getMinutes()
  );
};

// Utility function to add minutes to a date
const addMinutes = (date: Date, minutes: number): Date => {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return newDate;
};

// Utility function to calculate the next reminder time based on reminderDays
const calculateNextReminderTime = (currentReminderTime: Date, reminderDays: any, reminderInterval: number, reminderTime: Date): Date => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date(); // Dynamic current date and time
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Get the time components from reminderTime
  const hours = reminderTime.getHours();
  const minutes = reminderTime.getMinutes();
  const seconds = reminderTime.getSeconds();

  // Try adding reminderInterval to currentReminderTime
  const nextReminderTime = addMinutes(currentReminderTime, reminderInterval);

  // Check if the new time is still on the same day and in the future
  if (nextReminderTime.getDate() === today.getDate() && nextReminderTime > today) {
    return nextReminderTime;
  }

  // If the new time exceeds today, find the next closest day in reminderDays
  let minDaysAhead = 8; // Slightly more than a week to ensure next occurrence
  let nextReminderDayIndex = -1;

  for (const day of reminderDays) {
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex < 0) continue; // Skip invalid days
    const daysAhead = (dayIndex - currentDay + 7) % 7 || 7; // Get next occurrence
    if (daysAhead < minDaysAhead) {
      minDaysAhead = daysAhead;
      nextReminderDayIndex = dayIndex;
    }
  }

  // If no valid day is found, throw an error
  if (nextReminderDayIndex === -1) {
    throw new Error('No valid reminder days found.');
  }

  // Calculate the next reminder date using the original reminderTime's time
  const nextReminder = new Date(today);
  nextReminder.setDate(today.getDate() + minDaysAhead);
  nextReminder.setHours(hours, minutes, seconds, 0);

  return nextReminder;
};

const habitReminder = async () => {
  try {
    const now = new Date();
    console.log(
      `Running habit reminder cron job at: ${now.toISOString()} (UTC), ${now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} (BST)`,
    );

    const serverTime = new Date();
    console.log('Server time (UTC):', serverTime.toISOString());

    const getGoogleServerTime = async () => {
      try {
        const response = await axios.head('https://www.google.com');
        const dateHeader = response.headers.date;

        if (dateHeader) {
          const googleTime = new Date(dateHeader);
          console.log('Google Server Time (UTC):', googleTime.toISOString());
        } else {
          console.log('Date header not found in Google response.');
        }
      } catch (error: any) {
        console.error('Failed to fetch Google server time:', error.message);
      }
    };

    await getGoogleServerTime();

    // Query habits with push notifications enabled
    const habits = await UserHabitsModel.find({
      isPushNotification: true,
    }).populate('habit_id');

    console.log('habbits', habits);
    if (!habits.length) {
      console.log(
        `No habits found with isPushNotification: true at ${now.toISOString()} (UTC)`,
      );
      return;
    }

    console.log(`Found ${habits.length} habits to process`);

    // Process each habit
    for (const habit of habits) {
      const { _id, reminderTime, nextReminderTime, reminderInterval, reminderDays, user_id, habit_id } = habit;

      try {
        const nextReminderDate = new Date(nextReminderTime);
        // Check if current date is same as or later than nextReminderTime date
        if (isSameOrLaterDay(now, nextReminderDate)) {
          // Check if current time matches nextReminderTime
          if (isSameMinute(now, nextReminderDate)) {
            const habitName =
              typeof habit_id === 'object' && 'name' in habit_id
                ? (habit_id as any).name
                : 'your habit';

            console.log(
              `Processing reminder for habit ${habitName} (ID: ${_id}) for user ${user_id}, nextReminderTime: ${nextReminderDate.toISOString()} (BST: ${nextReminderDate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })})`,
            );

            // Send notification
            try {
              const subject = `⏰ Stay on Track — Your Next Step Awaits!`;
              const body = `Let's build strong habit of "${habitName}" scheduled at ${new Date(nextReminderTime).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}. Stay consistent and keep going! 💪`;

              const result = await sendSingleNotification(
                user_id,
                subject,
                body,
              );

              console.log('Send Push Notification USERRR ::::: ', result);
              console.log(
                `📩 Notification status for habit ${habit_id}:`,
                result.message,
              );
            } catch (emailError: any) {
              console.error(
                `Failed to send notification for habit ${habit_id}:`,
                emailError.message,
              );
              // Continue to update time even if notification fails
            }

            // Update nextReminderTime
            const intervalMinutes = Number(reminderInterval);
            const newNextReminderTime = calculateNextReminderTime(
              nextReminderDate,
              reminderDays,
              intervalMinutes,
              new Date(reminderTime)
            );

            console.log(
              `Updating nextReminderTime for habit ${habit_id} to: ${newNextReminderTime.toISOString()} (BST: ${newNextReminderTime.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })})`,
            );

            await UserHabitsModel.updateOne(
              { _id },
              { $set: { nextReminderTime: newNextReminderTime } },
            );
            console.log(
              `Next reminder time updated successfully for habit ${habit_id}`,
            );
          } else {
            console.log(
              `Skipping habit ${habit_id}: Time mismatch (now: ${now.toISOString()}, nextReminder: ${nextReminderDate.toISOString()})`,
            );
          }
        } else {
          console.log(
            `Skipping habit ${habit_id}: Current date is before next reminder date (now: ${now.toISOString()}, nextReminder: ${nextReminderDate.toISOString()})`,
          );
        }
      } catch (habitError: any) {
        console.error(
          `Error processing habit ${habit_id} (ID: ${_id}):`,
          habitError.message,
        );
        // Continue processing other habits
      }
    }
  } catch (error: any) {
    console.error('Error in habit reminder cron job:', error.message);
    throw new Error(`Habit reminder failed: ${error.message}`);
  }
};

// Schedule the cron job to run every minute
console.log('Starting habit reminder cron job');
cron.schedule('* * * * *', habitReminder, {
  timezone: 'UTC', // Match nextReminderTime timezone
});

export default habitReminder;