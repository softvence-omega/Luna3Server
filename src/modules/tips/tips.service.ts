import { Types } from 'mongoose';
import { uploadVideoToCloudinary } from '../../util/uploadVideoToCloudinary';
import { TTip } from './tips.interface';
import { TipModel } from './tips.model';
import { ProfileModel } from '../user/user.model';
import { TProfile } from '../user/user.interface'; // Adjust path as needed

const createTip = async (data: any, filePath?: string): Promise<TTip> => {
  let videoUrl: string;

  if (!data.video && !filePath) {
    throw new Error('Either video file or video URL is required.');
  }

  // Check if title already exists (no userId check, admin-created)
  const existingData = await TipModel.findOne({
    title: data.title,
  });
  if (existingData) {
    throw new Error('A tip with this title already exists!');
  }

  if (filePath) {
    const name = data.title.replace(/\s+/g, '-').toLowerCase();
    const upload = await uploadVideoToCloudinary(name, filePath);
    videoUrl = upload.secure_url;
  } else {
    videoUrl = data.video;
  }

  const tip = await TipModel.create({
    title: data.title,
    description: data.description,
    video: videoUrl,
    tag: data.tag || [],
    favCount: 0,
    userId: data.userId,
  });

  return tip;
};

const getTips = async (userId?: string) => {
  const tips = await TipModel.find().sort({ createdAt: -1 });

  if (!userId) return tips;

  // Get profile as plain object to avoid TS error
  const profile = (await ProfileModel.findOne({ user_id: userId }).lean()) as TProfile | null;

  return tips.map(tip => {
    const isSaved = profile?.savedVideoTips?.some(id => id.toString() === tip._id.toString()) ?? false;
    const isLiked = profile?.likedVideoTips?.some(id => id.toString() === tip._id.toString()) ?? false;

    return {
      ...tip.toObject(),
      saved: isSaved,
      liked: isLiked,
    };
  });
};

const toggleSave = async (userId: string, tipId: string) => {
  const profile = (await ProfileModel.findOne({ user_id: userId })) as (TProfile & { _id: any }) | null;
  if (!profile) throw new Error('Profile not found');

  const alreadySaved = profile.savedVideoTips?.some(id => id.toString() === tipId);

  await ProfileModel.updateOne(
    { user_id: userId },
    { [alreadySaved ? '$pull' : '$addToSet']: { savedVideoTips: new Types.ObjectId(tipId) } }
  );

  return { saved: !alreadySaved };
};

const toggleLike = async (userId: string, tipId: string) => {
  const profile = (await ProfileModel.findOne({ user_id: userId })) as (TProfile & { _id: any }) | null;
  if (!profile) throw new Error('Profile not found');

  const alreadyLiked = profile.likedVideoTips?.some(id => id.toString() === tipId);

  await ProfileModel.updateOne(
    { user_id: userId },
    { [alreadyLiked ? '$pull' : '$addToSet']: { likedVideoTips: new Types.ObjectId(tipId) } }
  );

  await TipModel.updateOne(
    { _id: tipId },
    { $inc: { favCount: alreadyLiked ? -1 : 1 } }
  );

  return { liked: !alreadyLiked };
};

const getTipById = (id: string) => TipModel.findById(id);
const getTipsByUserId = (userId: string) => TipModel.find({ userId }).sort({ createdAt: -1 });
const updateTip = (id: string, data: Partial<TTip>) => TipModel.findByIdAndUpdate(id, data, { new: true });
const deleteTip = (id: string) => TipModel.findByIdAndDelete(id);

export const TipService = {
  createTip,
  getTips,
  getTipById,
  getTipsByUserId,
  updateTip,
  deleteTip,
  toggleSave,
  toggleLike,
};
