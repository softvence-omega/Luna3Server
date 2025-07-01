import { Request, Response } from 'express';
import { TipService } from './tips.service';
import { uploadVideoToCloudinary } from '../../util/uploadVideoToCloudinary';
import { TTip } from './tips.interface';

const createTip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      res.status(401).json({ message: 'Unauthorized! Please login.' });

    let parsedData;
    try {
      parsedData = JSON.parse(req.body.data);
    } catch {
      res.status(400).json({ message: 'Invalid JSON format in "data"' });
    }

    const tip = await TipService.createTip(
      {
        ...parsedData,
        userId,
      },
      req.file?.path,
    );

    res.status(201).json(tip);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// const getAllTips = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     const tips = await TipService.getTips(userId);
//     res.json(tips);
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
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
  try {
    const userId = req.user?.id;
    const tip = await TipService.getTipById(req.params.id);
    if (!tip) res.status(404).json({ message: 'Tip not found' });

    res.json(tip);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTips = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      res.status(401).json({ message: 'Unauthorized! Please login.' });

    const tips = await TipService.getTipsByUserId(userId);
    res.json(tips);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const updateTip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      res.status(401).json({ message: 'Unauthorized! Please login.' });

    const tip = await TipService.getTipById(req.params.id);
    if (!tip) {
      res.status(404).json({ message: 'Tip not found!' });
      return;
    }

    if (tip.userId !== userId)
      res.status(403).json({ message: 'Forbidden! Not your tip.' });

    let parsedData: Partial<TTip> = {};

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
      const upload = await uploadVideoToCloudinary(safeName, req.file.path);
      parsedData.video = upload.secure_url;
    }

    const updatedTip = await TipService.updateTip(req.params.id, parsedData);
    res.json(updatedTip);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      res.status(401).json({ message: 'Unauthorized! Please login.' });

    const tip = await TipService.getTipById(req.params.id);
    if (!tip) {
      res.status(404).json({ message: 'Tip not found!' });
      return;
    }

    if (tip.userId !== userId)
      res.status(403).json({ message: 'Forbidden! Not your tip.' });

    await TipService.deleteTip(req.params.id);
    res.json({ message: 'Tip deleted successfully!' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Toggle save (favorite) tip
const toggleSaveTip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      res.status(401).json({ message: 'Unauthorized! Please login.' });

    const tipId = req.params.id;
    const result = await TipService.toggleSave(userId, tipId);
    res.json({
      message: `Tip ${result.saved ? 'saved' : 'unsaved'} successfully`,
      saved: result.saved,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Toggle like tip
const toggleLikeTip = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      res.status(401).json({ message: 'Unauthorized! Please login.' });

    const tipId = req.params.id;
    const result = await TipService.toggleLike(userId, tipId);
    res.json({
      message: `Tip ${result.liked ? 'liked' : 'unliked'} successfully`,
      liked: result.liked,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// const getSavedTips = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId)
//       res.status(401).json({ message: 'Unauthorized! Please login.' });

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
      res.status(401).json({ message: 'Unauthorized! Please login.' });
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
  toggleSaveTip,
  toggleLikeTip,
  getSavedTips
};
