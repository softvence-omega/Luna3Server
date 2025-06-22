import express from 'express';
import notificationController from './notification.controller';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';

const notificationRouter = express.Router();

notificationRouter.get(
  '/getNotificationForNotificationBell',
  auth([userRole.admin, userRole.user]),
  notificationController.getNotificationForNotificationBell,
);

notificationRouter.get(
  '/getAllNotifications',
  auth([userRole.admin, userRole.user]),
  notificationController.getAllNotifications,
);

notificationRouter.get(
  '/viewSpecificNotification',
  auth([userRole.admin, userRole.user]),
  notificationController.viewSpecificNotification,
);

notificationRouter.post(
  '/sendNotificationFromAdmin',
  auth([userRole.admin]),
  notificationController.sendNotificationFromAdmin,
);

notificationRouter.get(
  '/getAllNotificationForAdmin',
  auth([userRole.admin]),
  notificationController.getAllNotificationForAdmin,
);

export default notificationRouter;
