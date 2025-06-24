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
interface AnalysisResult {
    date: string; // YYYY-MM-DD for daily, YYYY-MM for monthly
    value: number; // Value based on filterParameter
  }

const runAnalysis = async (
    user_id: Types.ObjectId,
    TimeSpan: "7_days" | "30_days" | "60_days" | "90_days" | "yearly",
    filterParameter: "duration" | "volume" | "reps" | "totalCaloryBurn",
    exercise_id?: Types.ObjectId
  ): Promise<AnalysisResult[]> => {
    try {
      // Validate inputs
      if (!Types.ObjectId.isValid(user_id)) throw new Error("Invalid user ID");
      if (exercise_id && !Types.ObjectId.isValid(exercise_id)) throw new Error("Invalid exercise ID");
  
      // Calculate start date based on TimeSpan
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
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
            startDate.setDate(today.getDate() - 6); // 7 days including today
            break;
          case "30_days":
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 29);
            break;
          case "60_days":
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 59);
            break;
          case "90_days":
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 89);
            break;
          default:
            throw new Error("Invalid TimeSpan");
        }
      }
  
      // Build match stage
      const matchStage: any = {
        user_id,
        createdAt: { $gte: startDate, $lte: today }
      };
      if (exercise_id) {
        matchStage.exercise_id = exercise_id;
      }
  
      // Aggregate data
      const result = await UserExercisePerformModel.aggregate([
        { $match: matchStage },
        // Group by date (daily or monthly)
        {
          $group: {
            _id: isYearly
              ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
              : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            duration: { $sum: "$resetTime" },
            volume: { $sum: { $multiply: ["$weightLifted", "$reps", "$set"] } },
            reps: { $sum: "$reps" },
            totalCaloryBurn: { $sum: "$totalCaloryBurn" }
          }
        },
        // Project to select the relevant field
        {
          $project: {
            _id: 0,
            date: "$_id",
            value: `$${filterParameter}`
          }
        },
        { $sort: { date: 1 } }
      ]);
  
      // Generate date range (daily or monthly)
      const dateRange: AnalysisResult[] = [];
      if (isYearly) {
        // Generate 12 months from (today's month - 11) to today
        const current = new Date(today);
        current.setMonth(today.getMonth() - 11);
        current.setDate(1); // Start of month
        for (let i = 0; i < 12; i++) {
          const monthStr = current.toISOString().slice(0, 7); // YYYY-MM
          const found = result.find((r: any) => r.date === monthStr);
          dateRange.push({
            date: monthStr,
            value: found ? found.value : 0
          });
          current.setMonth(current.getMonth() + 1);
        }
      } else {
        // Generate daily range
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
          const found = result.find((r: any) => r.date === dateStr);
          dateRange.push({
            date: dateStr,
            value: found ? found.value : 0
          });
        }
      }
  
      return dateRange;
    } catch (error: any) {
      console.error(`Error running analysis for user ${user_id}:`, error);
      throw new Error(error.message || "Failed to run analysis");
    }
  };


const analysisService = {
  getAllExerciseVariantPerformedByUser,runAnalysis
};

export default analysisService;