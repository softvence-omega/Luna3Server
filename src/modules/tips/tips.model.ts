import { Schema, model } from 'mongoose';
import { TTip } from './tips.interface';

const TipSchema = new Schema<TTip>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    video: { type: String },
    tag: [{ type: String }],
    favCount: { type: Number, default: 0 },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export const TipModel = model<TTip>('Tip', TipSchema);