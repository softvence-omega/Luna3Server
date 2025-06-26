import express from "express";
import { getNutritionProgress, getNutritionSummary } from "./foodanalysis.controller";
import auth from "../../middleware/auth";
import { userRole } from "../../constents";

const foodAnalysisRoutes = express.Router();

foodAnalysisRoutes.get("/summary", auth([userRole.admin, userRole.user]), getNutritionSummary);


foodAnalysisRoutes.get("/progress", auth([userRole.admin, userRole.user]), getNutritionProgress);

export default foodAnalysisRoutes;
