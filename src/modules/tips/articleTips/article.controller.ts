import { Request, Response } from 'express';
import { TipService } from './article.service';
import { uploadImgToCloudinary } from '../../../util/uploadImgToCludinary';
import { TTipArticle } from './article.interface';

const createTip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res
        .status(401)
        .json({ message: 'Unauthorized! Please login with credentials!!!' });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(req.body.data);
    } catch {
      res.status(400).json({ message: 'Invalid JSON format in "data"' });
    }

    const tip = await TipService.createTip(
      {
        ...parsedData,
        favCount: Number(parsedData.favCount) || 0,
        userId,
      },
      req.file?.path,
    );

    res.status(201).json(tip);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

const toggleSaveTip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const result = await TipService.toggleSave(userId, id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

const toggleLikeTip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const result = await TipService.toggleLike(userId, id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// const getAllTips = async (req: Request, res: Response) => {
//   const userId = req.user?.id;
//   const tips = await TipService.getTips(userId);
//   res.json(tips);
// };

const getAllTips = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const { tips, total } = await TipService.getTips(
      userId,
      page,
      limit,
      search,
    );

    res.json({
      data: tips,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
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
      res.status(404).json({ message: 'Tip not found!' });
      return;
    }

    if (tip.userId !== userId) {
      res.status(403).json({ message: 'Forbidden! Not your tip.' });
    }

    let parsedData: Partial<TTipArticle> = {};

    if (req.body.data) {
      try {
        parsedData = JSON.parse(req.body.data);
      } catch {
        res.status(400).json({ message: 'Invalid JSON format in "data"' });
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

    const updatedTip = await TipService.updateTip(
      req.params.id,
      userId,
      parsedData,
    );
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

// const getSavedTips = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       res.status(401).json({ message: 'Unauthorized!' });
//     }

//     const tips = await TipService.getSavedTipsByUserId(userId);
//     res.json(tips);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getSavedTips = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized!' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const result = await TipService.getSavedTipsByUserId(userId, page, limit, search);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


export const TipController = {
  createTip,
  getAllTips,
  getTip,
  getMyTips,
  updateTip,
  deleteTip,
  toggleLikeTip,
  toggleSaveTip,
  getSavedTips
};
