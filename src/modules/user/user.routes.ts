import express from "express"
import userController from "./user.controller"
import { userRole } from "../../constents"

import { upload } from "../../util/uploadImgToCludinary"
import auth from "../../middleware/auth"
const userRoutes = express.Router()

// users roiuts
userRoutes.post("/createUser", userController.createUser);

userRoutes.post("/setFCMToken", auth([userRole.admin, userRole.user]),userController.setFCMToken)

userRoutes.patch("/updateProfileData", auth([userRole.admin, userRole.user]), userController.updateProfileData);
userRoutes.delete("/selfDistuct", auth([userRole.user]), userController.selfDistuct);

userRoutes.post("/uploadOrChangeImg", auth([userRole.admin, userRole.user]), upload.single("files"),userController.uploadOrChangeImg);
userRoutes.get("/getProfile", auth([userRole.admin, userRole.user]), userController.getProfile);

userRoutes.get("/userDetails/:id", auth([userRole.admin]), userController.getUserFullDetails)

// Route to get all profiles
userRoutes.get(
  "/all-profiles",
  userController.getAllProfiles
);
userRoutes.put(
  '/update-user/:id',
  auth([userRole.admin, userRole.user]),
  userController.updateUserByAdmin
);
// admin routes
userRoutes.get("/getAlluser", auth([userRole.admin, userRole.user]), userController.getAllUsers);
userRoutes.delete("/deleteSingleUser", auth([userRole.admin]), userController.deleteSingleUser);


// Update Profile Route (with image upload)
userRoutes.patch(
    '/updateProfile',
    auth([userRole.admin, userRole.user]), // Only authenticated users can update their profile
    upload.single('img'), // Handle single image upload
    userController.updateUserProfile // Call the controller method
  );

export default userRoutes