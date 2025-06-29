import { Types } from 'mongoose';
import catchAsync from '../../util/catchAsync';
import idConverter from '../../util/idConvirter';
import foodLoadingServices from './food.service';

const addFoodManually = catchAsync(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new Error('Image file is required');
  }

  const data = req.body.data;
  if (!data) {
    throw new Error('Data must be provided');
  }

  const parsedData = JSON.parse(data);

  const result = await foodLoadingServices.addFoodManually(file, parsedData);

  res.status(200).json({
    status: 'success',
    message: 'Food created successfully',
    data: result.data.food,
  });
});

const addPersonalizeFoodManually = catchAsync(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new Error('Image file is required');
  }

  const data = req.body.data;
  if (!data) {
    throw new Error('Data must be provided');
  }

  const parsedData = JSON.parse(data);
  const user_id = req.user?.id; // Assuming user_id is available from auth middleware

  const result = await foodLoadingServices.addPersonalizeFoodManually(
    file,
    parsedData,
    user_id,
  );

  res.status(200).json({
    status: 'success',
    message: 'personalize Food created successfully',
    data: result.data.food,
  });
});

const addConsumedFoodFromImgOrQRCodeOrFoodId = catchAsync(async (req, res) => {
  const file = req.file;
  const data = req.body.data;
  const consumedAs= req.query.consumedAs as "breakfast" | "lunch" | "dinner" | "snack"
  if(!consumedAs)
  {
    throw new Error("consumed as must be there")
  }
  let parsedData;
  let convertedFood_id
  if (data) {
    parsedData = JSON.parse(data);
  }
  const food_id = req.query.food_id as string;
  if (food_id) {
    convertedFood_id = idConverter(food_id) as Types.ObjectId;
  }

  const user_id = req.user?.id;
  const convertedUserId = idConverter(user_id) as Types.ObjectId;

  if (!convertedUserId && (!file || !parsedData || !convertedFood_id)) {
    throw new Error('any of the required field went missing ');
  }

  const result =
    await foodLoadingServices.addConsumedFoodFromImgOrQRCodeOrFoodId(
      convertedUserId,
      consumedAs,
      file,
      parsedData,
      convertedFood_id,
    );

  res.status(200).json({
    status: 'success',
    message: 'Food consumed successfully',
    data: result,
  });
});


const deleteConsumedFood = catchAsync(async (req, res) => {
  const user_id = req.user?.id;
  if (!user_id) throw new Error('Unauthorized');

  const foodId = req.params.id;
  if (!foodId) throw new Error('Consumed food ID is required');

  const result = await foodLoadingServices.deleteConsumedFood(foodId, user_id);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});



const getAllFood = catchAsync(async(req,res)=>{
  const user_id = req.user.id as string
  const convertedId = idConverter(user_id) as Types.ObjectId

  const result = await foodLoadingServices.getAllFood(convertedId)

  res.status(200).json({
    status: 'success',
    message: 'personalize and common both Food found successfully',
    data: result,
  });
})


const updateFood = catchAsync(async (req, res) => {
  const foodId = req.query.foodId as string;
  const userId = req.user?.id as string;
  const foodData = JSON.parse(req.body.data || '{}'); // Parse food data from request body
  const file = req.file; // From multer for image upload

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (typeof userId !== "string") {
    throw new Error("Invalid user ID");
  }

  let convertedUserId: Types.ObjectId;
  let convertedFoodId: Types.ObjectId;
  try {
    convertedUserId = idConverter(userId) as Types.ObjectId;
    convertedFoodId= idConverter(foodId) as Types.ObjectId;
  } catch (error) {
    throw new Error("Invalid user ID format");
  }

  if (!Types.ObjectId.isValid(foodId)) {
    throw new Error("Invalid food ID");
  }

  const updatedFood = await foodLoadingServices.updateFood(
    convertedFoodId,
    convertedUserId,
    foodData,
    file
  );

  res.status(200).json({ success: true, message: "Food updated successfully", data: updatedFood });
});


const deleteFood = catchAsync(async (req, res) => {
  const foodId = req.query.foodId as string;
  const userId = req.user?.id as string;

  if (!userId) {
    throw new Error("User ID is required");
  }



  let convertedUserId: Types.ObjectId;
  let convertedFoodId: Types.ObjectId;
  try {
    convertedUserId = idConverter(userId) as Types.ObjectId;
    convertedFoodId = idConverter(foodId) as Types.ObjectId;
  } catch (error) {
    throw new Error("Invalid user ID format");
  }



  await foodLoadingServices.deleteFood(convertedFoodId, convertedUserId);

  res.status(200).json({ success: true, message: "Food deleted successfully" });
});

const foodLoaderController = {
  addFoodManually,
  addPersonalizeFoodManually,
  addConsumedFoodFromImgOrQRCodeOrFoodId,getAllFood,updateFood,deleteFood,
  deleteConsumedFood
};

export default foodLoaderController;
