import { model, Schema } from "mongoose";
import { TFood, TUserConsumedFood } from "./food.interface";

const FoodSchema = new Schema<TFood>(
    {
      img: {
        type: String,
        required: true,
      },
      user_id: {
        type: Schema.Types.ObjectId,
        required: false,
      },
      name: {
        type: String,
        required: true,
      },
      ingredients: {
        type: [String],
        required: false,
      },
      instructions: {
        type: String,
        required: false,
      },
      servings: {
        type: Number,
        required: true,
      },
      preparationTime: {
        type: Number,
        required: false,
      },
      nutritionPerServing: {
        type: {
          calories: { type: Number, required: true, default:0 },
          protein: { type: Number, required: true, default:0 },
          carbs: { type: Number, required: true, default:0 },
          fats: { type: Number, required: true, default:0 },
          fiber: { type: Number, required: true, default:0 },
        },
        required: true,
      },
    },
    { timestamps: true }
  );
  
  const UserConsumedFoodSchema = new Schema<TUserConsumedFood>(
    {
      user_id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      consumedAs: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true,
      },
      nutritionPerServing: {
        type: {
          calories: { type: Number, required: true, default:0 },
          protein: { type: Number, required: true, default:0 },
          carbs: { type: Number, required: true, default:0 },
          fats: { type: Number, required: true, default:0 },
          fiber: { type: Number, required: true, default:0 },
        },
        required: true,
      },
      servings: {
        type: Number,
        required: true,
      },
    },
    { timestamps: true }
  );
  
  // Models
  export const FoodModel = model<TFood>('FoodCollection', FoodSchema);
  export const UserConsumedFoodModel = model<TUserConsumedFood>('UserConsumedFood', UserConsumedFoodSchema);