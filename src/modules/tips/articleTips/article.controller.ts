import { Request, Response } from 'express';
import { TipService } from './article.service';
import { uploadImgToCloudinary } from '../../../util/uploadImgToCludinary';
import { TTipArticle } from './article.interface';

const createTip = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized! Please login with credentials!!!' });
      }
  
      let parsedData;
      try {
        parsedData = JSON.parse(req.body.data);
      } catch {
        return res.status(400).json({ message: 'Invalid JSON format in "data"' });
      }
  
      const tip = await TipService.createTip(
        {
          ...parsedData,
          favCount: Number(parsedData.favCount) || 0,
          userId,
        },
        req.file?.path
      );
  
      res.status(201).json(tip);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
  

const getAllTips = async (_req: Request, res: Response) => {
  const tips = await TipService.getTips();
  res.json(tips);
};

const getTip = async (req: Request, res: Response) => {
  const tip = await TipService.getTipById(req.params.id);
  if (!tip) {
    res.status(404).json({ message: 'Tip not found' });
    return;
  }
  res.json(tip);
};

const getMyTips = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res
        .status(401)
        .json({ message: 'Unauthorized! Please login with credentials!!!' });
      return;
    }

    const tips = await TipService.getTipsByUserId(userId);
    res.json(tips);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

const updateTip = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const tip = await TipService.getTipById(req.params.id);
  
      if (!tip) {
        return res.status(404).json({ message: 'Tip not found!' });
      }
  
      if (tip.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden! Not your tip.' });
      }
  
      let parsedData: Partial<TTipArticle> = {};
  
      if (req.body.data) {
        try {
          parsedData = JSON.parse(req.body.data);
        } catch {
          return res.status(400).json({ message: 'Invalid JSON format in "data"' });
        }
      }
  
      if (parsedData.favCount !== undefined) {
        parsedData.favCount = Number(parsedData.favCount) || 0;
      }
  
      if (req.file?.path) {
        const name = parsedData.title || tip.title;
        const safeName = name.replace(/\s+/g, '-').toLowerCase();
        const upload = await uploadImgToCloudinary(safeName, req.file.path);
        parsedData.image = upload.secure_url;
      }
  
      const updatedTip = await TipService.updateTip(req.params.id, userId, parsedData);
      res.json(updatedTip);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
  
  

const deleteTip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const tip = await TipService.getTipById(req.params.id);

    if (!tip) {
      res.status(404).json({ message: 'Tip not found!' });
      return;
    }

    if (tip.userId !== userId) {
      res.status(403).json({ message: 'Forbidden! Not your tip.' });
      return;
    }

    await TipService.deleteTip(req.params.id, userId);
    res.json({ message: 'Tip deleted successfully!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const TipController = {
  createTip,
  getAllTips,
  getTip,
  getMyTips,
  updateTip,
  deleteTip,
};
