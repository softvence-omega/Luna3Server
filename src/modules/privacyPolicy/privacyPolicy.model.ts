import { Schema, model } from 'mongoose';
import { TPrivacyPolicy } from './privacyPolicy.interface';

const PrivacyPolicySchema = new Schema<TPrivacyPolicy>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    version: { type: String, default: '1.0' }, 
  },
  {
    timestamps: true,
  }
);

export const PrivacyPolicyModel = model<TPrivacyPolicy>('PrivacyPolicy', PrivacyPolicySchema);
