import { Types } from "mongoose";
import { UserExercisePerformModel } from "../workout/exercise.model";


const getAllExerciseVariantPerformedByUser = async (userId: Types.ObjectId)=> {
  try {
    if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");

    const result = await UserExercisePerformModel.aggregate([
      { $match: { user_id: userId } },
      { $lookup: { from: "exercises", localField: "exercise_id", foreignField: "_id", as: "exercise_id" } },
      { $unwind: "$exercise_id" },
      { $group: { _id: "$exercise_id._id", name: { $first: "$exercise_id.name" } } },
      { $project: { _id: 0, exercise_id: "$_id", name: 1 } }
    ]);

    // console.log("result is here =====>>>",result)
    return result;
  } catch (error: any) {
    console.error(`Error fetching exercises for user ${userId}:`, error);
    throw new Error(error.message || "Failed to fetch exercises");
  }
};


// Interface for analysis result (daily or monthly)
// Interface for analysis result (daily or monthly)

interface AnalysisResult {
  date?: string; // YYYY-MM-DD for daily, YYYY-MM for monthly
  set?: number;
  weightLifted?: number;
  reps?: number;
  totalCaloryBurn?: number;
  duration?: number;
  volume?: number;
}

interface AnalysisResponse {
  chart: AnalysisResult[];
  totals: AnalysisResult;
}

const runAnalysis = async (
  user_id: Types.ObjectId,
  TimeSpan: "7_days" | "30_days" | "60_days" | "90_days" | "yearly",
  filterParameter?: "duration" | "volume" | "reps" | "totalCaloryBurn"|"set",
  exercise_id?: Types.ObjectId
): Promise<AnalysisResponse> => {
  try {
    if (!Types.ObjectId.isValid(user_id)) throw new Error("Invalid user ID");
    if (exercise_id && !Types.ObjectId.isValid(exercise_id)) throw new Error("Invalid exercise ID");

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate: Date;
    const isYearly = TimeSpan === "yearly";

    if (isYearly) {
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      startDate.setMonth(today.getMonth() + 1, 1); // Start of next month last year
    } else {
      switch (TimeSpan) {
        case "7_days":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 6); // 7 days including yesterday
          break;
        case "30_days":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 29); // 30 days including today
          break;
        case "60_days":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 59); // 60 days including today
          break;
        case "90_days":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 89); // 90 days including today
          break;
        default:
          throw new Error("Invalid TimeSpan");
      }
    }

    const matchStage: any = {
      user_id,
      createdAt: { $gte: startDate, $lte: today }
    };
    if (exercise_id) {
      matchStage.exercise_id = exercise_id;
    }

    const result = await UserExercisePerformModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: isYearly
            ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
            : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          duration: { $sum: "$resetTime" },
          volume: { $sum: { $multiply: ["$weightLifted", "$reps", "$set"] } },
          reps: { $sum: "$reps" },
          totalCaloryBurn: { $sum: "$totalCaloryBurn" },
          set: { $sum: "$set" },
          weightLifted: { $sum: "$weightLifted" }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          ...(filterParameter
            ? { [filterParameter]: `$${filterParameter}` }
            : {
                set: "$set",
                weightLifted: "$weightLifted",
                reps: "$reps",
                totalCaloryBurn: "$totalCaloryBurn"
              })
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Calculate totals
    const totalsResult = await UserExercisePerformModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          duration: { $sum: "$resetTime" },
          volume: { $sum: { $multiply: ["$weightLifted", "$reps", "$set"] } },
          reps: { $sum: "$reps" },
          totalCaloryBurn: { $sum: "$totalCaloryBurn" },
          set: { $sum: "$set" },
          weightLifted: { $sum: "$weightLifted" }
        }
      },
      {
        $project: {
          _id: 0,
          ...(filterParameter
            ? { [filterParameter]: `$${filterParameter}` }
            : {
                set: "$set",
                weightLifted: "$weightLifted",
                reps: "$reps",
                totalCaloryBurn: "$totalCaloryBurn"
              })
        }
      }
    ]);

    const totals = totalsResult.length > 0
      ? totalsResult[0]
      : filterParameter
      ? { [filterParameter]: 0 }
      : { set: 0, weightLifted: 0, reps: 0, totalCaloryBurn: 0 };

    // Generate date range for data
    const dateRange: AnalysisResult[] = [];
    if (isYearly) {
      const current = new Date(today);
      current.setMonth(today.getMonth() - 11);
      current.setDate(1);
      for (let i = 0; i < 12; i++) {
        const monthStr = current.toISOString().slice(0, 7);
        const found = result.find((r: any) => r.date === monthStr);
        dateRange.push(
          filterParameter
            ? { date: monthStr, [filterParameter]: found ? found[filterParameter] : 0 }
            : {
                date: monthStr,
                set: found ? found.set : 0,
                weightLifted: found ? found.weightLifted : 0,
                reps: found ? found.reps : 0,
                totalCaloryBurn: found ? found.totalCaloryBurn : 0
              }
        );
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const found = result.find((r: any) => r.date === dateStr);
        dateRange.push(
          filterParameter
            ? { date: dateStr, [filterParameter]: found ? found[filterParameter] : 0 }
            : {
                date: dateStr,
                set: found ? found.set : 0,
                weightLifted: found ? found.weightLifted : 0,
                reps: found ? found.reps : 0,
                totalCaloryBurn: found ? found.totalCaloryBurn : 0
              }
        );
      }
    }

    return { chart: dateRange, totals };
  } catch (error: any) {
    console.error(`Error running analysis for user ${user_id}:`, error);
    throw new Error(error.message || "Failed to run analysis");
  }
};


const analysisService = {
  getAllExerciseVariantPerformedByUser,runAnalysis
};

export default analysisService;