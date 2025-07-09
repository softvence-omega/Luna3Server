import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import * as privacyPolicyService from './privacyPolicy.service';

export const createPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await privacyPolicyService.createPrivacyPolicy(req.body);
  res.status(201).json({ success: true, message: 'Policy created', data: result });
});

export const getPolicy = catchAsync(async (req: Request, res: Response) => {
  const result = await privacyPolicyService.getPrivacyPolicy();
  res.status(200).json({ success: true, data: result });
});

export const updatePolicy = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await privacyPolicyService.updatePrivacyPolicy(id, req.body);
  res.status(200).json({ success: true, message: 'Policy updated', data: result });
});

export const deletePolicy = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await privacyPolicyService.deletePrivacyPolicy(id);
  res.status(200).json({ success: true, message: 'Policy deleted' });
});
