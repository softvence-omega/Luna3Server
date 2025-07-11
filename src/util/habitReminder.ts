// import { Types } from 'mongoose';
// import admin from '../firebaseSetup/firebase';
// import cron from 'node-cron';
// import { UserHabitsModel } from '../modules/habits/habits.model'; // Adjust path as needed
// import { sendSingleNotification } from '../firebaseSetup/sendPushNotification';
// import axios from 'axios';

// // Utility function to check if date1 is same as or later than date2
// const isSameOrLaterDay = (date1: Date, date2: Date): boolean => {
//   return (
//     date1.getFullYear() > date2.getFullYear() ||
//     (date1.getFullYear() === date2.getFullYear() &&
//       date1.getMonth() > date2.getMonth()) ||
//     (date1.getFullYear() === date2.getFullYear() &&
//       date1.getMonth() === date2.getMonth() &&
//       date1.getDate() >= date2.getDate())
//   );
// };

// // Utility function to check if two dates are in the same minute
// const isSameMinute = (date1: Date, date2: Date): boolean => {
//   return (
//     date1.getFullYear() === date2.getFullYear() &&
//     date1.getMonth() === date2.getMonth() &&
//     date1.getDate() === date2.getDate() &&
//     date1.getHours() === date2.getHours() &&
//     date1.getMinutes() === date2.getMinutes()
//   );
// };

// // Utility function to add minutes to a date
// const addMinutes = (date: Date, minutes: number): Date => {
//   const newDate = new Date(date);
//   newDate.setMinutes(newDate.getMinutes() + minutes);
//   return newDate;
// };

// const habitReminder = async () => {
//   try {
//     const now = new Date();
//     console.log(
//       `Running habit reminder cron job at: ${now.toISOString()} (UTC), ${now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} (BST)`,
//     );

//     const serverTime = new Date();
//     console.log('Server time (UTC):', serverTime.toISOString());

//     const getGoogleServerTime = async () => {
//       try {
//         const response = await axios.head('https://www.google.com');
//         const dateHeader = response.headers.date;

//         if (dateHeader) {
//           const googleTime = new Date(dateHeader);
//           console.log('Google Server Time (UTC):', googleTime.toISOString());
//         } else {
//           console.log('Date header not found in Google response.');
//         }
//       } catch (error: any) {
//         console.error('Failed to fetch Google server time:', error.message);
//       }
//     };

//     getGoogleServerTime();

//     // Get current day in UTC to match reminderTime
//     const currentDay = now.toLocaleString('en-US', {
//       weekday: 'long',
//       timeZone: 'UTC',
//     }); // e.g., "Monday"

//     // Query habits with push notifications enabled and matching day
//     const habits = await UserHabitsModel.find({
//       isPushNotification: true,
//     }).populate('habit_id');

//     console.log('habbits', habits);
//     if (!habits.length) {
//       console.log(
//         `No habits found with isPushNotification: true for ${currentDay} at ${now.toISOString()} (UTC)`,
//       );
//       return;
//     }

//     console.log(`Found ${habits.length} habits to process`);

//     // Process each habit
//     for (const habit of habits) {
//       const { _id, reminderTime, reminderInterval, user_id, habit_id } = habit;

//       try {
//         const reminderDate = new Date(reminderTime);
//         // Check if current date is same as or later than reminderTime date
//         if (isSameOrLaterDay(now, reminderDate)) {
//           // Check if current time matches reminderTime
//           if (isSameMinute(now, reminderDate)) {
//             const habitName =
//               typeof habit_id === 'object' && 'name' in habit_id
//                 ? (habit_id as any).name
//                 : 'your habit';

//             console.log(
//               `Processing reminder for habit ${habitName} (ID: ${_id}) for user ${user_id}, reminderTime: ${reminderTime.toISOString()} (BST: ${reminderDate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })})`,
//             );

//             // Send notification email (commented out as in original code)
//             console.log(
//               `Sending push notification for habit ${habit_id}`,
//             );
//             try {
//               const subject = `⏰ Stay on Track — Your Next Step Awaits!`;
//               const body = `Let's build strong habit of "${habitName}" scheduled at ${new Date(reminderTime).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}. Stay consistent and keep going! 💪`;

//               const result = await sendSingleNotification(
//                 user_id,
//                 subject,
//                 body,
//               );

//               console.log('Send Push Notification USERRR ::::: ', result);
//               console.log(
//                 `📩 Email status for habit ${habit_id}:`,
//                 result.message,
//               );

