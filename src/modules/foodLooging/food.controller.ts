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

const foodLoaderController = {
  addFoodManually,
  addPersonalizeFoodManually,
  addConsumedFoodFromImgOrQRCodeOrFoodId,getAllFood
};

export default foodLoaderController;
