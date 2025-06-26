import { Types } from 'mongoose';
import cron from 'node-cron';
import { UserHabitsModel } from '../modules/habits/habits.model'; // Adjust path as needed
import { sendSingleNotification } from '../firebaseSetup/sendPushNotification';

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

const habitReminder = async () => {
  try {
    const now = new Date();
    console.log(
      `Running habit reminder cron job at: ${now.toISOString()} (UTC), ${now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} (BST)`,
    );

    // Get current day in UTC to match reminderTime
    const currentDay = now.toLocaleString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    }); // e.g., "Monday"

    // Query habits with push notifications enabled and matching day
    const habits = await UserHabitsModel.find({
      isPushNotification: true,
    });
    console.log('habbits', habits);
    if (!habits.length) {
      console.log(
        `No habits found with isPushNotification: true for ${currentDay} at ${now.toISOString()} (UTC)`,
      );
      return;
    }

    console.log(`Found ${habits.length} habits to process`);

    // Process each habit
    for (const habit of habits) {
      const { _id, reminderTime, reminderInterval, user_id, habit_id } = habit;

      try {
        const reminderDate = new Date(reminderTime);
        // Check if current date is same as or later than reminderTime date
        if (isSameOrLaterDay(now, reminderDate)) {
          // Check if current time matches reminderTime
          if (isSameMinute(now, reminderDate)) {
            console.log(
              `Processing reminder for habit ${habit_id} (ID: ${_id}) for user ${user_id}, reminderTime: ${reminderTime.toISOString()} (BST: ${reminderDate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })})`,
            );

            // Send notification email (commented out as in original code)
            console.log(
              `Sending push notification email for habit ${habit_id}`,
            );
            try {
              const subject = `⏰ Reminder for your habit!`;
              const body = `This is a friendly reminder for your habit "${habit_id}" scheduled at ${new Date(reminderTime).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}. Stay consistent and keep going! 💪`;

              const result = await sendSingleNotification(
                new Types.ObjectId(user_id),
                subject,
                body,
              );
              console.log(
                `📩 Email status for habit ${habit_id}:`,
                result.message,
              );
              // await sendNotificationEmail({
              //   user_id: new Types.ObjectId(user_id),
              //   habit_id: new Types.ObjectId(habit_id),
              //   reminderTime: reminderTime.toISOString(),
              // });
              console.log(
                `Notification email sent successfully for habit=====>>>>>>>>> ${habit_id}`,
              );
            } catch (emailError: any) {
              console.error(
                `Failed to send notification email for habit ${habit_id}:`,
                emailError.message,
              );
              // Continue to update time even if email fails
            }

            // Convert reminderInterval to primitive number
            const intervalMinutes = Number(reminderInterval);

            // Update reminderTime by adding reminderInterval (in minutes)
            const newReminderTime = addMinutes(
              new Date(reminderTime),
              intervalMinutes,
            );
            console.log(
              `Updating reminderTime for habit ${habit_id} to: ${newReminderTime.toISOString()} (BST: ${newReminderTime.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })})`,
            );

            await UserHabitsModel.updateOne(
              { _id: _id },
              { $set: { reminderTime: newReminderTime } },
            );
            console.log(
              `Reminder time updated successfully for habit ${habit_id}`,
            );
          } else {
            console.log(
              `Skipping habit ${habit_id}: Time mismatch (now: ${now.toISOString()}, reminder: ${reminderTime.toISOString()})`,
            );
          }
        } else {
          console.log(
            `Skipping habit ${habit_id}: Current date is before reminder date (now: ${now.toISOString()}, reminder: ${reminderTime.toISOString()})`,
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
  timezone: 'UTC', // Match reminderTime timezone
});

export default habitReminder;
