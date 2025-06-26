import express from "express"
import auth from "../../middleware/auth"
import { userRole } from "../../constents"
import habitController from "./habits.controller"
import { upload } from "../../util/uploadImgToCludinary"
import habitReminder from "../../util/habitReminder"

const habitRoutes = express.Router()

habitRoutes.post("/createHabit",auth([userRole.admin]),upload.single("file"), habitController.createHabit)
habitRoutes.get("/getHabit", habitController.getHabit)

habitRoutes.post("/addHabitToUser",auth([userRole.admin, userRole.user]), habitController.addHabitToUser)
habitRoutes.post("/updateUserHabit",auth([userRole.admin, userRole.user]), habitController.updateUserHabit)
habitRoutes.get("/getUserHabits",auth([userRole.admin, userRole.user]), habitController.getUserHabits)

habitRoutes.get('/test-notification', async (req, res) => {
    try {
      await habitReminder(); // This runs your notification logic immediately
      res.status(200).json({ success: true, message: 'Habit reminder triggered manually' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to run habit reminder' });
    }
  });

export default habitRoutes