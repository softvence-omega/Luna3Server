import { Types } from "mongoose";
import { TFood, TUserConsumedFood } from "./food.interface";
import { FoodModel, UserConsumedFoodModel } from "./food.model";
import { deleteFile, uploadImgToCloudinary } from "../../util/uploadImgToCludinary";
import config from "../../config";
import fs from 'fs';

const addFoodManually = async (file: any, payload: Partial<TFood>, user_id?: Types.ObjectId) => {
    // Validate inputs
    if (!payload || !payload.name || !payload.servings || !payload.nutritionPerServing) {
      throw new Error('Name, servings, and nutritionPerServing are required.');
    }
  
    if (
      !payload.nutritionPerServing?.calories ||
      !payload.nutritionPerServing?.protein ||
      !payload.nutritionPerServing?.carbs ||
      !payload.nutritionPerServing?.fats ||
      !payload.nutritionPerServing?.fiber
    ) {
      throw new Error('All nutritionPerServing fields (calories, protein, carbs, fats, fiber) are required');
    }
  
    if (!file || !file.path) {
      throw new Error('Image file is required.');
    }
  
    const session = await FoodModel.startSession();
  
    try {
      await session.startTransaction();
      console.log('Transaction started for food creation');
  
      // Upload image to Cloudinary
      const imageName = `${payload.name}-${Date.now()}`; // Unique name
      const uploadResult = await uploadImgToCloudinary(imageName, file.path);
      const imageUrl = uploadResult.secure_url;
      console.log('Image uploaded to Cloudinary:', imageUrl);
  
      // Create food payload
      const foodPayload: Partial<TFood> = {
        ...payload,
        img: imageUrl,
        ...(user_id && { user_id }), // Include user_id if provided
      };
  
      // Create and save the food
      const food = new FoodModel(foodPayload);
      const savedFood = await food.save({ session });
      console.log('Food saved:', savedFood._id);
  
      // Commit the transaction
      await session.commitTransaction();
      console.log('Transaction committed');
  
      return {
        success: true,
        message: 'Food created successfully.',
        data: {
          food: savedFood,
        },
      };
    } catch (error: any) {
      await session.abortTransaction();
      console.error('Error creating food:', error);
  
      // Clean up local file if upload failed
      if (file && file.path) {
        try {
          await deleteFile(file.path);
        } catch (deleteError) {
          console.error('Error deleting file:', deleteError);
        }
      }
  
      throw new Error(
        error.message || 'Failed to create food due to an internal error.',
      );
    } finally {
      session.endSession();
      console.log('Session ended');
    }
  };


const addPersonalizeFoodManually=async (file: any, payload: Partial<TFood>, user_id?: Types.ObjectId)=>{
    const result = await addFoodManually(file,payload,user_id)
    return result
  }



