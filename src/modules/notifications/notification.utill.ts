// // src/cron/unfinishedInterviewReminder.job.ts
// import cron from 'node-cron';
// import { ProfileModel } from '../user/user.model';
// import { NotificationListModel, NotificationModel } from './notification.model';
// import { sendEmail } from '../../util/sendEmail';
// import { sendSingleNotification } from '../../firebaseSetup/sendPushNotification';



// export const unfinishedInterviewHandler = async () => {
//   console.log('⏰ Running scheduled interview reminder');

//   const usersProfiles = await ProfileModel.find({
//     progress: { $elemMatch: { isCompleted: false } },
//   });

//   for (const profile of usersProfiles) {
//     const incompleteInterviews = profile.progress.filter(
//       (entry) => entry.isCompleted === false
//     );

//     if (incompleteInterviews.length > 0) {
//       console.log(`User: ${profile.user_id} has unfinished interviews:`);

//       for (const interview of incompleteInterviews) {
//         const interviewInfo = await MockInterviewModel.findById(interview.interviewId).select('interview_name');

//         if (!interviewInfo || !profile.email) continue;

//         const notificationMessage = `Reminder: You have not completed the "${interviewInfo.interview_name}" mock interview. Continue your preparation today!`;

//         // 1. Upsert NotificationList
//         const notificationList = await NotificationListModel.findOneAndUpdate(
//           { user_id: profile.user_id },
//           {
//             $setOnInsert: {
//               user_id: profile.user_id,
//               Profile_id: profile._id,
//               oldNotificationCount: 0,
//               seenNotificationCount: 0,
//               newNotification: 0,
//               notificationList: [],
//             },
//           },
//           { new: true, upsert: true }
//         );

//         // 2. Create individual notification
//         const eachNotification = await NotificationModel.create({
//           user_id: profile.user_id,
//           Profile_id: profile._id,
//           notificationType: 'interview_Progress',
//           notificationDetail: notificationMessage,
//           isSeen: false,
//         });

//         // 3. Update the NotificationList
//         await NotificationListModel.updateOne(
//           { user_id: profile.user_id },
//           {
//             $inc: {
//               oldNotificationCount: 1,
//               newNotification: 1,
//             },
//             $push: {
//               notificationList: eachNotification._id,
//             },
//           }
//         );

//         //send email from here
//         await sendEmail(
//           profile.email,
//           'Interview Progress Reminder',
//           generateEmailTemplate({
//             title: '⏰ Reminder: Continue Your Interview Practice',
//             message: `
//               This is a gentle reminder that your interview preparation is in progress, and regular practice leads to better results.
//               <br /><br />
//               <strong>${notificationMessage}</strong>
//               <br /><br />
//               Head back to your dashboard to resume your sessions and keep improving with confidence.
//             `,
//             ctaText: 'Resume Interview Practice',
//             // ctaLink: 'https://your-app-url.com/dashboard'
//           })
//         );
//         // await sendEmail(
//         //   profile.email,
//         //   'Reminder Notification',
//         //   `
//         //   <h2>This notification is from AI Interview</h2>
//         //   <p>${notificationMessage}</p>
//         //   <p>Thank you for being a part of our community</p>
//         //   `
//         // );

//         await sendSingleNotification(profile.user_id,"Interview Progress Reminder", notificationMessage)

//         console.log(`🔔 Notification sent for "${interviewInfo.interview_name}" to user ${profile.user_id}`);
//       }
//     }
//   }
// };


// const jobNotificationHandler = async () => {
//   console.log('🔎 Checking who needs job notifications');

//   const today = new Date();

//   const users = await ProfileModel.find({});

//   for (const user of users) {
//     const { currentPlan, lastJobNotificationDate,email,user_id } = user;
//     if (!currentPlan) continue; // Skip users without a plan or email
//     let intervalDays = 0;

//     if (currentPlan === 'free') intervalDays = 30;
//     else if (currentPlan === 'Premium') intervalDays = 7;
//     else if (currentPlan === 'Pay-Per') intervalDays = 15;
//     else continue; // Skip users with unknown or invalid plans

//     const lastNotified = new Date(lastJobNotificationDate || 0);
//     const diff = (today.getTime() - lastNotified.getTime()) / (1000 * 3600 * 24);

//     if (diff >= intervalDays) {
//       const message = `🎯 New job opportunities await you! Visit the app and apply today.`;

//       const notification = await NotificationModel.create({
//         user_id: user.user_id,
//         Profile_id: user._id,
//         notificationType: 'latest_job',
//         notificationDetail: message,
//         isSeen: false,
//       });

