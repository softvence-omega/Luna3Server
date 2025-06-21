import express from 'express';
import auth from '../../../middleware/auth';
import { userRole } from '../../../constents';
import { TipController } from './article.controller';
import { upload } from '../../../util/uploadImgToCludinary';

const articleRoute = express.Router();

articleRoute.post('/create-article', auth([userRole.admin, userRole.user]), upload.single('image'), TipController.createTip);

articleRoute.get('/all-articles', TipController.getAllTips);

articleRoute.get('/single-article/:id', TipController.getTip);

articleRoute.get('/my-articles', auth([userRole.admin, userRole.user]), TipController.getMyTips);

articleRoute.put('/update-article/:id', auth([userRole.admin, userRole.user]),upload.single('image'), TipController.updateTip);

articleRoute.delete('/delete-article/:id', auth([userRole.admin, userRole.user]), TipController.deleteTip);

export default articleRoute;