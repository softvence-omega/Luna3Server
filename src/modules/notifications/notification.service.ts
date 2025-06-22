import { Types } from 'mongoose';
import {
  NotificationListModel,
  NotificationModel,
} from './notification.model';
import { ProfileModel } from '../user/user.model';
import { sendSingleNotification } from '../../firebaseSetup/sendPushNotification';

const getNotificationForNotificationBell = async(user_id: Types.ObjectId)=>{
  const result = await NotificationListModel.findOne(
    { user_id: user_id },
  ).select('newNotification seenNotificationCount oldNotificationCount');
  return result;
}

const getAllNotifications = async (user_id: Types.ObjectId) => {
  // Automatically update the notification counts and retrieve the updated document
  const updatedNotificationList = await NotificationListModel.findOneAndUpdate(
    { user_id: user_id },
    [
      {
        $set: {
          seenNotificationCount: {
            $add: ['$seenNotificationCount', '$newNotification'],
          },
          newNotification: 0,
        },
      },
    ],
    {
      new: true,
    },
  ).populate({
    path: 'notificationList',
    options: { sort: { createdAt: -1 } },
  });

  return updatedNotificationList;
};

const viewSpecificNotification = async (
  notification_id: Types.ObjectId,
  user_id?: Types.ObjectId,
) => {
  try {
    console.log('notification for ', user_id);

    const updatedNotification = await NotificationModel.findOneAndUpdate(
      { _id: notification_id },
      { $set: { isSeen: true } },
      { new: true },
    );

    return updatedNotification;
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

const sendNotificationFromAdmin = async (payload: {
  receiverList: string | string[];
  notificationMessage: string;
}) => {
  try {
    const { receiverList, notificationMessage } = payload;

    // Determine profiles based on receiverList
    let profiles;
    if (receiverList === 'all') {
      // Fetch all profiles if receiverList is 'all'
      profiles = await ProfileModel.find({}).select('_id user_id');
    } else {
      // Convert string IDs to ObjectIds and fetch matching profiles
      const userIds = (
        Array.isArray(receiverList) ? receiverList : [receiverList]
      ).map((id) => new Types.ObjectId(id));
      profiles = await ProfileModel.find({ user_id: { $in: userIds } }).select(
        '_id user_id',
      );
    }

    if (!profiles || profiles.length === 0) {
      throw new Error('No matching profiles found for the provided user IDs');
    }

    // Process notifications and send push notifications for each profile
    for (const profile of profiles) {
      if (!profile.user_id) {
        continue;
      }

      // 1. Upsert NotificationList
    //   const notificationList = 
      await NotificationListModel.findOneAndUpdate(
        { user_id: profile.user_id },
        {
          $setOnInsert: {
            user_id: profile.user_id,
            Profile_id: profile._id,
            oldNotificationCount: 0,
            seenNotificationCount: 0,
            newNotification: 0,
            notificationList: [],
          },
        },
        { new: true, upsert: true },
      );

      // 2. Create individual notification
      const eachNotification = await NotificationModel.create({
        user_id: profile.user_id,
        Profile_id: profile._id,
        notificationType: 'admin_notification',
        notificationDetail: notificationMessage,
        isSeen: false,
      });

      // 3. Update the NotificationList
      await NotificationListModel.updateOne(
        { user_id: profile.user_id },
        {
          $inc: {
            oldNotificationCount: 1,
            newNotification: 1,
          },
          $push: {
            notificationList: eachNotification._id,
          },
        },
      );

      // Send push notification
      await sendSingleNotification(profile.user_id, 'Admin Notification', notificationMessage);
    }

    return {
      success: true,
      message: 'Notifications saved and push notifications sent successfully',
    };
  } catch (error) {
    console.error('Error in sendNotificationFromAdmin:', error);
    throw error;
  }
};

const getAllNotificationForAdmin = async (notificationType?: string) => {
  try {
    // Build the query object
    const query: { notificationType?: any } = {
      notificationType: { $ne: 'admin_notification' },
    };
    if (notificationType) {
      query.notificationType = notificationType;
    }

    const allNotifications = await NotificationModel.find(query)
      .lean()
      .sort({ createdAt: -1 })
      .populate({
        path: 'Profile_id',
        select: 'img -_id name', // Select only the img field from ProfileModel
      })
      .select('-__v');

    return allNotifications;
  } catch (error) {
    console.error('Error in getAllNotificationForAdmin:', error);
    throw new Error(
      `Failed to fetch notifications${notificationType ? ` for type: ${notificationType}` : ''}`,
    );
  }
};

const notificationServices = {
  getAllNotifications,
  viewSpecificNotification,
  sendNotificationFromAdmin,
  getAllNotificationForAdmin,
  getNotificationForNotificationBell
};

export default notificationServices;