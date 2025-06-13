import express from "express"
import auth from "../../middleware/auth"
import { userRole } from "../../constents"
import habitController from "./habits.controller"
import { upload } from "../../util/uploadImgToCludinary"

const habitRoutes = express.Router()

habitRoutes.post("/createHabit",auth([userRole.admin]),upload.single("file"), habitController.createHabit)
habitRoutes.get("/getHabit", habitController.getHabit)

habitRoutes.post("/addHabitToUser",auth([userRole.admin, userRole.user]), habitController.addHabitToUser)
habitRoutes.post("/updateUserHabit",auth([userRole.admin, userRole.user]), habitController.updateUserHabit)
habitRoutes.post("/getUserHabits",auth([userRole.admin, userRole.user]), habitController.getUserHabits)

export default habitRoutes