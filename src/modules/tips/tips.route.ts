import express from 'express';
import { uploadVideo } from '../../util/uploadVideoToCloudinary';
import { TipController } from './tips.controller';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';

const tipsRoute = express.Router();

tipsRoute.post('/create-tips', auth([userRole.admin]), uploadVideo.single('video'), TipController.createTip);
tipsRoute.get('/all-tips', auth([userRole.admin, userRole.user]), TipController.getAllTips);
tipsRoute.get('/single-tip/:id', auth([userRole.admin, userRole.user]), TipController.getTip);
tipsRoute.get('/my-tips', auth([userRole.admin, userRole.user]), TipController.getMyTips);
tipsRoute.put('/update-tip/:id', auth([userRole.admin]), uploadVideo.single('video'), TipController.updateTip);
tipsRoute.delete('/delete-tip/:id', auth([userRole.admin]), TipController.deleteTip);

// Like/Save toggle
tipsRoute.patch('/save-tip/:id', auth([userRole.admin, userRole.user]), TipController.toggleSaveTip);
tipsRoute.patch('/like-tip/:id', auth([userRole.admin, userRole.user]), TipController.toggleLikeTip);

tipsRoute.get('/saved-videos', auth([userRole.admin, userRole.user]), TipController.getSavedTips);

export default tipsRoute;
