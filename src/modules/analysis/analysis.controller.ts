import { Types } from "mongoose"
import catchAsync from "../../util/catchAsync"
import idConverter from "../../util/idConvirter"
import analysisService from "./analisis.service"

const getAllExerciseVariantPerformedByUser= catchAsync(async (req, res)=>{
const user_id = idConverter(req.user.id as string) as Types.ObjectId

const result = await analysisService.getAllExerciseVariantPerformedByUser(user_id)
res.status(200).json({
    status: "found all performed exercise name by user",
    data:result
  })
})



const runAnalysis = catchAsync(async (req, res) => {
    const { timeSpan, filterParameter, exerciseId } = req.query;
    const userId = req.user?.id as string;
  
    if (!userId) {
      throw new Error("User ID is required");
    }
  
    // Validate userId
    if (typeof userId !== "string") {
      throw new Error("Invalid user ID");
    }
  
    // Convert userId to ObjectId
    let convertedUserId: Types.ObjectId;
    try {
      convertedUserId = idConverter(userId) as Types.ObjectId;
    } catch (error) {
      throw new Error("Invalid user ID format");
    }
  
    // Validate exerciseId if provided
    if (exerciseId && !Types.ObjectId.isValid(exerciseId as string)) {
      throw new Error("Invalid exercise ID");
    }
  
    // Validate timeSpan
    const validTimeSpans: Array<"7_days" | "30_days" | "60_days" | "90_days" | "yearly"> = [
      "7_days",
      "30_days",
      "60_days",
      "90_days",
      "yearly"
    ];
    if (!validTimeSpans.includes(timeSpan as any)) {
      throw new Error("Invalid time span");
    }
  
    // Validate filterParameter
    const validFilters: Array<"duration" | "volume" | "reps" | "totalCaloryBurn"> = [
      "duration",
      "volume",
      "reps",
      "totalCaloryBurn"
    ];
    if (!validFilters.includes(filterParameter as any)) {
      throw new Error("Invalid filter parameter");
    }
  
    // Run analysis
    const result = await analysisService.runAnalysis(
      convertedUserId,
      timeSpan as "7_days" | "30_days" | "60_days" | "90_days" | "yearly",
      filterParameter as "duration" | "volume" | "reps" | "totalCaloryBurn",
      exerciseId ? idConverter(exerciseId as string) as Types.ObjectId : undefined
    );
  
    res.status(200).json({sucess:true, message:"analysis done", data:result});
  });
  

const analysisController = {getAllExerciseVariantPerformedByUser,runAnalysis}

export default analysisController
