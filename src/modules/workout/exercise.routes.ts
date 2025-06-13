import express from "express"
import auth from "../../middleware/auth"
import { userRole } from "../../constents"
import exerciseController from "./exercise.controller"
import { upload } from "../../util/uploadImgToCludinary"



const exerciseRoutes = express.Router()

exerciseRoutes.post("/createCommonExercise", auth([userRole.admin]),upload.single("file"), exerciseController.createCommonExercise)

export default exerciseRoutes