//       await NotificationListModel.findOneAndUpdate(
//         { user_id: user.user_id },
//         {
//           $inc: { oldNotificationCount: 1, newNotification: 1 },
//           $push: { notificationList: notification._id },
//           $setOnInsert: {
//             Profile_id: user._id,
//             seenNotificationCount: 0,
//           },
//         },
//         { upsert: true, new: true }
//       );

//       await ProfileModel.updateOne(
//         { _id: user._id },
//         { $set: { lastJobNotificationDate: today } }
//       );


//       //send email from here
//     if(!email)
//     {
//       continue
//     }
//     await sendEmail(
//       email,
//       'Job Reminder Notification',
//       generateEmailTemplate({
//         title: '📌 Job Opportunity Reminder',
//         message: `
//           Just a heads-up! Here's a job or opportunity we think you should check out:
//           <br /><br />
//           <strong>${message}</strong>
//           <br /><br />
//           Take advantage of this opportunity and don’t forget to apply before the deadline.
//         `,
//         ctaText: 'View Job Listing',
//         // ctaLink: 'https://your-app-url.com/jobs'
//       })
//     );
//         // await sendEmail(
//         //   email,
//         //   'Job Reminder Notification',
//         //   `
//         //   <h2>This notification is from AI Interview</h2>
//         //   <p>${message}</p>
//         //   <p>Thank you for being a part of our community</p>
//         //   `
//         // );

//         await sendSingleNotification(user_id,"Job Reminder Notification", message)

//       console.log(`📨 Job notification sent to ${user.user_id}`);
//     }
//   }
// };



// const upgradePlanReminderHandler = async () => {
//   console.log('💡 Sending upgrade reminders...');

//   const users = await ProfileModel.find({});

//   for (const user of users) {
//     // Skip users with the "premium" plan
//     if (user.currentPlan === 'premium') {
//       console.log(`✅ Skipping upgrade reminder for ${user.user_id} (Premium plan)`);
//       continue;
//     }

//     const message = `Your current plan may limit your growth. Consider upgrading to get more features!`;

//     const notification = await NotificationModel.create({
//       user_id: user.user_id,
//       Profile_id: user._id,
//       notificationType: 'upgrade_plan',
//       notificationDetail: message,
//       isSeen: false,
//     });

//     await NotificationListModel.updateOne(
//       { user_id: user.user_id },
//       {
//         $inc: { oldNotificationCount: 1, newNotification: 1 },
//         $push: { notificationList: notification._id },
//       },
//       { upsert: true }
//     );

//     //send email from here
//      //send email from here
//      if(!user.email)
//       {
//         continue
//       }

//       await sendEmail(
//         user.email,
//         '🚀 Upgrade Plan Notification',
//         generateEmailTemplate({
//           title: '🚀 Take Your Interview Prep to the Next Level!',
//           message: `
//             ${message}
//             <br /><br />
//             Upgrading to our <strong>Premium Plan</strong> unlocks:
//             <ul style="margin-top: 10px; margin-bottom: 10px; padding-left: 20px;">
//               <li>✅ Unlimited AI-powered interview simulations</li>
//               <li>✅ Personalized feedback and analytics</li>
//               <li>✅ Access to premium content and resources</li>
//               <li>✅ Priority support from our team</li>
//             </ul>
//             Don’t miss the chance to supercharge your preparation!
//           `,
//           ctaText: 'Upgrade Now',
//           ctaLink: 'https://cerulean-pavlova-50e690.netlify.app/pricing'
//         })
//       );
//           // await sendEmail(
//           //   user.email,
//           //   'Upgrade plan Notification',
//           //   `
//           //   <h2>This notification is from AI Interview</h2>
//           //   <p>${message}</p>
//           //   <p>Thank you for being a part of our community</p>
//           //   `
//           // );


//           await sendSingleNotification(user.user_id,"Upgrade plan Notification", message)

//     console.log(`⚠️ Upgrade reminder sent to ${user.user_id}`);
//   }
// };




// const startNotificationSchedulers = () => {
//   // Every 3 days at 10:00 AM
//   cron.schedule('0 10 */3 * *', async () => {
//     await unfinishedInterviewHandler();
//   });

//   // Every day at 11:00 AM — check which users need a job notification (based on their plan)
//   cron.schedule('0 11 * * *', async () => {
//     await jobNotificationHandler();
//   });

//   // Every 30 days at 12:00 PM
//   cron.schedule('0 12 */30 * *', async () => {
//     await upgradePlanReminderHandler();
//   });
// };

// startNotificationSchedulers()

// export default startNotificationSchedulers;