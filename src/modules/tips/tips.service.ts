import { uploadVideoToCloudinary } from '../../util/uploadVideoToCloudinary';
import { TTip } from './tips.interface';
import { TipModel } from './tips.model';

const createTip = async (data: any, filePath?: string): Promise<TTip> => {
  let videoUrl: string;

  // Check for required video input
  if (!data.video && !filePath) {
    throw new Error('Either video file or video URL is required.');
  }

  // Check for duplicate title
  const existingData = await TipModel.findOne({
    title: data.title,
    userId: data.userId,
  });
  if (existingData) {
    throw new Error('You have already created a tip with this title!');
  }

  // Upload or use provided video URL
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
    favCount: Number(data.favCount) || 0,
    userId: data.userId,
  });

  return tip;
};


const getTips = () => TipModel.find().sort({ createdAt: -1 });

const getTipById = (id: string) => TipModel.findById(id);

const getTipsByUserId = (userId: string) =>
  TipModel.find({ userId }).sort({ createdAt: -1 });

const updateTip = async (id: string, userId: string, data: Partial<TTip>) => {
  const tip = await TipModel.findOne({ _id: id, userId });
  if (!tip) {
    throw new Error("Tip not found or you're not the owner!");
  }

  return TipModel.findByIdAndUpdate(id, data, { new: true });
};

const deleteTip = (id: string, userId: string) => {
  const tip = TipModel.findOne({ _id: id, userId });
  if (!tip) {
    throw new Error("Tip not found or you're not the owner!");
  }

  return TipModel.findByIdAndDelete(id);
};

export const TipService = {
  createTip,
  getTips,
  getTipById,
  getTipsByUserId,
  updateTip,
  deleteTip,
};
