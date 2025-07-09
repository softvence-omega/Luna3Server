import { PrivacyPolicyModel } from './privacyPolicy.model';
import { TPrivacyPolicy } from './privacyPolicy.interface';

export const createPrivacyPolicy = async (payload: TPrivacyPolicy) => {
  const result = await PrivacyPolicyModel.create(payload);
  return result;
};

export const getPrivacyPolicy = async () => {
  return await PrivacyPolicyModel.find().sort({ createdAt: -1 });
};

export const updatePrivacyPolicy = async (id: string, payload: Partial<TPrivacyPolicy>) => {
  return await PrivacyPolicyModel.findByIdAndUpdate(id, payload, { new: true });
};

export const deletePrivacyPolicy = async (id: string) => {
  return await PrivacyPolicyModel.findByIdAndDelete(id);
};
