import { uploadVideoToCloudinary } from "../../util/uploadVideoToCloudinary";
import { TTip } from "./tips.interface";
import { TipModel } from "./tips.model";


const createTip = async (
  data: any,
  filePath?: string,
): Promise<TTip> => {
  let videoUrl: string | undefined;

  if (!data.videoLink && !filePath) {
    throw new Error('Either video file or video link is required.');
  }

  if (filePath) {
    const name = data.title.replace(/\s+/g, '-').toLowerCase();
    const upload = await uploadVideoToCloudinary(name, filePath);
    videoUrl = upload.secure_url;
  }

  const tip = await TipModel.create({
    title: data.title,
    description: data.description,
    video: videoUrl,
    videoLink: data.videoLink,
    tag: data.tag || [],
    favCount: 0,
  });

  return tip;
};

const getTips = () => TipModel.find().sort({ createdAt: -1 });

const getTipById = (id: string) => TipModel.findById(id);

const updateTip = (id: string, data: Partial<TTip>) =>
  TipModel.findByIdAndUpdate(id, data, { new: true });

const deleteTip = (id: string) => TipModel.findByIdAndDelete(id);


export const TipService = {
  createTip,
  getTips,
  getTipById,
  updateTip,
  deleteTip,
};