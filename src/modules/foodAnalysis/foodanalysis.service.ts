import mongoose from "mongoose";
import { UserConsumedFoodModel } from "../foodLooging/food.model";

export const getDailyNutritionSummary = async (
  userId: string,
  timeRange: number,
  filterArray?: string[]
) => {
  const fields = ['calories', 'protein', 'carbs', 'fats', 'fiber'];
  const selectedFields = filterArray || fields;

  // Step 1: Build match filter
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - timeRange);
  const matchFilter = {
    user_id: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: fromDate },
  };

  // Step 2: Aggregate from DB
  const groupStage: Record<string, any> = {
    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
  };

  for (const key of selectedFields) {
    groupStage[`total${capitalize(key)}`] = {
      $sum: { $multiply: [`$nutritionPerServing.${key}`, "$servings"] },
    };
  }

  const dbResults = await UserConsumedFoodModel.aggregate([
    { $match: matchFilter },
    { $group: groupStage },
    { $sort: { _id: 1 } },
  ]);

  // Step 3: Fill missing dates with zero values
  const resultMap = new Map<string, any>();
  for (const dayData of dbResults) resultMap.set(dayData._id, dayData);

  const finalData: any[] = [];
  const total: Record<string, number> = {};
  selectedFields.forEach(key => total[`total${capitalize(key)}`] = 0);

  for (let i = 0; i < timeRange; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (timeRange - 1 - i));
    const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

    const existing = resultMap.get(dateStr);
    const dayEntry: Record<string, any> = { date: dateStr };

    for (const key of selectedFields) {
      const fieldName = `total${capitalize(key)}`;
      const val = existing?.[fieldName] || 0;
      dayEntry[fieldName] = val;
      total[fieldName] += val;
    }

    finalData.push(dayEntry);
  }

  return {
    daily: finalData,
    total,
  };
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