//               // await sendSingleNotification(
//               //   new Types.ObjectId(user_id),
//               //   '🌟 Don’t Forget Your Habit!',
//               //   `Reminder: Your habit scheduled is now. Let’s keep the streak alive!`,
//               // );

//               console.log(
//                 `Notification  sent successfully for habit=====>>>>>>>>> ${habit_id}`,
//               );
//             } 
//             catch (emailError: any) {
//               console.error(
//                 `Failed to send notification email for habit ${habit_id}:`,
//                 emailError.message,
//               );
//               // Continue to update time even if email fails
//             }

//             // Convert reminderInterval to primitive number
//             const intervalMinutes = Number(reminderInterval);

//             // Update reminderTime by adding reminderInterval (in minutes)
//             const newReminderTime = addMinutes(
//               new Date(reminderTime),
//               intervalMinutes,
//             );
//             console.log(
//               `Updating reminderTime for habit ${habit_id} to: ${newReminderTime.toISOString()} (BST: ${newReminderTime.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })})`,
//             );

//             await UserHabitsModel.updateOne(
//               { _id: _id },
//               { $set: { reminderTime: newReminderTime } },
//             );
//             console.log(
//               `Reminder time updated successfully for habit ${habit_id}`,
//             );
//           } else {
//             console.log(
//               `Skipping habit ${habit_id}: Time mismatch (now: ${now.toISOString()}, reminder: ${reminderTime.toISOString()})`,
//             );
//           }
//         } 
//         else {
//           console.log(
//             `Skipping habit ${habit_id}: Current date is before reminder date (now: ${now.toISOString()}, reminder: ${reminderTime.toISOString()})`,
//           );
//         }
//       } catch (habitError: any) {
//         console.error(
//           `Error processing habit ${habit_id} (ID: ${_id}):`,
//           habitError.message,
//         );
//         // Continue processing other habits
//       }
//     }
//   } catch (error: any) {
//     console.error('Error in habit reminder cron job:', error.message);
//     throw new Error(`Habit reminder failed: ${error.message}`);
//   }
// };

// // Schedule the cron job to run every minute
// console.log('Starting habit reminder cron job');
// cron.schedule('* * * * *', habitReminder, {
//   timezone: 'UTC', // Match reminderTime timezone
// });

// export default habitReminder;


import { Types } from 'mongoose';
import admin from '../firebaseSetup/firebase';
import cron from 'node-cron';
import { UserHabitsModel } from '../modules/habits/habits.model';
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

// Utility function to calculate next reminder time for today
const calculateNextReminderTimeForToday = (reminderTime: Date, intervalMinutes: number, now: Date): Date => {
  const reminderDate = new Date(reminderTime);
  const today = new Date(now);

  // Set the reminder time to today's date, keeping the original hours and minutes
  const nextReminder = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    reminderDate.getHours(),
    reminderDate.getMinutes(),
    0,
    0
  );

  // If the calculated time is in the past for today, add intervals until it's in the future
  while (nextReminder <= now) {
    nextReminder.setMinutes(nextReminder.getMinutes() + intervalMinutes);
  }

  return nextReminder;
};

