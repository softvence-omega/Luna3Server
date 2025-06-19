import express from 'express';
import { uploadVideo } from '../../util/uploadVideoToCloudinary';
import { TipController } from './tips.controller';

const router = express.Router();

router.post('/', uploadVideo.single('video'), TipController.createTip);
router.get('/', TipController.getAllTips);
router.get('/:id', TipController.getTip);
router.put('/:id', TipController.updateTip);
router.delete('/:id', TipController.deleteTip);

export default router;