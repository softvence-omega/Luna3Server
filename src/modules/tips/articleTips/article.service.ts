import { uploadImgToCloudinary } from "../../../util/uploadImgToCludinary";
import { TTipArticle } from "./article.interface";
import { TipArticleModel } from "./article.model";


const createTip = async (data: any, filePath?: string): Promise<TTipArticle> => {
    let imageUrl: string;
  
    if (!data.image && !filePath) {
      throw new Error('Either image file or image URL is required.');
    }
  
    const existingData = await TipArticleModel.findOne({
      title: data.title,
      userId: data.userId,
    });
    if (existingData) {
      throw new Error('You have already created an article with this title!');
    }
  
    if (filePath) {
      const name = data.title.replace(/\s+/g, '-').toLowerCase();
      const upload = await uploadImgToCloudinary(name, filePath);
      imageUrl = upload.secure_url;
    } else {
      imageUrl = data.image;
    }
  
    const tip = await TipArticleModel.create({
      title: data.title,
      description: data.description,
      image: imageUrl,
      tag: data.tag || [],
      favCount: Number(data.favCount) || 0,
      userId: data.userId,
    });
  
    return tip;
  };
  


const getTips = () => TipArticleModel.find().sort({ createdAt: -1 });

const getTipById = (id: string) => TipArticleModel.findById(id);

const getTipsByUserId = (userId: string) =>
    TipArticleModel.find({ userId }).sort({ createdAt: -1 });

const updateTip = async (id: string, userId: string, data: Partial<TTipArticle>) => {
  const tip = await TipArticleModel.findOne({ _id: id, userId });
  if (!tip) {
    throw new Error("Tip not found or you're not the owner!");
  }

  return TipArticleModel.findByIdAndUpdate(id, data, { new: true });
};

const deleteTip = (id: string, userId: string) => {
  const tip = TipArticleModel.findOne({ _id: id, userId });
  if (!tip) {
    throw new Error("Tip not found or you're not the owner!");
  }

  return TipArticleModel.findByIdAndDelete(id);
};

export const TipService = {
  createTip,
  getTips,
  getTipById,
  getTipsByUserId,
  updateTip,
  deleteTip,
};
