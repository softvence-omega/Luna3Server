import express from "express"

import { userRole } from "../../constents"
import auth from "../../middleware/auth"
import barbellController from "./baebel.controller"

const barbellRoutes = express.Router()

//workout part starts here
barbellRoutes.post("/createExerciseRoutine", auth([userRole.admin, userRole.user]),barbellController.createExerciseRoutine )
barbellRoutes.post("/saveWorkOutPlan", auth([userRole.admin, userRole.user]),barbellController.saveWorkOutPlan )
barbellRoutes.get("/getWorkoutRoutine", auth([userRole.admin, userRole.user]),barbellController.getWorkoutRoutine )
barbellRoutes.post("/updateExerciseRoutine", auth([userRole.admin, userRole.user]),barbellController.updateExerciseRoutine )

//workout Part ends here

// chat part 

barbellRoutes.post("/startChatOrGetPreviousChat", auth([userRole.admin, userRole.user]),barbellController.startChatOrGetPreviousChat )
barbellRoutes.post("/endChat", auth([userRole.admin, userRole.user]),barbellController.endChat )
barbellRoutes.post("/sendMessageAndGetReply", auth([userRole.admin, userRole.user]),barbellController.sendMessageAndGetReply )




export default barbellRoutes