const habitReminder = async () => {
  try {
    const now = new Date();
    console.log(`Running habit reminder cron job at: ${now.toISOString()} (UTC)`);

    // Log server time
    console.log('Server time (UTC):', now.toISOString());

    // Fetch Google server time for validation
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

    // Get current day in UTC to match reminderTime
    const currentDay = now.toLocaleString('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    });

    // Query habits with push notifications enabled
    const habits = await UserHabitsModel.find({
      isPushNotification: true,
    }).populate('habit_id');

    if (!habits.length) {
      console.log(
        `No habits found with isPushNotification: true at ${now.toISOString()} (UTC)`
      );
      return;
    }

    console.log(`Found ${habits.length} habits to process`);

    // Process each habit
    for (const habit of habits) {
      const { _id, reminderTime, reminderInterval, user_id, habit_id, reminderDays } = habit;

      // Validate and check if current day is in the dynamic reminderDays array
      if (!Array.isArray(reminderDays) || !reminderDays.includes(currentDay)) {
        console.log(
          `Skipping habit ${habit_id} (ID: ${_id}): Current day (${currentDay}) not in reminderDays (${reminderDays?.join(', ') || 'empty'})`
        );
        continue;
      }

      // Define habitName, handling cases where habit_id is null or undefined
      const habitName = habit_id && typeof habit_id === 'object' && 'name' in habit_id ? (habit_id as any).name : 'your habit';

      try {
        const reminderDate = new Date(reminderTime);
        const intervalMinutes = Number(reminderInterval);

        console.log(
          `Processing habit ${habitName} (ID: ${_id}) for user ${user_id}, reminderTime: ${reminderDate.toISOString()}, reminderDays: ${reminderDays.join(', ')}`
        );

        // Case 1: Reminder is for today and matches current time
        if (isSameOrLaterDay(now, reminderDate) && isSameMinute(now, reminderDate)) {
          console.log(`Sending push notification for habit ${habitName} (ID: ${_id})`);
          try {
            const subject = `⏰ Stay on Track — Your Next Step Awaits!`;
            const body = `Let's build a strong habit of "${habitName}" scheduled at ${reminderDate.toISOString()}. Stay consistent and keep going! 💪`;

            const result = await sendSingleNotification(user_id, subject, body);
            console.log(`Notification sent for habit ${habitName} (ID: ${_id}):`, result);

            // Update reminderTime to next interval
            const newReminderTime = addMinutes(reminderDate, intervalMinutes);
            console.log(
              `Updating reminderTime for habit ${habitName} (ID: ${_id}) to: ${newReminderTime.toISOString()}`
            );

            await UserHabitsModel.updateOne(
              { _id },
              { $set: { reminderTime: newReminderTime } }
            );
            console.log(`Reminder time updated successfully for habit ${habitName} (ID: ${_id})`);
          } catch (emailError: any) {
            console.error(
              `Failed to send notification for habit ${habitName} (ID: ${_id}):`,
              emailError.message
            );
          }
        }
        // Case 2: Reminder is for a future date
        else if (isSameOrLaterDay(reminderDate, now)) {
          console.log(
            `Skipping habit ${habitName} (ID: ${_id}): Reminder is in the future (reminder: ${reminderDate.toISOString()})`
          );
        }
        // Case 3: Reminder is for a past date
        else {
          console.log(
            `Habit ${habitName} (ID: ${_id}) has a past reminder date: ${reminderDate.toISOString()}`
          );

          // Calculate next reminder time for today
          const newReminderTime = calculateNextReminderTimeForToday(reminderDate, intervalMinutes, now);
          console.log(
            `Calculated new reminderTime for habit ${habitName} (ID: ${_id}) for today: ${newReminderTime.toISOString()}`
          );

          // Update reminderTime in the database
          await UserHabitsModel.updateOne(
            { _id },
            { $set: { reminderTime: newReminderTime } }
          );
          console.log(`Reminder time updated successfully for habit ${habitName} (ID: ${_id})`);

          // Check if the new reminder time matches the current time
          if (isSameMinute(now, newReminderTime)) {
            console.log(`Sending push notification for updated habit ${habitName} (ID: ${_id})`);
            try {
              const subject = `⏰ Stay on Track — Your Next Step Awaits!`;
              const body = `Let's build a strong habit of "${habitName}" scheduled at ${newReminderTime.toISOString()}. Stay consistent and keep going! 💪`;

              const result = await sendSingleNotification(user_id, subject, body);
              console.log(`Notification sent for habit ${habitName} (ID: ${_id}):`, result);

              // Update to next interval
              const nextReminderTime = addMinutes(newReminderTime, intervalMinutes);
              await UserHabitsModel.updateOne(
                { _id },
                { $set: { reminderTime: nextReminderTime } }
              );
              console.log(
                `Updated reminderTime for habit ${habitName} (ID: ${_id}) to next interval: ${nextReminderTime.toISOString()}`
              );
            } catch (emailError: any) {
              console.error(
                `Failed to send notification for updated habit ${habitName} (ID: ${_id}):`,
                emailError.message
              );
            }
          }
        }
      } catch (habitError: any) {
        console.error(
          `Error processing habit ${habitName} (ID: ${_id}):`,
          habitError.message
        );
      }
    }
  } catch (error: any) {
    console.error('Error in habit reminder cron job:', error.message);
    // Avoid throwing to keep cron job running
  }
};

// Schedule the cron job to run every minute
console.log('Starting habit reminder cron');
cron.schedule('* * * * *', habitReminder, {
  timezone: 'UTC',
});

export default habitReminder;

//why not my credentials