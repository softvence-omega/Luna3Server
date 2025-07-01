import express from "express";
import auth from "../../middleware/auth";
import { userRole } from "../../constents";
import exerciseController from "./exercise.controller";
import { upload } from "../../util/uploadImgToCludinary";

const exerciseRoutes = express.Router();

// Create a common exercise (Admin only, with file upload)
exerciseRoutes.post(
  "/createCommonExercise",
  auth([userRole.admin]),
  upload.single("file"),
  exerciseController.createCommonExercise
);

// Create a personalized exercise (Authenticated users, with file upload)
exerciseRoutes.post(
  "/createPersonalizeExercise",
  auth([userRole.user, userRole.admin]),
  upload.single("file"),
  exerciseController.createPersonalizeExercise
);

// Get both common and personalized exercises (Authenticated users)
exerciseRoutes.get(
  "/getExerciseBothCommonAndPersonalize",
  auth([userRole.user, userRole.admin]),
  exerciseController.getExerciseBothCommonAndPersonalize
);

// Get exercise by ID (Authenticated users)
exerciseRoutes.get(
  "/getExerciseById",
  auth([userRole.user, userRole.admin]),
  exerciseController.getExerciseById
);

// Perform an exercise (Authenticated users)
exerciseRoutes.post(
  "/performExercise",
  auth([userRole.user, userRole.admin]),
  exerciseController.performExercise
);

// Mark exercise as completed (Authenticated users)
exerciseRoutes.patch(
  "/markExerciseAsCompleated",
  auth([userRole.user, userRole.admin]),
  exerciseController.markExerciseAsCompleated
);

// Delete exercise by ID (Authenticated user or admin)
exerciseRoutes.delete(
  "/deleteExercise/:id",
  auth([userRole.user, userRole.admin]),
  exerciseController.deleteExercise
);


export default exerciseRoutes;