// AI API function to get nutrition data from raw image using fetch
const getNutritionFromAI = async (
    file: any
  ): Promise<TUserConsumedFood['nutritionPerServing']> => {
    const aiCaloryCountEndPoint = "analyze-meal-nutrition";
    const fullAiApi = `${config.AI_BASE_URL}${aiCaloryCountEndPoint}`;
  
    try {
      // Log file details for debugging
      console.log('File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? 'Buffer present' : 'No buffer',
        path: file.path || 'No path',
      });
  
      // Prepare form-data for AI API
      const formData = new FormData();
      // Use fs.createReadStream for disk storage
      formData.append('image', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });
  
      // Make POST request to AI API using fetch
      const response = await fetch(fullAiApi, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        body: formData,
      });
  
      console.log('AI response status:', response.status, response.statusText);
  
      if (!response.ok) {
        // Log response body for errors
        const errorData = await response.json();
        console.error('AI API error response:', errorData);
        throw new Error(`AI API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      }
  
      // Parse AI response (values are strings)
      const data = await response.json();
      console.log('AI response:', data);
      const { 
        total_protein_g, 
        total_carbs_g, 
        total_fats_g, 
        total_fiber_g, 
        total_calories 
      } = data;
  
      // Convert string values to numbers
      return {
        calories: parseFloat(total_calories) || 0,
        protein: parseFloat(total_protein_g) || 0,
        carbs: parseFloat(total_carbs_g) || 0,
        fats: parseFloat(total_fats_g) || 0,
        fiber: parseFloat(total_fiber_g) || 0,
      };
    } catch (error: any) {
      console.error('AI API error:', error.message);
      throw new Error('Failed to fetch nutrition data from AI API');
    }
  };
  
  const addConsumedFoodFromImgOrQRCodeOrFoodId = async (
    user_id: Types.ObjectId,
    consumedAs: "breakfast" | "lunch" | "dinner" | "snack",
    file?: any,
    parsedData?: Partial<TUserConsumedFood>,
    food_id?: Types.ObjectId
  ): Promise<TUserConsumedFood> => {
    console.log("i am consumed food");
  
    // Validate inputs
    if (!user_id) {
      throw new Error('User ID is required');
    }
  
    if (!file && !parsedData && !food_id) {
      throw new Error('At least one of file, data, or food_id must be provided');
    }
  
    if (!consumedAs) {
      throw new Error('consumedAs is required');
    }
  
    let nutritionPerServing: TUserConsumedFood['nutritionPerServing'];
    let servings: number = parsedData?.servings || 1; // Default to 1
  
    try {
      // Case 1: Handle image file (send to AI API)
      if (file) {
        console.log("i am being called");
        // Call AI API directly with raw file
        nutritionPerServing = await getNutritionFromAI(file);
      }
      // Case 2: Use nutrition data from parsedData
      else if (parsedData?.nutritionPerServing) {
        nutritionPerServing = {
          calories: (parsedData.nutritionPerServing.calories || 0) * servings,
          protein: (parsedData.nutritionPerServing.protein || 0) * servings,
          carbs: (parsedData.nutritionPerServing.carbs || 0) * servings,
          fats: (parsedData.nutritionPerServing.fats || 0) * servings,
          fiber: (parsedData.nutritionPerServing.fiber || 0) * servings,
        };
      }
      // Case 3: Fetch nutrition data from FoodModel using food_id
      else if (food_id) {
        const food = await FoodModel.findById(food_id);
        if (!food) {
          throw new Error('Food not found with provided food_id');
        }
        nutritionPerServing = {
          calories: food.nutritionPerServing.calories * servings,
          protein: food.nutritionPerServing.protein * servings,
          carbs: food.nutritionPerServing.carbs * servings,
          fats: food.nutritionPerServing.fats * servings,
          fiber: food.nutritionPerServing.fiber * servings,
        };
        servings = parsedData?.servings || food.servings; // Use food servings if not provided
      } else {
        throw new Error('Invalid input: Provide a valid file, nutrition data, or food_id');
      }
  
      // Validate nutritionPerServing
      if (
        nutritionPerServing.calories === undefined ||
        nutritionPerServing.protein === undefined ||
        nutritionPerServing.carbs === undefined ||
        nutritionPerServing.fats === undefined ||
        nutritionPerServing.fiber === undefined
      ) {
        throw new Error('All nutritionPerServing fields (calories, protein, carbs, fats, fiber) are required');
      }
  
      // Create consumed food payload
      const consumedFoodPayload: TUserConsumedFood = {
        user_id,
        consumedAs,
        nutritionPerServing,
        servings,
      };
  
      // Save to UserConsumedFoodModel
      const consumedFood = new UserConsumedFoodModel(consumedFoodPayload);
      const savedConsumedFood = await consumedFood.save();
      console.log('Consumed food saved:', savedConsumedFood._id);
  
      return savedConsumedFood;
    } catch (error: any) {
      console.error('Error creating consumed food:', error);
      throw new Error(
        error.message || 'Failed to create consumed food due to an internal error.'
      );
    }
  };
  



  const foodLoadingServices= {
    addFoodManually,addPersonalizeFoodManually,addConsumedFoodFromImgOrQRCodeOrFoodId
  }

  export default foodLoadingServices