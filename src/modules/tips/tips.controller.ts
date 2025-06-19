import { Request, Response } from 'express';
import { TipService } from './tips.service';

const createTip = async (req: Request, res: Response) => {
  try {
    const tip = await TipService.createTip(req.body, req.file?.path);
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
  if (!tip) res.status(404).json({ message: 'Tip not found' });
  res.json(tip);
};

const updateTip = async (req: Request, res: Response) => {
  const tip = await TipService.updateTip(req.params.id, req.body);
  if (!tip) res.status(404).json({ message: 'Tip not found' });
  res.json(tip);
};

const deleteTip = async (req: Request, res: Response) => {
  const tip = await TipService.deleteTip(req.params.id);
  if (!tip) res.status(404).json({ message: 'Tip not found' });
  res.json({ message: 'Tip deleted successfully' });
};

export const TipController = {
  createTip,
  getAllTips,
  getTip,
  updateTip,
  deleteTip,
};
