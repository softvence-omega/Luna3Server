import express from 'express';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';
import { upload } from '../../util/uploadImgToCludinary';
import foodLoaderController from './food.controller';
const foodRoutes = express.Router();

foodRoutes.post(
  '/addFoodManually',
  auth([userRole.admin]),
  upload.single('file'),
  foodLoaderController.addFoodManually,
);

foodRoutes.post(
  '/addPersonalizeFoodManually',
  auth([userRole.admin, userRole.user]),
  upload.single('file'),
  foodLoaderController.addPersonalizeFoodManually,
);

foodRoutes.post(
  '/addConsumedFoodFromImgOrQRCodeOrFoodId',
  auth([userRole.admin, userRole.user]),
  upload.single('file'),
  foodLoaderController.addConsumedFoodFromImgOrQRCodeOrFoodId,
);

foodRoutes.delete(
  '/deleteConsumedFood/:id',
  auth([userRole.admin, userRole.user]),
  foodLoaderController.deleteConsumedFood,
);

foodRoutes.get(
  '/getAllFood',
  auth([userRole.admin, userRole.user]),
  foodLoaderController.getAllFood,
);

foodRoutes.delete(
  '/deleteFood',
  auth([userRole.admin, userRole.user]),
  foodLoaderController.deleteFood,
);

foodRoutes.put(
  '/updateFood',
  auth([userRole.admin, userRole.user]),
  upload.single('file'),
  foodLoaderController.updateFood,
);

export default foodRoutes;
