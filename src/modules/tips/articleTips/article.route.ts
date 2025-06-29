import express from 'express';
import auth from '../../../middleware/auth';
import { userRole } from '../../../constents';
import { TipController } from './article.controller';
import { upload } from '../../../util/uploadImgToCludinary';

const articleRoute = express.Router();

articleRoute.post('/create-article', auth([userRole.admin]), upload.single('image'), TipController.createTip);

articleRoute.patch('/save-article/:id', auth([userRole.admin, userRole.user]), TipController.toggleSaveTip);
articleRoute.patch('/like-article/:id', auth([userRole.admin, userRole.user]), TipController.toggleLikeTip);

articleRoute.get('/all-articles', auth([userRole.admin, userRole.user]), TipController.getAllTips);

articleRoute.get('/single-article/:id', TipController.getTip);

articleRoute.get('/my-articles', auth([userRole.admin, userRole.user]), TipController.getMyTips);

articleRoute.put('/update-article/:id', auth([userRole.admin]),upload.single('image'), TipController.updateTip);

articleRoute.delete('/delete-article/:id', auth([userRole.admin, userRole.user]), TipController.deleteTip);

articleRoute.get('/saved-articles', auth([userRole.user]), TipController.getSavedTips);

export default articleRoute;