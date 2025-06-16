import { Types } from "mongoose";

export type TFood={
    img:string;
    user_id?:Types.ObjectId;
    name:string;
    ingredients?:[string];
    instructions?:string;
    servings:number;
    preparationTime:number;
    nutritionPerServing:{
        calories:number;
        protein:number;
        carbs:number;
        fats:number;
        fiber:number;
    }
}

export type TUserConsumedFood={
    user_id:Types.ObjectId;
    consumedAs:"breakfast"|"lunch"|"dinner"|"snack";
    nutritionPerServing:{
        calories:number;
        protein:number;
        carbs:number;
        fats:number;
        fiber:number;
    }
    servings:number;
}