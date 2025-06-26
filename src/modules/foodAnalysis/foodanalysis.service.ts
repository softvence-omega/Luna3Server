import mongoose from "mongoose";
import { UserConsumedFoodModel } from "../foodLooging/food.model";
import { WorkoutASetupModel } from "../user/user.model";

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

export const getUserNutritionProgress = async (
    userId: string,
    timeRange: number
  ) => {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - timeRange);
  
    // Step 1: Get User Goal
    const workoutSetup = await WorkoutASetupModel.findOne({ user_id: userId });
    if (!workoutSetup) {
      throw new Error("Workout setup not found for user");
    }
  
    const goal = {
      calorieGoal: workoutSetup.calorieGoal,
      proteinGoal: workoutSetup.proteinGoal,
      carbsGoal: workoutSetup.carbsGoal,
      fatsGoal: workoutSetup.fatsGoal,
      fiberGoal: workoutSetup.fiberGoal,
    };
  
    // Step 2: Aggregate consumed data
    const [consumed] = await UserConsumedFoodModel.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: null,
          totalCalories: {
            $sum: { $multiply: ["$nutritionPerServing.calories", "$servings"] },
          },
          totalProtein: {
            $sum: { $multiply: ["$nutritionPerServing.protein", "$servings"] },
          },
          totalCarbs: {
            $sum: { $multiply: ["$nutritionPerServing.carbs", "$servings"] },
          },
          totalFats: {
            $sum: { $multiply: ["$nutritionPerServing.fats", "$servings"] },
          },
          totalFiber: {
            $sum: { $multiply: ["$nutritionPerServing.fiber", "$servings"] },
          },
        },
      },
    ]);
  
    const actual = consumed || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      totalFiber: 0,
    };
  
    // Step 3: Calculate difference and percentage
    const calculateProgress = (goal: number, actual: number) => {
      const remaining = Math.max(goal - actual, 0);
      const progress = goal > 0 ? Math.min((actual / goal) * 100, 100) : 0;
      return { goal, actual, remaining, progress: Number(progress.toFixed(2)) };
    };
  
    return {
      calories: calculateProgress(goal.calorieGoal, actual.totalCalories),
      protein: calculateProgress(goal.proteinGoal, actual.totalProtein),
      carbs: calculateProgress(goal.carbsGoal, actual.totalCarbs),
      fats: calculateProgress(goal.fatsGoal, actual.totalFats),
      fiber: calculateProgress(goal.fiberGoal, actual.totalFiber),
    };
  };

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
