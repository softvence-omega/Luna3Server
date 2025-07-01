import { Types } from 'mongoose';
import { uploadImgToCloudinary } from '../../../util/uploadImgToCludinary';
import { TTipArticle } from './article.interface';
import { TipArticleModel } from './article.model';
import { ProfileModel } from '../../user/user.model';

const createTip = async (
  data: any,
  filePath?: string,
): Promise<TTipArticle> => {
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
    favCount: 0,
    userId: data.userId,
  });

  return tip;
};

// const getTips = async (userId?: string) => {
//   const tips = await TipArticleModel.find().sort({ createdAt: -1 });

//   if (!userId) return tips;

//   const profile = await ProfileModel.findOne({ user_id: userId }).lean();
//   const savedTips = profile?.savedArticleTips?.map(id => id.toString()) || [];
//   const likedTips = profile?.likedArticleTips?.map(id => id.toString()) || [];

//   return tips.map(tip => {
//     const tipIdStr = tip._id.toString();
//     return {
//       ...tip.toObject(),
//       saved: savedTips.includes(tipIdStr),
//       liked: likedTips.includes(tipIdStr),
//     };
//   });
// };

const getTips = async (
  userId?: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  const filter: any = {};

  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const total = await TipArticleModel.countDocuments(filter);

  const tips = await TipArticleModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!userId) return { tips, total };

  const profile = await ProfileModel.findOne({ user_id: userId }).lean();
  const savedTips = profile?.savedArticleTips?.map((id) => id.toString()) || [];
  const likedTips = profile?.likedArticleTips?.map((id) => id.toString()) || [];

  const tipsWithFlags = tips.map((tip) => {
    const tipIdStr = tip._id.toString();
    return {
      ...tip.toObject(),
      saved: savedTips.includes(tipIdStr),
      liked: likedTips.includes(tipIdStr),
    };
  });

  return { tips: tipsWithFlags, total };
};

const toggleSave = async (userId: string, articleId: string) => {
  const profile = await ProfileModel.findOne({ user_id: userId });
  if (!profile) throw new Error('Profile not found');

  const isAlreadySaved = profile.savedArticleTips?.some(
    (id) => id.toString() === articleId,
  );

  await ProfileModel.updateOne(
    { user_id: userId },
    {
      [isAlreadySaved ? '$pull' : '$addToSet']: { savedArticleTips: articleId },
    },
  );

  return { saved: !isAlreadySaved };
};

const toggleLike = async (userId: string, articleId: string) => {
  const profile = await ProfileModel.findOne({ user_id: userId });
  if (!profile) throw new Error('Profile not found');

  const isAlreadyLiked = profile.likedArticleTips?.some(
    (id) => id.toString() === articleId,
  );

  await ProfileModel.updateOne(
    { user_id: userId },
    {
      [isAlreadyLiked ? '$pull' : '$addToSet']: { likedArticleTips: articleId },
    },
  );

  await TipArticleModel.updateOne(
    { _id: articleId },
    { $inc: { favCount: isAlreadyLiked ? -1 : 1 } },
  );

  return { liked: !isAlreadyLiked };
};

const getTipsByUserId = (userId: string) =>
  TipArticleModel.find({ userId }).sort({ createdAt: -1 });

const getTipById = (id: string) => TipArticleModel.findById(id);

const updateTip = async (
  id: string,
  userId: string,
  data: Partial<TTipArticle>,
) => {
  const tip = await TipArticleModel.findOne({ _id: id, userId });
  if (!tip) throw new Error("Tip not found or you're not the owner!");

  return TipArticleModel.findByIdAndUpdate(id, data, { new: true });
};

const deleteTip = async (id: string, userId: string) => {
  const tip = await TipArticleModel.findOne({ _id: id, userId });
  if (!tip) throw new Error("Tip not found or you're not the owner!");

  return TipArticleModel.findByIdAndDelete(id);
};

// const getSavedTipsByUserId = async (userId: string) => {
//   const profile = await ProfileModel.findOne({ user_id: userId });
//   if (!profile) throw new Error('Profile not found');

//   const savedIds = profile.savedArticleTips || [];

//   const tips = await TipArticleModel.find({
//     _id: { $in: savedIds },
//   }).sort({ createdAt: -1 });

//   return tips;
// };

const getSavedTipsByUserId = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  search: string = ''
) => {
  const profile = await ProfileModel.findOne({ user_id: userId });
  if (!profile) throw new Error('Profile not found');

  const savedIds = profile.savedArticleTips || [];

  const query: any = {
    _id: { $in: savedIds },
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },     // case-insensitive
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await TipArticleModel.countDocuments(query);

  const tips = await TipArticleModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: tips,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};


export const TipService = {
  createTip,
  getTips,
  getTipById,
  getTipsByUserId,
  updateTip,
  deleteTip,
  toggleSave,
  toggleLike,
  getSavedTipsByUserId
};
