import { Request, Response } from "express";
import { getDailyNutritionSummary, getUserNutritionProgress } from "./foodanalysis.service";

export const getNutritionSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) res.status(401).json({ message: "Unauthorized" });

    const timeRange = parseInt(req.query.timeRange as string) || 7;

    const rawFilter = req.query.filter as string | string[] | undefined;
    const allowedFilters = ['calories', 'protein', 'carbs', 'fats', 'fiber'];

    let filterArray: string[] | undefined;

    if (rawFilter) {
      const filters = Array.isArray(rawFilter)
        ? rawFilter.map(f => f.toLowerCase())
        : [rawFilter.toLowerCase()];

      const invalid = filters.find(f => !allowedFilters.includes(f));
      if (invalid) {
        res.status(400).json({ message: `Invalid filter: ${invalid}` });
      }

      filterArray = filters;
    }

    const data = await getDailyNutritionSummary(userId, timeRange, filterArray);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error in getNutritionSummary:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getNutritionProgress = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const timeRange = parseInt(req.query.timeRange as string) || 1;
  
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
      }
  
      const result = await getUserNutritionProgress(userId, timeRange);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      console.error("Error in getNutritionProgress:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
