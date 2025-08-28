import express from "express"
import { userRole } from "../../constents"
import auth from "../../middleware/auth"
import analysisController from "./analysis.controller"

const analysisRoutes = express.Router()

analysisRoutes.get("/getAllExerciseVariantPerformedByUser", auth([userRole.admin, userRole.user]),analysisController.getAllExerciseVariantPerformedByUser )

analysisRoutes.get("/runAnalysis", auth([userRole.admin, userRole.user]),analysisController.runAnalysis )

export default  analysisRoutes
