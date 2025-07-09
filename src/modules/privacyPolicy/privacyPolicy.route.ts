import express from 'express';
import * as privacyPolicyController from './privacyPolicy.controller';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';

const privacyPolicyRoutes = express.Router();

privacyPolicyRoutes.post('/create', auth([userRole.admin]), privacyPolicyController.createPolicy);
privacyPolicyRoutes.get('/get', privacyPolicyController.getPolicy);
privacyPolicyRoutes.patch('/update/:id', auth([userRole.admin]), privacyPolicyController.updatePolicy);
privacyPolicyRoutes.delete('/delete/:id', auth([userRole.admin]), privacyPolicyController.deletePolicy);

export default privacyPolicyRoutes;
