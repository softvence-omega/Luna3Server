import express from "express";
import { getNutritionSummary } from "./foodanalysis.controller";
import auth from "../../middleware/auth";
import { userRole } from "../../constents";

const foodAnalysisRoutes = express.Router();

foodAnalysisRoutes.get("/summary", auth([userRole.admin, userRole.user]), getNutritionSummary);

export default foodAnalysisRoutes;
