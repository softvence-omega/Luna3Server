import { Types } from 'mongoose';
import admin from '../firebaseSetup/firebase';
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
    }).populate('habit_id');

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
            const habitName =
              typeof habit_id === 'object' && 'name' in habit_id
                ? (habit_id as any).name
                : 'your habit';
                
            console.log(
              `Processing reminder for habit ${habitName} (ID: ${_id}) for user ${user_id}, reminderTime: ${reminderTime.toISOString()} (BST: ${reminderDate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })})`,
            );

            // Send notification email (commented out as in original code)
            console.log(
              `Sending push notification email for habit ${habit_id}`,
            );
            try {
              const subject = `⏰ Stay on Track — Your Next Step Awaits!`;
              const body = `Let's build strong habit of "${habitName}" scheduled at ${new Date(reminderTime).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}. Stay consistent and keep going! 💪`;

              const result = await sendSingleNotification(
                user_id,
                subject,
                body,
              );

              console.log("Send Push Notification USERRR ::::: ", result);
              console.log(
                `📩 Email status for habit ${habit_id}:`,
                result.message,
              );
              await sendSingleNotification(new Types.ObjectId(user_id), '🌟 Don’t Forget Your Habit!',
                `Reminder: Your habit scheduled is now. Let’s keep the streak alive!`);

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



// import { Types } from 'mongoose';
// import admin from '../firebaseSetup/firebase';
// import cron from 'node-cron';
// import { UserHabitsModel } from '../modules/habits/habits.model';
// import { UserModel } from '../modules/user/user.model'; // Add User model for FCM token handling
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

// // Utility function to check time drift with Firebase
// const checkTimeDrift = async (): Promise<void> => {
//   try {
//     const response = await axios.get('http://worldtimeapi.org/api/timezone/Etc/UTC');
//     const serverTime = new Date();
//     const firebaseTime = new Date(response.data.utc_datetime);
//     const timeDiffMs = Math.abs(serverTime.getTime() - firebaseTime.getTime());
//     console.log(`Server time: ${serverTime.toISOString()} (UTC)`);
//     console.log(`Firebase time: ${firebaseTime.toISOString()} (UTC)`);
//     console.log(`Time difference (ms): ${timeDiffMs}`);
//     if (timeDiffMs > 300000) { // 5 minutes
//       console.warn('Server time is out of sync by more than 5 minutes! This may cause Firebase authentication errors.');
//     }
//   } catch (error: any) {
//     console.error('Error checking time drift:', error.message);
//   }
// };

// const habitReminder = async () => {
//   console.log('Starting habit reminder cron job');
  
//   // Schedule the cron job to run every minute
//   cron.schedule('* * * * *', async () => {
//     try {
//       const now = new Date();
//       console.log(
//         `Running habit reminder cron job at: ${now.toISOString()} (UTC), ${now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} (BST)`,
//       );

//       // Check server time drift
//       await checkTimeDrift();

//       // Get current day in UTC to match reminderTime
//       const currentDay = now.toLocaleString('en-US', {
//         weekday: 'long',
//         timeZone: 'UTC',
//       });

//       // Query habits with push notifications enabled
//       const habits = await UserHabitsModel.find({
//         isPushNotification: true,
//       }).populate('habit_id user_id'); // Populate user_id for FCM token

//       if (!habits.length) {
//         console.log(
//           `No habits found with isPushNotification: true for ${currentDay} at ${now.toISOString()} (UTC)`,
//         );
//         return;
//       }

//       console.log(`Found ${habits.length} habits to process`);

//       // Process each habit
//       for (const habit of habits) {
//         const { _id, reminderTime, reminderInterval, user_id, habit_id } = habit;

//         try {
//           const reminderDate = new Date(reminderTime);
//           // Check if current date is same as or later than reminderTime date
//           if (isSameOrLaterDay(now, reminderDate)) {
//             // Check if current time matches reminderTime
//             if (isSameMinute(now, reminderDate)) {
//               const habitName =
//                 typeof habit_id === 'object' && 'name' in habit_id
//                   ? (habit_id as any).name
//                   : 'your habit';
//               const user =
//                 typeof user_id === 'object' && 'fcmToken' in user_id
//                   ? (user_id as any)
//                   : null;

//               if (!user?.fcmToken) {
//                 console.log(`No FCM token for user ${user_id} (habit ID: ${_id})`);
//                 continue;
//               }

//               console.log(
//                 `Processing reminder for habit ${habitName} (ID: ${_id}) for user ${user_id}, reminderTime: ${reminderDate.toISOString()} (BST: ${reminderDate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })})`,
//               );

//               // Send notification
//               try {
//                 const subject = `⏰ Stay on Track — Your Next Step Awaits!`;
//                 const body = `Let's build strong habit of "${habitName}" scheduled at ${reminderDate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}. Stay consistent and keep going! 💪`;

//                 const result = await sendSingleNotification(
//                   new Types.ObjectId(user_id),
//                   subject,
//                   body,
//                 );

//                 console.log(`Notification sent for habit ${habitName} (ID: ${_id}):`, result);

//                 // Update reminderTime
//                 const intervalMinutes = Number(reminderInterval);
//                 const newReminderTime = addMinutes(reminderDate, intervalMinutes);
//                 console.log(
//                   `Updating reminderTime for habit ${habitName} (ID: ${_id}) to: ${newReminderTime.toISOString()} (BST: ${newReminderTime.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })})`,
//                 );

//                 await UserHabitsModel.updateOne(
//                   { _id },
//                   { $set: { reminderTime: newReminderTime } },
//                 );
//                 console.log(`Reminder time updated for habit ${habitName} (ID: ${_id})`);
//               } catch (notificationError: any) {
//                 console.error(
//                   `Failed to send notification for habit ${habitName} (ID: ${_id}):`,
//                   notificationError.message,
//                 );
//                 if (notificationError.code === 'messaging/registration-token-not-registered') {
//                   console.log(`Invalid FCM token for user ${user_id}, clearing from database`);
//                   await UserModel.updateOne(
//                     { _id: user_id },
//                     { $unset: { fcmToken: '' } },
//                   );
//                 }
//               }
//             } else {
//               console.log(
//                 `Skipping habit ${habit_id}: Time mismatch (now: ${now.toISOString()}, reminder: ${reminderDate.toISOString()})`,
//               );
//             }
//           } else {
//             console.log(
//               `Skipping habit ${habit_id}: Current date is before reminder date (now: ${now.toISOString()}, reminder: ${reminderDate.toISOString()})`,
//             );
//           }
//         } catch (habitError: any) {
//           console.error(
//             `Error processing habit ${habit_id} (ID: ${_id}):`,
//             habitError.message,
//           );
//         }
//       }
//     } catch (error: any) {
//       console.error('Error in habit reminder cron job:', error.message);
//       // Don't throw error to prevent cron job from stopping
//     }
//   }, {
//     timezone: 'UTC',
//   });
// };

// export default habitReminder;